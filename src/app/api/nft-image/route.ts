import { NextRequest, NextResponse } from "next/server";

// In-memory cache for storing image data (in production, use Redis or similar)
const imageCache = new Map<string, { data: string; contentType: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, tokenId, contractAddress } = body;

    if (!image) {
      return new NextResponse("Missing image data", { status: 400 });
    }

    // Generate a unique cache key
    const cacheKey = `nft-${contractAddress}-${tokenId}-${Date.now()}`;
    
    // Store in cache
    if (image.startsWith("data:image/")) {
      const contentType = image.match(/data:([^;]+)/)?.[1] || "image/png";
      imageCache.set(cacheKey, { data: image, contentType });
    } else if (image.startsWith("http")) {
      // For regular URLs, we'll proxy them on GET request
      imageCache.set(cacheKey, { data: image, contentType: "image/png" });
    } else {
      return new NextResponse("Invalid image data", { status: 400 });
    }

    // Return the cache key for the GET request
    return NextResponse.json({ cacheKey });
  } catch (error) {
    console.error("Error storing NFT image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cacheKey = searchParams.get("key");

    if (!cacheKey) {
      return new NextResponse("Missing cache key", { status: 400 });
    }

    const cachedImage = imageCache.get(cacheKey);
    if (!cachedImage) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // If it's a data URL, convert it to a proper image response
    if (cachedImage.data.startsWith("data:image/")) {
      const base64Data = cachedImage.data.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      
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
      const response = await fetch(cachedImage.data);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": response.headers.get("content-type") || "image/png",
          "Cache-Control": "public, immutable, no-transform, max-age=3600",
        },
      });
    }

    return new NextResponse("Invalid image data", { status: 400 });
  } catch (error) {
    console.error("Error serving NFT image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
