"use client";

import { useState } from "react";
import { useMiniApp } from "@neynar/react";
import FrameEditor from "@/components/FrameEditor";
import IthSwap from "@/components/IthSwap";
import NftMint from "@/components/NftMint";
import MintedNfts from "@/components/MintedNfts";
import { APP_NAME } from "@/lib/constants";

export default function App(
  { title }: { title?: string } = { title: APP_NAME }
) {
  const { isSDKLoaded, context } = useMiniApp();
  const [activeTab, setActiveTab] = useState<
    "frames" | "swap" | "nft" | "gallery"
  >("nft");

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("frames")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "frames"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Frames
          </button>
          <button
            onClick={() => setActiveTab("swap")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "swap"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ITH Swap
          </button>
          <button
            onClick={() => setActiveTab("nft")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "nft"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            NFT Mint
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "gallery"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My NFTs
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "frames" && <FrameEditor />}
        {activeTab === "swap" && <IthSwap />}
        {activeTab === "nft" && <NftMint />}
        {activeTab === "gallery" && <MintedNfts />}
      </div>
    </div>
  );
}
