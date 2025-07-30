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
      address: "0x5b21eA285ca04807c31686fD6BAF9a80a46bA692", //TODO: update with mainnet address
    },
  ],
  plugins: [react()],
});
