import { NextRequest, NextResponse } from "next/server";

// In-memory cache for storing image data (in production, use Redis or similar)
const imageCache = new Map<string, { data: string; contentType: string }>();

// Function to fetch NFT metadata from Alchemy API
async function fetchNFTMetadataFromAlchemy(
  contractAddress: string,
  tokenId: string
) {
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

  if (!ALCHEMY_API_KEY) {
    console.log("[NFT Image API] Error: Alchemy API key not configured");
    return null;
  }

  try {
    const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getNFTMetadata`;
    const params = new URLSearchParams({
      contractAddress,
      tokenId,
    });

    console.log("[NFT Image API] Fetching from Alchemy:", `${url}?${params}`);

    const response = await fetch(`${url}?${params}`);

    if (!response.ok) {
      console.log("[NFT Image API] Alchemy API error:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("[NFT Image API] Alchemy response structure:", {
      hasMetadata: !!data.metadata,
      hasImage: !!data.metadata?.image,
      imageType: typeof data.metadata?.image,
      imagePreview: data.metadata?.image
        ? data.metadata.image.startsWith("data:")
          ? data.metadata.image.substring(0, 50) + "..."
          : data.metadata.image.substring(0, 100) + "..."
        : "none",
    });

    return data;
  } catch (error) {
    console.error("[NFT Image API] Error fetching from Alchemy:", error);
    return null;
  }
}

// Function to extract contract address and token ID from cache key
function parseCacheKey(
  cacheKey: string
): { contractAddress: string; tokenId: string } | null {
  // Expected format: nft-{contractAddress}-{tokenId}-{timestamp}
  const parts = cacheKey.split("-");
  if (parts.length >= 4 && parts[0] === "nft") {
    return {
      contractAddress: parts[1],
      tokenId: parts[2],
    };
  }
  return null;
}

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

    let cachedImage = imageCache.get(cacheKey);
    console.log("[NFT Image API] Cached image found:", !!cachedImage);

    if (!cachedImage) {
      console.log(
        "[NFT Image API] Image not found in cache for key:",
        cacheKey
      );
      console.log(
        "[NFT Image API] Available cache keys:",
        Array.from(imageCache.keys())
      );

      // Try to fetch from Alchemy API
      const parsedKey = parseCacheKey(cacheKey);
      if (parsedKey) {
        console.log(
          "[NFT Image API] Attempting to fetch from Alchemy API:",
          parsedKey
        );

        const alchemyData = await fetchNFTMetadataFromAlchemy(
          parsedKey.contractAddress,
          parsedKey.tokenId
        );

        if (alchemyData && alchemyData.metadata && alchemyData.metadata.image) {
          console.log(
            "[NFT Image API] Found image in Alchemy metadata:",
            alchemyData.metadata.image.substring(0, 50) + "..."
          );

          // Handle base64 encoded image from Alchemy
          const imageData = alchemyData.metadata.image;
          let processedImage = imageData;
          let contentType = "image/svg+xml"; // Default for SVG

          // If it's already a data URL, use it as is
          if (imageData.startsWith("data:image/")) {
            processedImage = imageData;
            contentType =
              imageData.match(/data:([^;]+)/)?.[1] || "image/svg+xml";
          } else if (imageData.startsWith("data:image/;base64,")) {
            // Handle base64 without content type
            processedImage = `data:image/svg+xml;base64,${imageData.replace(
              "data:image/;base64,",
              ""
            )}`;
            contentType = "image/svg+xml";
          } else if (imageData.startsWith("data:")) {
            // Handle other data URL formats
            processedImage = imageData;
            contentType =
              imageData.match(/data:([^;]+)/)?.[1] || "image/svg+xml";
          } else if (imageData.startsWith("http")) {
            // It's a URL, store it as is for proxying
            processedImage = imageData;
            contentType = "image/png";
          } else {
            // Assume it's a raw base64 string and convert to data URL
            processedImage = `data:image/svg+xml;base64,${imageData}`;
            contentType = "image/svg+xml";
          }

          // Cache the processed image
          imageCache.set(cacheKey, {
            data: processedImage,
            contentType: contentType,
          });

          console.log(
            "[NFT Image API] Image cached from Alchemy. Cache size:",
            imageCache.size
          );

          // Get the cached image after Alchemy fetch
          cachedImage = imageCache.get(cacheKey);
        } else {
          console.log("[NFT Image API] No image found in Alchemy metadata");
          return new NextResponse("Image not found", { status: 404 });
        }
      } else {
        console.log(
          "[NFT Image API] Could not parse cache key for Alchemy lookup"
        );
        return new NextResponse("Image not found", { status: 404 });
      }
    }

    if (!cachedImage) {
      console.log("[NFT Image API] Image still not found after Alchemy fetch");
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
