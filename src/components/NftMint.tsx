"use client";

import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useConnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import {
  useWriteIthnftSafeMint,
  useReadIthnftMintPrice,
  useReadIthnftTokenUri,
} from "@/wagmi/generated";
import { mainnet, baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShareButton } from "@/components/ui/Share";
import { formatEther } from "viem";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Sparkles,
  Wallet,
  Coins,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export default function NftMint() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [tokenId, setTokenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const contractAddress = "0x5b21eA285ca04807c31686fD6BAF9a80a46bA692"; //TODO: update with mainnet address
  const expectedChainId = baseSepolia.id; //TODO: update with mainnet chain id

  // Ref for success message scrolling
  const successMessageRef = useRef<HTMLDivElement>(null);

  const { data: mintPrice } = useReadIthnftMintPrice();

  // Read token URI when tokenId is available
  const { data: tokenUri } = useReadIthnftTokenUri({
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  // Write contract for minting
  const {
    writeContractAsync: safeMintNFT,
    data: hash,
    error: writeError,
  } = useWriteIthnftSafeMint();

  const {
    data: transactionReceipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
    chainId: expectedChainId,
  });

  // Function to decode base64 data
  const decodeBase64 = (data: string): string => {
    try {
      return atob(data);
    } catch (error) {
      console.error("Error decoding base64:", error);
      return data;
    }
  };

  // Function to fetch and decode NFT metadata
  const fetchNFTMetadata = async (uri: string) => {
    setIsLoadingMetadata(true);
    try {
      let metadataString: string;

      if (uri.startsWith("data:application/json;base64,")) {
        // Handle single base64 encoded metadata
        metadataString = decodeBase64(
          uri.replace("data:application/json;base64,", "")
        );
      } else if (uri.startsWith("data:application/json;")) {
        // Handle other data:application/json formats
        metadataString = decodeBase64(
          uri.replace("data:application/json;base64,", "")
        );
      } else {
        // Handle regular URI
        const response = await fetch(uri);
        metadataString = await response.text();
      }

      const metadata: NFTMetadata = JSON.parse(metadataString);

      // If image is base64 encoded, decode it
      if (metadata.image && metadata.image.startsWith("data:image/")) {
        // Image is already in data URL format
        setNftMetadata(metadata);
      } else if (
        metadata.image &&
        metadata.image.startsWith("data:image/;base64,")
      ) {
        // Handle base64 encoded image
        const imageData = decodeBase64(
          metadata.image.replace("data:image/;base64,", "")
        );
        metadata.image = `data:image/png;base64,${imageData}`;
        setNftMetadata(metadata);
      } else {
        setNftMetadata(metadata);
      }
    } catch (error) {
      console.error("Error fetching NFT metadata:", error);
      setError("Failed to load NFT metadata");
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Extract token ID from transaction receipt
  useEffect(() => {
    if (transactionReceipt && isSuccess) {
      try {
        // Look for Transfer event in logs to find the token ID
        const transferEvent = transactionReceipt.logs.find((log) => {
          // Check if this is a Transfer event (topic 0: Transfer(address,address,uint256))
          return (
            log.topics[0] ===
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
          );
        });

        if (transferEvent && transferEvent.topics.length >= 4) {
          // The token ID is in the 4th topic (index 3)
          const tokenIdHex = transferEvent.topics[3];
          if (tokenIdHex) {
            const tokenIdBigInt = BigInt(tokenIdHex);
            const tokenIdString = tokenIdBigInt.toString();
            setTokenId(tokenIdString);
            console.log("Extracted token ID:", tokenIdString);
          }
        }
      } catch (error) {
        console.error("Error extracting token ID:", error);
        setError("Failed to extract token ID from transaction");
      }
    }
  }, [transactionReceipt, isSuccess]);

  // Fetch metadata when token URI is available
  useEffect(() => {
    if (tokenUri && tokenId) {
      fetchNFTMetadata(tokenUri);
    }
  }, [tokenUri, tokenId]);

  // Open modal when NFT is successfully minted
  useEffect(() => {
    if (isSuccess && tokenId && nftMetadata) {
      setIsModalOpen(true);
    }
  }, [isSuccess, tokenId, nftMetadata]);

  // Scroll success message into view when it appears
  useEffect(() => {
    if (isSuccess && successMessageRef.current) {
      successMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isSuccess]);

  const handleMint = async () => {
    if (!isConnected) return;

    try {
      setError(null);
      setTokenId(null);
      setNftMetadata(null);
      setIsModalOpen(false);

      // Check if mint price is available
      if (!mintPrice) {
        setError("Mint price not available. Please try again.");
        return;
      }

      // Execute the actual mint transaction
      await safeMintNFT({
        args: [address as `0x${string}`],
        value: mintPrice,
      });
    } catch (error) {
      console.error("Mint failed:", error);
      setError("Transaction failed. Please try again.");
    }
  };

  // Clear error when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      setError(null);
    }
  }, [isSuccess]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || "Transaction failed");
    }
  }, [writeError]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center shadow-lg">
                <Wallet className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome to Etherium
              </h1>
              <p className="text-gray-600 text-lg">
                Connect your wallet to mint your commemorative NFT
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Mint Your NFT
                </h2>
                <p className="text-gray-600">
                  Join the Etherium celebration with your unique digital
                  collectible
                </p>
              </div>

              <Button
                onClick={() => {
                  if (connectors[0]) {
                    connect({ connector: connectors[0] });
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
        <div className="max-w-2xl mx-auto space-y-8">
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
                Mint NFT
              </h1>
              <p className="text-gray-600 text-lg">
                Create your commemorative Etherium digital collectible
              </p>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-2xl border border-white/20 space-y-8">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Minting Price */}
              {mintPrice && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-green-500 rounded-full p-2">
                      <Coins className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-700">
                      Price
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatEther(mintPrice)} ETH
                  </p>
                  <p className="text-xs text-green-600">One-time minting fee</p>
                </div>
              )}

              {/* Network Info - Only show if not on expected network */}
              {chainId !== expectedChainId && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-amber-500 rounded-full p-2">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-amber-700">
                      Network
                    </span>
                  </div>
                  <p className="text-lg font-bold text-amber-900">
                    {chainId === mainnet.id
                      ? "Ethereum Mainnet"
                      : `Chain ID: ${chainId}`}
                  </p>
                  <Button
                    onClick={() => switchChain({ chainId: expectedChainId })}
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full bg-white/50 hover:bg-white/80 border-amber-300 text-amber-700 hover:text-amber-800"
                  >
                    Switch to Base Sepolia
                  </Button>
                </div>
              )}
            </div>

            {/* Contract Address */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>NFT Contract Address</span>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={contractAddress}
                  readOnly
                  className="flex h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-red-700 break-words whitespace-pre-wrap">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mint Button */}
            <Button
              onClick={handleMint}
              disabled={
                !contractAddress || isConfirming || !!error || !mintPrice
              }
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              size="lg"
            >
              {isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Minting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Mint NFT
                </>
              )}
            </Button>

            {/* Success Message */}
            {isSuccess && (
              <div
                ref={successMessageRef}
                className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 flex items-center space-x-4"
              >
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold text-green-800">
                    NFT minted successfully!
                  </p>
                  <p className="text-sm text-green-600">
                    Transaction: {hash?.slice(0, 10)}...{hash?.slice(-8)}
                  </p>
                  {tokenId && (
                    <p className="text-sm text-green-600">
                      Token ID: {tokenId}
                    </p>
                  )}

                  {/* Loading state while getting NFT on-chain */}
                  {isSuccess && !nftMetadata && !isLoadingMetadata && (
                    <div className="mt-4 flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                      <p className="text-sm text-green-600">
                        Getting your NFT onchain...
                      </p>
                    </div>
                  )}

                  {/* Loading metadata state */}
                  {isLoadingMetadata && (
                    <div className="mt-4 flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                      <p className="text-sm text-green-600">
                        Loading your NFT metadata...
                      </p>
                    </div>
                  )}

                  {nftMetadata && (
                    <div className="mt-4">
                      <ShareButton
                        buttonText="Share NFT on Farcaster"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        cast={{
                          text: `Happy Birthday Etherium!!!\n\nI minted my commemorative NFT on the Etherium Mini App! 🎨\n\nGet yours from the Etherium Mini App!\n\nThe ticker is $ITH!`,
                          embeds: [
                            {
                              imageUrl: async () => nftMetadata.image,
                              tokenId: tokenId || "",
                              contractAddress: contractAddress,
                            },
                            {
                              url: "https://farcaster.xyz/miniapps/JJD7MR8eWb4u/etherium-app",
                            },
                          ],
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Etherium Banner */}
            <div className="text-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/etherium-banner.jpeg"
                  alt="Etherium"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFT Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <DialogHeader className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full blur-xl opacity-20"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Minted NFT
            </DialogTitle>
            <VisuallyHidden>
              <DialogDescription>
                Token ID: {tokenId} | Contract: {contractAddress}
              </DialogDescription>
            </VisuallyHidden>
          </DialogHeader>

          <div className="space-y-8">
            {isLoadingMetadata && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600 font-medium">
                  Loading your NFT metadata...
                </p>
              </div>
            )}

            {nftMetadata && (
              <div className="space-y-8">
                {/* NFT Image */}
                {nftMetadata.image && (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-3xl blur-xl opacity-30"></div>
                      <img
                        src={nftMetadata.image}
                        alt={nftMetadata.name}
                        className="relative w-full max-w-md mx-auto rounded-3xl "
                        onError={(e) => {
                          console.error("Error loading NFT image");
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* NFT Details */}
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {nftMetadata.name}
                    </h3>
                    {nftMetadata.description && (
                      <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                        {nftMetadata.description}
                      </p>
                    )}
                  </div>

                  {/* Share Button */}
                  <div className="flex justify-center">
                    <ShareButton
                      buttonText="Share NFT on Farcaster"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      cast={{
                        text: `Happy Birthday Etherium!!!\n\nI minted my commemorative NFT on the Etherium Mini App! 🎨\n\nGet yours from the Etherium Mini App!\n\nThe ticker is $ITH!`,
                        embeds: [
                          {
                            imageUrl: async () => nftMetadata.image,
                            tokenId: tokenId || "",
                            contractAddress: contractAddress,
                          },
                          {
                            url: "https://farcaster.xyz/miniapps/JJD7MR8eWb4u/etherium-app",
                          },
                        ],
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {tokenUri && !nftMetadata && !isLoadingMetadata && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 font-medium">
                  Token URI: {tokenUri.slice(0, 50)}...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Unable to decode metadata
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
