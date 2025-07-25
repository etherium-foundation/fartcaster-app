import { ImageResponse } from "next/og";
import { DEFAULT_OG_SIZE } from "@/lib/constants";

export const size = DEFAULT_OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const imageUrl = `${process.env.NEXT_PUBLIC_URL}/etherium.png`;

  return new ImageResponse(
    (
      <div tw="relative flex w-full h-full">
        <img
          src={imageUrl}
          alt="Etherium"
          width={DEFAULT_OG_SIZE.width}
          height={DEFAULT_OG_SIZE.height}
          tw="w-full h-full object-cover"
        />
      </div>
    ),
    {
      ...DEFAULT_OG_SIZE,
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=3600",
      },
    }
  );
}
