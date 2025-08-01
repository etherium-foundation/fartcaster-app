"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMiniApp } from "@neynar/react";
import { type ComposeCast } from "@farcaster/frame-sdk";
import { Spinner } from "@/components/ui/spinner";

interface EmbedConfig {
  path?: string;
  url?: string;
  imageUrl?: () => Promise<string>;
  tokenId?: string;
  contractAddress?: string;
}

interface CastConfig extends Omit<ComposeCast.Options, "embeds"> {
  bestFriends?: boolean;
  embeds?: (string | EmbedConfig)[];
}

interface ShareButtonProps {
  buttonText: string;
  cast: CastConfig;
  className?: string;
  isLoading?: boolean;
}

export function ShareButton({
  buttonText,
  cast,
  className = "",
  isLoading = false,
}: ShareButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [bestFriends, setBestFriends] = useState<
    { fid: number; username: string }[] | null
  >(null);
  const [isLoadingBestFriends, setIsLoadingBestFriends] = useState(false);
  const { context, actions } = useMiniApp();

  // Fetch best friends if needed
  useEffect(() => {
    if (cast.bestFriends && context?.user?.fid) {
      setIsLoadingBestFriends(true);
      fetch(`/api/best-friends?fid=${context.user.fid}`)
        .then((res) => res.json())
        .then((data) => setBestFriends(data.bestFriends))
        .catch((err) => console.error("Failed to fetch best friends:", err))
        .finally(() => setIsLoadingBestFriends(false));
    }
  }, [cast.bestFriends, context?.user?.fid]);

  const handleShare = useCallback(async () => {
    try {
      setIsProcessing(true);

      let finalText = cast.text || "";

      // Process best friends if enabled and data is loaded
      if (cast.bestFriends) {
        if (bestFriends) {
          // Replace @N with usernames, or remove if no matching friend
          finalText = finalText.replace(/@\d+/g, (match) => {
            const friendIndex = parseInt(match.slice(1)) - 1;
            const friend = bestFriends[friendIndex];
            if (friend) {
              return `@${friend.username}`;
            }
            return ""; // Remove @N if no matching friend
          });
        } else {
          // If bestFriends is not loaded but bestFriends is enabled, remove @N patterns
          finalText = finalText.replace(/@\d+/g, "");
        }
      }

      // Process embeds
      const processedEmbeds = await Promise.all(
        (cast.embeds || []).map(async (embed) => {
          if (typeof embed === "string") {
            return embed;
          }
          if (embed.path) {
            const baseUrl =
              process.env.NEXT_PUBLIC_URL || window.location.origin;
            const url = new URL(`${baseUrl}${embed.path}`);

            // Add UTM parameters
            url.searchParams.set(
              "utm_source",
              `share-cast-${context?.user?.fid || "unknown"}`
            );

            // If custom image generator is provided, use it
            if (embed.imageUrl) {
              const imageUrl = await embed.imageUrl();
              url.searchParams.set("share_image_url", imageUrl);
            }

            return url.toString();
          }
          // Handle direct imageUrl function
          if (embed.imageUrl) {
            const imageUrl = await embed.imageUrl();

            // If it's a data URL, we need to upload it first
            if (imageUrl.startsWith("data:image/")) {
              const baseUrl =
                process.env.NEXT_PUBLIC_URL || window.location.origin;

              // Upload the image data
              const uploadResponse = await fetch(`${baseUrl}/api/nft-image`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  image: imageUrl,
                  tokenId: embed.tokenId,
                  contractAddress: embed.contractAddress,
                }),
              });

              if (uploadResponse.ok) {
                const { cacheKey } = await uploadResponse.json();
                return `${baseUrl}/api/nft-image?key=${cacheKey}`;
              }
            }

            return imageUrl;
          }
          return embed.url || "";
        })
      );

      // Open cast composer with all supported intents
      await actions.composeCast({
        text: finalText,
        embeds: processedEmbeds as [string] | [string, string] | undefined,
        parent: cast.parent,
        channelKey: cast.channelKey,
        close: cast.close,
      });
    } catch (error) {
      console.error("Failed to share:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [cast, bestFriends, context?.user?.fid, actions]);

  return (
    <Button
      onClick={handleShare}
      className={className}
      disabled={isLoadingBestFriends}
    >
      {isLoading || isProcessing ? <Spinner /> : buttonText}
    </Button>
  );
}
