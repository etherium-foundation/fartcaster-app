import { NextRequest, NextResponse } from "next/server";
import { ithnftAddress } from "@/wagmi/generated";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");

    if (!owner) {
      return NextResponse.json(
        { error: "Owner address is required" },
        { status: 400 }
      );
    }

    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

    if (!ALCHEMY_API_KEY) {
      return NextResponse.json(
        { error: "Alchemy API key not configured" },
        { status: 500 }
      );
    }
    const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getNFTs`;

    const params = new URLSearchParams({
      owner,
    });

    params.append("contractAddresses[]", ithnftAddress);

    console.log(`${url}?${params}`);

    // Make request to Alchemy API
    const response = await fetch(`${url}?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Alchemy API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Alchemy API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in NFT API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
