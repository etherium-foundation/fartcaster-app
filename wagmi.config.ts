import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";

import { ithAbi } from "./src/abi/ithAbi";
import { ithNftAbi } from "@/abi/ithNftAbi";

export default defineConfig({
  out: "src/wagmi/generated.ts",
  contracts: [
    {
      name: "ITH",
      abi: ithAbi,
      address: "0xC5471B96D3D8bB5d387C04139f4a3d0626D95330",
    },
    {
      name: "ITHNFT",
      abi: ithNftAbi,
      address: "0xe63CACD1337Bf20fF1A73cC73a3645667EEd6573",
    },
  ],
  plugins: [react()],
});
