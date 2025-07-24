import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  APP_BUTTON_TEXT,
  APP_DESCRIPTION,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_PRIMARY_CATEGORY,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_TAGS,
  APP_URL,
} from "./constants";
import { APP_SPLASH_URL } from "./constants";

interface MiniAppMetadata {
  version: string;
  name: string;
  iconUrl: string;
  homeUrl: string;
  imageUrl?: string;
  buttonTitle?: string;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
  webhookUrl?: string;
  description?: string;
  primaryCategory?: string;
  tags?: string[];
}

interface MiniAppManifest {
  accountAssociation?: {
    header: string;
    payload: string;
    signature: string;
  };
  frame: MiniAppMetadata;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: "next",
    imageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: "launch_frame",
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}

export async function getFarcasterMetadata(): Promise<MiniAppManifest> {
  if (!APP_URL) {
    throw new Error("NEXT_PUBLIC_URL not configured");
  }

  const accountAssociation = {
    header:
      "eyJmaWQiOjg0NzcxNywidHlwZSI6ImF1dGgiLCJrZXkiOiIweGUxZWZEQkUxMWI1QTIzODJCQmZhRDU4MThiMDk4OUViMzhlODU2MjQifQ",
    payload: "eyJkb21haW4iOiJmYXJ0Y2FzdGVyLWFwcC52ZXJjZWwuYXBwIn0",
    signature:
      "4AEie7eX9Rk51/yaM+417LjXFDRNDfsLvz4/MEbtbKh29QhnSsvQa6J7/fGq5BH2b0HqVAYEyzPzUJHuqNmWyRs=",
  };

  return {
    accountAssociation,
    frame: {
      version: "1",
      name: APP_NAME,
      iconUrl: APP_ICON_URL,
      homeUrl: APP_URL,
      imageUrl: APP_OG_IMAGE_URL,
      buttonTitle: APP_BUTTON_TEXT,
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      description: APP_DESCRIPTION,
      primaryCategory: APP_PRIMARY_CATEGORY,
      tags: APP_TAGS,
    },
  };
}
