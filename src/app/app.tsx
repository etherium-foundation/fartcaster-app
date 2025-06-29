"use client";

import { useMiniApp } from "@neynar/react";
import FrameEditor from "~/components/FrameEditor";
import { APP_NAME } from "~/lib/constants";

export default function App(
  { title }: { title?: string } = { title: APP_NAME }
) {
  const { isSDKLoaded, context } = useMiniApp();

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
      <div className="mx-auto py-2 px-4">
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

        <FrameEditor />
      </div>
    </div>
  );
}
