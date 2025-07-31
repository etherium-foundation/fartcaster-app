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
  useReadIthnftGetCurrentMintingWindow,
  ithnftAddress,
} from "@/wagmi/generated";
import { mainnet } from "wagmi/chains";
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
import { formatEther, parseEther } from "viem";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Sparkles,
  Wallet,
  Coins,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Heart,
} from "lucide-react";
import Image from "next/image";
import {
  format,
  formatDistanceToNow,
  fromUnixTime,
  intervalToDuration,
} from "date-fns";

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface MintingWindow {
  start: number;
  end: number;
  windowNumber: number;
}

// Hardcoded minting windows
const HARDCODED_WINDOWS: MintingWindow[] = [
  { start: 1753889173, end: 1753975573, windowNumber: 1 }, // 2025
  { start: 2069421973, end: 2069508373, windowNumber: 2 }, // 2035
  { start: 2385041173, end: 2385127573, windowNumber: 3 }, // 2045
  { start: 2700573973, end: 2700660373, windowNumber: 4 }, // 2055
  { start: 3016193173, end: 3016279573, windowNumber: 5 }, // 2065
  { start: 3331725973, end: 3331812373, windowNumber: 6 }, // 2075
  { start: 3647345173, end: 3647431573, windowNumber: 7 }, // 2085
  { start: 3962877973, end: 3962964373, windowNumber: 8 }, // 2095
  { start: 4278410773, end: 4278497173, windowNumber: 9 }, // 2105
  { start: 4593943573, end: 4594029973, windowNumber: 10 }, // 2115
];

export default function NftMint() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [tokenId, setTokenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUserRejection, setIsUserRejection] = useState(false);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(
    Math.floor(Date.now() / 1000)
  );

  const [isTippingModalOpen, setIsTippingModalOpen] = useState(false);
  const [selectedTipPercentage, setSelectedTipPercentage] = useState<
    number | null
  >(null);
  const [customTipAmount, setCustomTipAmount] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<bigint>(BigInt(0));

  const contractAddress = ithnftAddress;
  const expectedChainId = mainnet.id;

  const successMessageRef = useRef<HTMLDivElement>(null);

  const { data: mintPrice, error: mintPriceError } = useReadIthnftMintPrice();

  // Calculate tip amounts based on mint price
  const calculateTipAmount = (percentage: number): bigint => {
    if (!mintPrice) return BigInt(0);
    return (mintPrice * BigInt(percentage)) / BigInt(100);
  };

  const tipOptions = [
    { percentage: 15, amount: calculateTipAmount(15) },
    { percentage: 20, amount: calculateTipAmount(20) },
    { percentage: 25, amount: calculateTipAmount(25) },
  ];

  const totalAmount = mintPrice ? mintPrice + tipAmount : BigInt(0);

  const handleTipSelection = (percentage: number | null, amount?: bigint) => {
    if (percentage === null) {
      setSelectedTipPercentage(null);
      setTipAmount(BigInt(0));
      setCustomTipAmount("");
    } else if (amount) {
      setSelectedTipPercentage(percentage);
      setTipAmount(amount);
      setCustomTipAmount("");
    }
  };

  const handleCustomTipClick = () => {
    setSelectedTipPercentage(-1); // Use -1 to indicate custom tip
    setCustomTipAmount("");
    setTipAmount(BigInt(0));
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTipAmount(value);
    setSelectedTipPercentage(-1);

    try {
      if (value && !isNaN(parseFloat(value))) {
        const customAmount = parseEther(value);
        setTipAmount(customAmount);
      } else {
        setTipAmount(BigInt(0));
      }
    } catch (error) {
      setTipAmount(BigInt(0));
    }
  };

  const handleTipConfirm = async () => {
    setIsTippingModalOpen(false);
    await executeMint();
  };

  const handleTipCancel = () => {
    setIsTippingModalOpen(false);
    setSelectedTipPercentage(null);
    setCustomTipAmount("");
    setTipAmount(BigInt(0));
  };

  const executeMint = async () => {
    if (!isConnected || !mintPrice) return;

    try {
      setError(null);
      setIsUserRejection(false);
      setTokenId(null);
      setNftMetadata(null);
      setIsModalOpen(false);

      // Execute the mint transaction with tip included
      await safeMintNFT({
        args: [address as `0x${string}`],
        value: totalAmount,
      });
    } catch (error) {
      console.error("Mint failed:", error);
      setError("Transaction failed. Please try again.");
    }
  };

  // Read current minting window from contract
  const { data: currentMintingWindowNumber } =
    useReadIthnftGetCurrentMintingWindow();

  const currentWindow = currentMintingWindowNumber
    ? HARDCODED_WINDOWS.find(
        (window) => window.windowNumber === currentMintingWindowNumber
      )
    : null;

  // Get next window from hardcoded windows
  const nextWindow = currentMintingWindowNumber
    ? HARDCODED_WINDOWS.find(
        (window) => window.windowNumber === currentMintingWindowNumber + 1
      ) || null // If no next window found (we're at the last window), return null
    : HARDCODED_WINDOWS[0]; // If no current window, show the first available window

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number): string => {
    return format(fromUnixTime(timestamp), "PPP 'at' p");
  };

  // Calculate time until next window using date-fns
  const getTimeUntilNextWindow = (): string => {
    if (!nextWindow) return "No future windows available";

    const nextWindowDate = fromUnixTime(nextWindow.start);
    return formatDistanceToNow(nextWindowDate, { addSuffix: true });
  };

  // Calculate time remaining in current window using date-fns
  const getTimeRemainingInWindow = (): string => {
    if (!currentWindow || !isMintingAvailable) return "";

    const now = new Date();
    const windowEnd = fromUnixTime(currentWindow.end);

    if (windowEnd <= now) return "Window closed";

    const duration = intervalToDuration({ start: now, end: windowEnd });

    // Custom compact format with abbreviated units
    const { days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(" ") || "0s";
  };

  // Get year from timestamp
  const getYearFromTimestamp = (timestamp: number): number => {
    return fromUnixTime(timestamp).getFullYear();
  };

  // Check if minting is available based on currentMintingWindowNumber
  // If currentMintingWindowNumber = 0, minting is closed
  // If currentMintingWindowNumber > 0, it's the active current window
  const isMintingAvailable =
    currentMintingWindowNumber !== undefined &&
    currentMintingWindowNumber > 0 &&
    currentWindow &&
    currentTime >= currentWindow.start &&
    currentTime <= currentWindow.end;

  useEffect(() => {
    if (mintPriceError) {
      setError("Mint price not available. Please try again.");
    }
  }, [mintPriceError]);

  const {
    data: tokenUri,
    isLoading: isLoadingTokenUri,
    error: tokenUriError,
    refetch: refetchTokenUri,
  } = useReadIthnftTokenUri({
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
      retry: 3,
      retryDelay: 2000, // 2 second delay between retries
    },
  });

  // Debug token URI loading for Mainnet issues
  useEffect(() => {
    if (tokenId) {
      console.log("Token URI state:", {
        tokenUri,
        isLoadingTokenUri,
        tokenUriError,
        tokenId,
        chainId: expectedChainId,
        isMainnet: expectedChainId === 1,
      });
    }
  }, [tokenUri, isLoadingTokenUri, tokenUriError, tokenId, expectedChainId]);

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
      console.log(
        "Fetching metadata for token:",
        tokenId,
        "on chain:",
        expectedChainId
      );
      fetchNFTMetadata(tokenUri);
    }
  }, [tokenUri, tokenId, expectedChainId]);

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

    // Check if minting is available
    if (!isMintingAvailable) {
      setError(
        "Minting is currently closed. Please return during the next minting window."
      );
      return;
    }

    // Check if mint price is available
    if (!mintPrice) {
      setError("Mint price not available. Please try again.");
      return;
    }

    // Open tipping modal instead of directly minting
    setIsTippingModalOpen(true);
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
      const errorMessage = writeError.message || "Transaction failed";

      // Check if this is a user rejection
      if (
        errorMessage.includes("User rejected the request") ||
        errorMessage.includes("User rejected") ||
        errorMessage.includes("rejected")
      ) {
        setIsUserRejection(true);
        setError("You rejected the mint");
      } else {
        setIsUserRejection(false);
        setError(errorMessage);
      }
    }
  }, [writeError]);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
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
                  } else {
                    setError("No wallet found. Please try again.");
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-2 rounded-lg border border-white/20 shadow-lg">
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
            {/* Minting Window Status */}
            {!isMintingAvailable && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-amber-500 rounded-full p-2">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-amber-700">
                    Minting Closed
                  </span>
                </div>
                <p className="text-lg font-bold text-amber-900">
                  Next Window: #{nextWindow?.windowNumber} (
                  {getYearFromTimestamp(nextWindow?.start || 0)})
                </p>
                <p className="text-xs text-amber-600">
                  Opens: {getTimeUntilNextWindow()}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Opens: {formatTimestamp(nextWindow?.start || 0)}
                </p>

                {/* Share Button with Humorous Message */}
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <ShareButton
                    buttonText="Share My FOMO 😅"
                    cast={{
                      text: `Oops! I missed the NFT minting window again! 😅 Now I have to wait until ${formatTimestamp(
                        nextWindow?.start || 0
                      )} for the next chance. The struggle is real! 🫠`,
                      embeds: [
                        {
                          url: "https://farcaster.xyz/miniapps/JJD7MR8eWb4u/etherium-app",
                        },
                      ],
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white border-amber-600 hover:border-amber-700 transition-colors duration-200"
                  />
                </div>
              </div>
            )}

            {/* Countdown Timer - Show when minting is available */}
            {isMintingAvailable && currentWindow && (
              <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-100 rounded-2xl p-6 border-2 border-red-300 shadow-xl hover:shadow-2xl transition-all duration-300 animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-red-500 rounded-full p-2 animate-bounce">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-red-700 animate-pulse">
                    ⚡ MINTING WINDOW CLOSING ⚡
                  </span>
                </div>
                {/* Countdown Timer */}
                <div className="mt-4 pt-4 border-t border-red-200">
                  <div className="text-center space-y-3">
                    <p className="text-sm font-bold text-red-700 uppercase tracking-wider">
                      ⚠️ Time Running Out! ⚠️
                    </p>
                    <div className="text-3xl font-black text-red-900 font-mono bg-white/50 rounded-xl p-4 border-2 border-red-400 animate-pulse">
                      {getTimeRemainingInWindow()}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-red-800">
                        🚨 DON&apos;T MISS YOUR CHANCE! 🚨
                      </p>
                      <p className="text-xs text-red-600">
                        💎 Next window opens {getTimeUntilNextWindow()} -
                        Don&apos;t wait!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    <span className="text-lg font-bold text-green-900">
                      {formatEther(mintPrice)} ETH
                    </span>
                  </div>
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
                      ? "Etherium Mainnet"
                      : `Chain ID: ${chainId}`}
                  </p>
                  <Button
                    onClick={async () => {
                      console.log("Switching chain to:", expectedChainId);
                      try {
                        await switchChain({ chainId: expectedChainId });
                        console.log("Switched chain to:", expectedChainId);
                      } catch (error) {
                        console.error("Failed to switch chain:", error);
                        setError(
                          "Failed to switch to Etherium Mainnet. Please try again."
                        );
                        setIsUserRejection(true);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full bg-white/50 hover:bg-white/80 border-amber-300 text-amber-700 hover:text-amber-800"
                  >
                    Switch to Etherium Mainnet
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
                  {isMintingAvailable ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
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
                    {isUserRejection && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Button
                          onClick={() => {
                            setError(null);
                            setIsUserRejection(false);
                          }}
                          variant="outline"
                          size="sm"
                          className="bg-white/50 hover:bg-white/80 border-red-300 text-red-700 hover:text-red-800"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mint Button */}
            <Button
              onClick={handleMint}
              disabled={
                !contractAddress ||
                isConfirming ||
                (!isUserRejection && !!error) ||
                !mintPrice ||
                !isMintingAvailable
              }
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              size="lg"
            >
              {isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Minting...
                </>
              ) : !isMintingAvailable ? (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Minting Closed
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
                  {tipAmount > BigInt(0) && (
                    <p className="text-sm text-green-600">
                      Tip: {formatEther(tipAmount)} ETH
                    </p>
                  )}

                  {/* Loading state while getting NFT on-chain */}
                  {isSuccess && !nftMetadata && !isLoadingMetadata && (
                    <div className="mt-4 flex flex-col items-center space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        <p className="text-sm text-green-600">
                          Getting your NFT onchain...
                        </p>
                      </div>
                      {tokenUriError && (
                        <div className="text-center">
                          <p className="text-xs text-red-500 mb-2">
                            Having trouble loading NFT data on Mainnet
                          </p>
                          <Button
                            onClick={() => refetchTokenUri()}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Retry Loading
                          </Button>
                        </div>
                      )}
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
                          text: `Happy Birthday Etherium!!!\n\nI minted my commemorative NFT on the Etherium Mini App! 🎨${
                            tipAmount > BigInt(0)
                              ? `\n\nI also left a ${formatEther(
                                  tipAmount
                                )} ETH tip to support the creators! 💝`
                              : ""
                          }\n\nGet yours from the Etherium Mini App!\n\nThe ticker is $ITH!\n\nPS: The next minting window is on July 30, 2035! Hurry up and get yours before it's too late!!!`,
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
              <a
                href="https://etherium.foundation/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform hover:scale-105 group"
                title="Visit the Etherium Foundation website"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/etherium-banner.jpeg"
                    alt="Etherium"
                    className="w-full h-auto"
                    width={650}
                    height={288}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </a>
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
                        className="relative w-full max-w-md mx-auto rounded-3xl object-contain"
                        width={500}
                        height={500}
                        style={{ minHeight: "300px" }}
                        onLoad={() => {
                          console.log("NFT image loaded successfully");
                        }}
                        onError={(e) => {
                          console.error("Error loading NFT image:", e);
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
                        text: `Happy Birthday Etherium!!!\n\nI minted my commemorative NFT on the Etherium Mini App! 🎨${
                          tipAmount > BigInt(0)
                            ? `\n\nI also left a ${formatEther(
                                tipAmount
                              )} ETH tip to support the creators! 💝`
                            : ""
                        }\n\nGet yours from the Etherium Mini App!\n\nThe ticker is $ITH!\n\nPS: The next minting window is on July 30, 2035! Hurry up and get yours before it's too late!!!`,
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

      {/* Tipping Modal */}
      <Dialog open={isTippingModalOpen} onOpenChange={setIsTippingModalOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <DialogHeader className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full blur-xl opacity-20"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-purple-700">
              Add a tip?
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Show your appreciation for the Etherium Foundation!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Percentage Tip Options */}
            <div className="grid grid-cols-3 gap-3">
              {tipOptions.map((option) => (
                <Button
                  key={option.percentage}
                  onClick={() =>
                    handleTipSelection(option.percentage, option.amount)
                  }
                  className={`flex flex-col items-center justify-center py-6 px-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    selectedTipPercentage === option.percentage
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl ring-2 ring-blue-300"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  }`}
                >
                  <span className="text-lg font-bold">
                    {option.percentage}%
                  </span>
                </Button>
              ))}
            </div>

            {/* Custom Tip Input */}
            <div className="space-y-3">
              <Button
                onClick={handleCustomTipClick}
                className={`w-full flex items-center justify-center py-4 px-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedTipPercentage === -1
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl ring-2 ring-blue-300"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                }`}
              >
                <span className="text-lg font-bold">Custom</span>
              </Button>

              {selectedTipPercentage === -1 && (
                <Input
                  type="text"
                  placeholder="Enter custom amount (e.g., 0.01)"
                  value={customTipAmount}
                  onChange={(e) => handleCustomTipChange(e.target.value)}
                  className="flex h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                />
              )}
            </div>

            {/* No Tip Option */}
            <Button
              onClick={() => handleTipSelection(null)}
              className={`w-full flex items-center justify-center py-4 px-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                selectedTipPercentage === null
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl ring-2 ring-blue-300"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              <span className="text-lg font-bold">No tip</span>
            </Button>

            {/* Total Amount Display */}
            <div className="text-center space-y-3 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatEther(totalAmount)} ETH
              </p>
              <p className="text-xs text-gray-500">
                Mint Price: {formatEther(mintPrice || BigInt(0))} ETH
                {tipAmount > BigInt(0) && (
                  <span className="ml-2">
                    + Tip: {formatEther(tipAmount)} ETH
                  </span>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleTipCancel}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:text-gray-800 hover:border-gray-400 bg-white rounded-xl shadow-sm transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTipConfirm}
                disabled={!isConnected || !mintPrice || isConfirming}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
