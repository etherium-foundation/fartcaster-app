"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { hexToBigInt } from "viem";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/Share";
import {
  Sparkles,
  Wallet,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  Heart,
} from "lucide-react";
import Image from "next/image";
import { ithnftAddress } from "@/wagmi/generated";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface AlchemyNFT {
  contract: {
    address: string;
  };
  id: {
    tokenId: `0x${string}`;
    tokenMetadata: {
      tokenType: string;
    };
  };
  title: string;
  description: string;
  tokenUri: {
    raw: string;
    gateway: string;
  };
  media: any[];
  metadata: {
    image: string;
    external_url?: string;
    name: string;
    description: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  timeLastUpdated: string;
  contractMetadata: {
    name: string;
    symbol: string;
    totalSupply: string;
    tokenType: string;
  };
}

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[];
  totalCount: number;
  blockHash: string;
}

interface UserNFT {
  tokenId: string;
  metadata: NFTMetadata | null;
  isLoading: boolean;
  error: string | null;
}

export default function MintedNfts() {
  const { address, isConnected } = useAccount();
  const [userNfts, setUserNfts] = useState<UserNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTsFromAlchemy = async (
    ownerAddress: string
  ): Promise<UserNFT[]> => {
    try {
      const params = new URLSearchParams({
        owner: ownerAddress,
      });

      const response = await fetch(`/api/my-nfts?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data: AlchemyResponse = await response.json();

      // Transform Alchemy NFTs to our UserNFT format
      const transformedNfts: UserNFT[] = data.ownedNfts.map((alchemyNft) => {
        // Convert hex tokenId to integer using Viem
        const tokenIdInt = hexToBigInt(alchemyNft.id.tokenId).toString();

        const nft: UserNFT = {
          tokenId: tokenIdInt,
          metadata: null,
          isLoading: false,
          error: null,
        };

        // Extract metadata from Alchemy response
        if (alchemyNft.metadata) {
          nft.metadata = {
            name:
              alchemyNft.metadata.name ||
              alchemyNft.title ||
              `NFT #${alchemyNft.id.tokenId}`,
            description:
              alchemyNft.metadata.description || alchemyNft.description || "",
            image: alchemyNft.metadata.image || "",
            attributes: alchemyNft.metadata.attributes || [],
          };
        } else {
          nft.error = "No metadata available";
        }

        return nft;
      });

      return transformedNfts;
    } catch (error) {
      console.error("Error fetching NFTs from Alchemy:", error);
      throw error;
    }
  };

  // Load user's NFTs using Alchemy API
  const loadUserNfts = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const nfts = await fetchNFTsFromAlchemy(address);
      setUserNfts(nfts);
    } catch (error) {
      console.error("Error loading user NFTs:", error);
      setError("Failed to load your NFTs");
    } finally {
      setIsLoading(false);
    }
  };

  // Load NFTs when user connects
  useEffect(() => {
    if (isConnected && address) {
      loadUserNfts();
    }
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center shadow-lg">
              <Wallet className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your NFT Gallery
            </h1>
            <p className="text-gray-600 text-lg">
              Connect your wallet to view your minted NFTs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-2 rounded-lg border border-white/20 shadow-lg">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your NFT Gallery
            </h1>
            <p className="text-gray-600 text-lg">
              Your collection of minted Etherium NFTs
            </p>
            {userNfts.length > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {userNfts.length} NFT
                  {userNfts.length !== 1 ? "s" : ""} Owned
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
                  ⚠️
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 font-medium">
                Loading your NFTs...
              </p>
            </div>
          )}

          {/* NFT Gallery */}
          {!isLoading && userNfts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userNfts.map((nft, index) => (
                <div
                  key={nft.tokenId}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {nft.isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">
                        Loading metadata...
                      </p>
                    </div>
                  ) : nft.error ? (
                    <div className="text-center py-8">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{nft.error}</p>
                    </div>
                  ) : nft.metadata ? (
                    <div className="space-y-4">
                      {/* NFT Image */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-xl blur-lg opacity-20"></div>
                        <img
                          src={nft.metadata.image}
                          alt={nft.metadata.name}
                          className="relative w-full h-48 object-cover rounded-xl"
                        />
                      </div>

                      {/* NFT Details */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {nft.metadata.name}
                        </h3>
                        {nft.metadata.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {nft.metadata.description}
                          </p>
                        )}

                        {/* Token ID and Mint Date */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Token ID: {nft.tokenId}</span>
                        </div>

                        {/* Share Button */}
                        <ShareButton
                          buttonText="Share NFT"
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          cast={{
                            text: `Check out my Etherium NFT! 🎨\n\nToken ID: ${nft.tokenId}\n\nMinted on the Etherium Mini App!\n\nThe ticker is $ITH!`,
                            embeds: [
                              {
                                imageUrl: async () => nft.metadata!.image,
                                tokenId: nft.tokenId,
                                contractAddress: ithnftAddress,
                              },
                              {
                                url: "https://farcaster.xyz/miniapps/JJD7MR8eWb4u/etherium-app",
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        No metadata available
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && userNfts.length === 0 && (
            <div className="text-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-white rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center shadow-lg">
                  <Sparkles className="w-12 h-12 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">
                No NFTs Found
              </h3>
              <p className="text-gray-600 mt-2">
                You haven't minted any NFTs yet. Head to the NFT Mint tab to get
                started!
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    loadUserNfts();
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          {userNfts.length > 0 && (
            <div className="text-center mt-8">
              <Button
                onClick={() => {
                  loadUserNfts();
                }}
                disabled={isLoading}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:text-gray-800 hover:border-gray-400 bg-white rounded-xl shadow-sm transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Gallery
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
