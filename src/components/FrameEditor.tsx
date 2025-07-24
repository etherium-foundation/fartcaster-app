"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { Button } from "~/components/ui/button";
import { ShareButton } from "~/components/ui/Share";
import { APP_URL } from "~/lib/constants";

interface Frame {
  id: string;
  name: string;
  description: string;
  color: string;
  text: string;
}

const FRAMES: Frame[] = [
  {
    id: "open-to-ith",
    name: "Open to ITH",
    description: "Show you're open to ITH",
    color: "#01754f",
    text: "#OPEN TO ITH",
  },
  {
    id: "send-ith",
    name: "Send ITH",
    description: "Show you're begging for ITH",
    color: "#0a66c2",
    text: "#SEND ITH",
  },
  {
    id: "celebrating-ith",
    name: "Celebrating ITH",
    description: "Show you're celebrating ITH",
    color: "#f5820d",
    text: "#CELEBRATING ITH",
  },
  {
    id: "ith-my-chain",
    name: "ITH My Chain",
    description: "Show they can ITH your chain. (you perv!)",
    color: "#7c3aed",
    text: "#ITH MY CHAIN",
  },
];

export default function FrameEditor() {
  const { context } = useMiniApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(FRAMES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );
  const [profileImage, setProfileImage] = useState<HTMLImageElement | null>(
    null
  );

  // Load user's profile image
  useEffect(() => {
    if (context?.user?.pfpUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setProfileImage(img);
      };
      img.onerror = () => {
        console.error("Failed to load profile image");
      };
      img.src = context.user.pfpUrl;
    }
  }, [context?.user?.pfpUrl]);

  const processImage = useCallback(async () => {
    if (!profileImage || !selectedFrame || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use larger canvas size for better quality
    const size = 800;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const imageRadius = size / 2;

    // Draw circular clip path for profile image
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, imageRadius, 0, Math.PI * 2);
    ctx.clip();

    // Calculate dimensions to maintain aspect ratio and fill the circle
    const imageSize = Math.min(profileImage.width, profileImage.height);
    const x = (profileImage.width - imageSize) / 2;
    const y = (profileImage.height - imageSize) / 2;
    ctx.drawImage(profileImage, x, y, imageSize, imageSize, 0, 0, size, size);
    ctx.restore();

    // Frame parameters - LinkedIn style partial arc (shifted left to avoid Farcaster checkmark)
    const arcShift = Math.PI * -0.1; // Adjustable shift to avoid platform checkmarks
    const startAngle = Math.PI * 0.2 - arcShift;
    const endAngle = Math.PI * 1.1 - arcShift;
    const frameWidth = 130; // Proportional to 800px canvas

    // Create gradient for frame edges (LinkedIn-style fade)
    const gradient = ctx.createLinearGradient(
      centerX + Math.cos(startAngle) * 450,
      centerY + Math.sin(startAngle) * 350,
      centerX + Math.cos(endAngle) * 450,
      centerY + Math.sin(endAngle) * 350
    );

    // Helper function to add alpha to hex color
    const colorWithAlpha = (color: string, alpha: number) => {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Add gradient stops with transparency for smooth fade
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.14, colorWithAlpha(selectedFrame.color, 0.95));
    gradient.addColorStop(0.5, selectedFrame.color);
    gradient.addColorStop(0.86, colorWithAlpha(selectedFrame.color, 0.95));
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    // Draw LinkedIn-style frame arc
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      imageRadius - frameWidth / 2,
      startAngle,
      endAngle
    );
    ctx.lineWidth = frameWidth;
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Draw curved text along the arc
    const text = selectedFrame.text;

    ctx.font = "bold 72px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add text shadow for better readability
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Calculate text placement along the arc (adjusted for shifted arc)
    const textRadius = 345;
    const textStartAngle = Math.PI * 0.46 - arcShift;
    const totalAngle = Math.PI * 0.6;

    // Draw each character along the arc (LinkedIn style)
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const angle = textStartAngle - (i / (text.length - 1)) * totalAngle;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.translate(0, textRadius);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Reset shadow for clean output
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Convert to blob and create URL
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setProcessedImageUrl(url);
      }
      setIsProcessing(false);
    }, "image/png");
  }, [profileImage, selectedFrame]);

  // Auto-process image when profile image loads and frame is selected
  useEffect(() => {
    if (profileImage && selectedFrame) {
      processImage();
    }
  }, [profileImage, selectedFrame, processImage]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert("Canvas not ready. Please apply a frame first.");
      return;
    }

    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;
    console.log("Is in iframe:", isInIframe);

    if (isInIframe) {
      // If in iframe, try to communicate with parent or use alternative method
      try {
        const dataURL = canvas.toDataURL("image/png");

        // Try to open in parent window if possible
        if (window.parent && window.parent !== window) {
          const newWindow = window.parent.open("", "_blank");
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head><title>Download Your Framed Profile Image</title></head>
                <body style="margin:20px;text-align:center;font-family:Arial,sans-serif;background:#f5f5f5;">
                  <div style="max-width:600px;margin:0 auto;background:white;padding:30px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color:#333;margin-bottom:20px;">Your Framed Profile Image</h2>
                    <img src="${dataURL}" style="max-width:100%;border-radius:8px;margin:20px 0;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <div style="margin-top:20px;padding:15px;background:#f8f9fa;border-radius:5px;">
                      <p style="margin:0;font-weight:bold;color:#555;">To save this image:</p>
                      <p style="margin:5px 0 0 0;color:#666;">Right-click the image above and select "Save image as..."</p>
                      <p style="margin:5px 0 0 0;font-size:14px;color:#888;">Suggested filename: profile-with-${
                        selectedFrame?.id || "frame"
                      }.png</p>
                    </div>
                  </div>
                </body>
              </html>
            `);
            return;
          }
        }

        // Try direct download first (sometimes works even in sandboxed iframes)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `profile-with-${selectedFrame?.id || "frame"}.png`;
              a.style.display = "none";
              document.body.appendChild(a);

              // Try multiple click approaches
              a.click();
              setTimeout(() => a.click(), 10);

              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 100);
            }
          },
          "image/png",
          1.0
        );

        // Wait a bit, then try clipboard fallback
        setTimeout(() => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(dataURL)
              .then(() => {
                alert(
                  "🎉 Image data copied to clipboard!\n\nTo save:\n• Open a new tab and paste the data URL in the address bar\n• Or paste into an image editor\n• Or use an online base64 to image converter"
                );
              })
              .catch(() => {
                showImageDataModal(dataURL);
              });
          } else {
            showImageDataModal(dataURL);
          }
        }, 500);
      } catch (error) {
        console.error("Iframe download fallback failed:", error);
        showImageDataModal(canvas.toDataURL("image/png"));
      }
    } else {
      // Normal download for non-iframe context
      try {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              alert("Failed to create image. Please try again.");
              return;
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `profile-with-${selectedFrame?.id || "frame"}.png`;
            a.style.display = "none";
            document.body.appendChild(a);

            setTimeout(() => {
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              console.log("Download completed");
            }, 10);
          },
          "image/png",
          1.0
        );
      } catch (error) {
        console.error("Download failed:", error);
        showImageDataModal(canvas.toDataURL("image/png"));
      }
    }

    function showImageDataModal(dataURL: string) {
      // Create a modal overlay with the image
      const modal = document.createElement("div");
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
      `;

      modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 90vw; max-height: 90vh; overflow: auto; text-align: center;">
          <h3 style="margin-top: 0; color: #333;">Save Your Framed Image</h3>
          <img src="${dataURL}" style="max-width: 100%; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">💾 How to save this image:</p>
            <p style="margin: 5px 0; color: #666;">• <strong>Right-click</strong> the image above and select "Save image as..."</p>
            <p style="margin: 5px 0; color: #666;">• Or <strong>drag</strong> the image to your desktop</p>
            <p style="margin: 5px 0; color: #666;">• Or <strong>long-press</strong> on mobile and save</p>
          </div>
          <p style="font-size: 14px; color: #888; margin: 10px 0;">Suggested filename: profile-with-${
            selectedFrame?.id || "frame"
          }.png</p>
          <div style="margin-top: 20px;">
            <button onclick="navigator.clipboard && navigator.clipboard.writeText('${dataURL}').then(() => alert('Image data copied to clipboard!')).catch(() => alert('Copy failed'))" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin: 5px;">📋 Copy Data</button>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin: 5px;">Close</button>
          </div>
        </div>
      `;

      // Close modal when clicking outside
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });

      document.body.appendChild(modal);
    }
  }, [selectedFrame]);

  if (!context?.user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] px-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to use the Frame Editor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Frame Editor</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add professional frames to your profile picture
        </p>
      </div>

      {/* Frame Selection */}
      <div>
        <h3 className="font-semibold mb-3">Choose a Frame</h3>
        <div className="grid grid-cols-2 gap-3">
          {FRAMES.map((frame) => (
            <div
              key={frame.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                selectedFrame?.id === frame.id
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-purple-300"
              }`}
              onClick={() => setSelectedFrame(frame)}
            >
              <div className="text-center">
                <div
                  className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: frame.color }}
                >
                  <span className="text-white font-bold text-xs">
                    {frame.name.charAt(0)}
                  </span>
                </div>
                <h4 className="font-medium text-xs">{frame.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {frame.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="font-semibold mb-3">Preview</h3>
        <div className="text-center">
          {!selectedFrame ? (
            <div className="w-56 h-56 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-sm">Select a frame to preview</p>
            </div>
          ) : processedImageUrl ? (
            <img
              src={processedImageUrl}
              alt="Framed profile"
              className="w-56 h-56 mx-auto rounded-lg shadow-md cursor-pointer"
              onContextMenu={(e) => {
                // Allow default right-click behavior for saving image
                e.stopPropagation();
              }}
              onClick={() => {
                // Also allow clicking the image to download
                downloadImage();
              }}
              title="Click to download or right-click to save"
            />
          ) : (
            <div className="w-56 h-56 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {isProcessing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm">Processing...</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Click &quot;Apply Frame&quot; to preview
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" width={800} height={800} />

      {/* Controls */}
      {processedImageUrl && (
        <div className="space-y-3">
          <Button
            onClick={downloadImage}
            variant="secondary"
            className="w-full"
          >
            Download Image
          </Button>
          <ShareButton
            buttonText="Share Frame"
            className="w-full"
            cast={{
              text: `Just framed my profile with ${selectedFrame?.name}! 🖼️\nThe ticker is $ITH\n\n${APP_URL}`,
              embeds: [
                {
                  imageUrl: async () => processedImageUrl,
                },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
