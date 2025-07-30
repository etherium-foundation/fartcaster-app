import { NextRequest, NextResponse } from "next/server";

// In-memory cache for storing image data (in production, use Redis or similar)
const imageCache = new Map<string, { data: string; contentType: string }>();

export async function POST(request: NextRequest) {
  console.log("[NFT Image API] POST request received");

  try {
    const body = await request.json();
    const { image, tokenId, contractAddress } = body;
    console.log("[NFT Image API] Request data:", {
      tokenId,
      contractAddress,
      imageLength: image?.length || 0,
      imageType: image?.substring(0, 50) + (image?.length > 50 ? "..." : ""),
    });

    if (!image) {
      console.log("[NFT Image API] Error: Missing image data");
      return new NextResponse("Missing image data", { status: 400 });
    }

    // Generate a unique cache key
    const cacheKey = `nft-${contractAddress}-${tokenId}-${Date.now()}`;
    console.log("[NFT Image API] Generated cache key:", cacheKey);

    // Store in cache
    if (image.startsWith("data:image/")) {
      const contentType = image.match(/data:([^;]+)/)?.[1] || "image/png";
      console.log(
        "[NFT Image API] Storing data URL image with content type:",
        contentType
      );
      imageCache.set(cacheKey, { data: image, contentType });
      console.log(
        "[NFT Image API] Image stored in cache. Cache size:",
        imageCache.size
      );
    } else if (image.startsWith("http")) {
      console.log("[NFT Image API] Storing HTTP URL image:", image);
      imageCache.set(cacheKey, { data: image, contentType: "image/png" });
      console.log(
        "[NFT Image API] Image stored in cache. Cache size:",
        imageCache.size
      );
    } else {
      console.log("[NFT Image API] Error: Invalid image data format");
      return new NextResponse("Invalid image data", { status: 400 });
    }

    // Return the cache key for the GET request
    console.log(
      "[NFT Image API] Successfully processed image, returning cache key"
    );
    return NextResponse.json({ cacheKey });
  } catch (error) {
    console.error("[NFT Image API] Error storing NFT image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log("[NFT Image API] GET request received");

  try {
    const { searchParams } = new URL(request.url);
    const cacheKey = searchParams.get("key");

    console.log("[NFT Image API] Request URL:", request.url);
    console.log("[NFT Image API] Cache key from params:", cacheKey);

    if (!cacheKey) {
      console.log("[NFT Image API] Error: Missing cache key");
      return new NextResponse("Missing cache key", { status: 400 });
    }

    const cachedImage = imageCache.get(cacheKey);
    console.log("[NFT Image API] Cached image found:", !!cachedImage);

    if (!cachedImage) {
      console.log(
        "[NFT Image API] Error: Image not found in cache for key:",
        cacheKey
      );
      console.log(
        "[NFT Image API] Available cache keys:",
        Array.from(imageCache.keys())
      );
      return new NextResponse("Image not found", { status: 404 });
    }

    // If it's a data URL, convert it to a proper image response
    if (cachedImage.data.startsWith("data:image/")) {
      console.log("[NFT Image API] Processing data URL image");
      const base64Data = cachedImage.data.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      console.log(
        "[NFT Image API] Data URL processed, buffer size:",
        buffer.length
      );

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": cachedImage.contentType,
          "Cache-Control": "public, immutable, no-transform, max-age=3600",
        },
      });
    }

    // If it's a regular URL, proxy it
    if (cachedImage.data.startsWith("http")) {
      console.log("[NFT Image API] Proxying HTTP URL:", cachedImage.data);
      const response = await fetch(cachedImage.data);
      console.log("[NFT Image API] HTTP response status:", response.status);

      if (!response.ok) {
        console.log(
          "[NFT Image API] Error: HTTP request failed with status:",
          response.status
        );
        return new NextResponse("Failed to fetch image", {
          status: response.status,
        });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(
        "[NFT Image API] HTTP image processed, buffer size:",
        buffer.length
      );

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": response.headers.get("content-type") || "image/png",
          "Cache-Control": "public, immutable, no-transform, max-age=3600",
        },
      });
    }

    console.log("[NFT Image API] Error: Invalid image data format in cache");
    return new NextResponse("Invalid image data", { status: 400 });
  } catch (error) {
    console.error("[NFT Image API] Error serving NFT image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
