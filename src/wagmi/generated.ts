import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ITH
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ithAbi = [
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    constant: false,
    payable: false,
    type: "function",
    inputs: [
      { name: "guy", type: "address" },
      { name: "wad", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    constant: false,
    payable: false,
    type: "function",
    inputs: [
      { name: "src", type: "address" },
      { name: "dst", type: "address" },
      { name: "wad", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    constant: false,
    payable: false,
    type: "function",
    inputs: [{ name: "wad", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [{ name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    constant: false,
    payable: false,
    type: "function",
    inputs: [
      { name: "dst", type: "address" },
      { name: "wad", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    constant: false,
    payable: true,
    type: "function",
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
  },
  {
    constant: true,
    payable: false,
    type: "function",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  { payable: true, type: "fallback", stateMutability: "payable" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "src", type: "address", indexed: true },
      { name: "guy", type: "address", indexed: true },
      { name: "wad", type: "uint256", indexed: false },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "src", type: "address", indexed: true },
      { name: "dst", type: "address", indexed: true },
      { name: "wad", type: "uint256", indexed: false },
    ],
    name: "Transfer",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "dst", type: "address", indexed: true },
      { name: "wad", type: "uint256", indexed: false },
    ],
    name: "Deposit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "src", type: "address", indexed: true },
      { name: "wad", type: "uint256", indexed: false },
    ],
    name: "Withdrawal",
  },
] as const;

export const ithAddress = "0xC5471B96D3D8bB5d387C04139f4a3d0626D95330" as const;

export const ithConfig = { address: ithAddress, abi: ithAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ITHNFT
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ithnftAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "initialOwner", internalType: "address", type: "address" },
      { name: "_renderContract", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "owner", internalType: "address", type: "address" },
    ],
    name: "ERC721IncorrectOwner",
  },
  {
    type: "error",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC721InsufficientApproval",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC721InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "operator", internalType: "address", type: "address" }],
    name: "ERC721InvalidOperator",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "ERC721InvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC721InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC721InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ERC721NonexistentToken",
  },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "approved",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "operator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      { name: "approved", internalType: "bool", type: "bool", indexed: false },
    ],
    name: "ApprovalForAll",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "Transfer",
  },
  {
    type: "function",
    inputs: [],
    name: "MINT_PRICE",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "freezeRenderContract",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentMintingWindow",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "operator", internalType: "address", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isFrozen",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "renderContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "safeMint",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "quantity", internalType: "uint256", type: "uint256" },
    ],
    name: "safeMintBatch",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "operator", internalType: "address", type: "address" },
      { name: "approved", internalType: "bool", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_renderContract", internalType: "address", type: "address" },
    ],
    name: "setRenderContract",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "tokenSeeds",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "tokenId", internalType: "uint256", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    name: "windows",
    outputs: [
      { name: "start", internalType: "uint40", type: "uint40" },
      { name: "end", internalType: "uint40", type: "uint40" },
      { name: "windowNumber", internalType: "uint8", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address", type: "address" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const ithnftAddress =
  "0xe63CACD1337Bf20fF1A73cC73a3645667EEd6573" as const;

export const ithnftConfig = { address: ithnftAddress, abi: ithnftAbi } as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__
 */
export const useReadIth = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"name"`
 */
export const useReadIthName = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIthTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "totalSupply",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadIthDecimals = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "decimals",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIthBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIthSymbol = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadIthAllowance = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "allowance",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__
 */
export const useWriteIth = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIthApprove = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIthTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "transferFrom",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteIthWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "withdraw",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIthTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "transfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteIthDeposit = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "deposit",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__
 */
export const useSimulateIth = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIthApprove = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "approve",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIthTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithAbi,
    address: ithAddress,
    functionName: "transferFrom",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateIthWithdraw = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "withdraw",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIthTransfer = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "transfer",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateIthDeposit = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: "deposit",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__
 */
export const useWatchIthEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ithAbi,
  address: ithAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIthApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithAbi,
    address: ithAddress,
    eventName: "Approval",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIthTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithAbi,
    address: ithAddress,
    eventName: "Transfer",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchIthDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithAbi,
    address: ithAddress,
    eventName: "Deposit",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__ and `eventName` set to `"Withdrawal"`
 */
export const useWatchIthWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithAbi,
    address: ithAddress,
    eventName: "Withdrawal",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__
 */
export const useReadIthnft = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"MINT_PRICE"`
 */
export const useReadIthnftMintPrice = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "MINT_PRICE",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIthnftBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadIthnftGetApproved = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "getApproved",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"getCurrentMintingWindow"`
 */
export const useReadIthnftGetCurrentMintingWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "getCurrentMintingWindow",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadIthnftIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "isApprovedForAll",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"isFrozen"`
 */
export const useReadIthnftIsFrozen = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "isFrozen",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"name"`
 */
export const useReadIthnftName = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"owner"`
 */
export const useReadIthnftOwner = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadIthnftOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "ownerOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"renderContract"`
 */
export const useReadIthnftRenderContract = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "renderContract",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIthnftSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "supportsInterface",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIthnftSymbol = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"tokenSeeds"`
 */
export const useReadIthnftTokenSeeds = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "tokenSeeds",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadIthnftTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "tokenURI",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"windows"`
 */
export const useReadIthnftWindows = /*#__PURE__*/ createUseReadContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "windows",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__
 */
export const useWriteIthnft = /*#__PURE__*/ createUseWriteContract({
  abi: ithnftAbi,
  address: ithnftAddress,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIthnftApprove = /*#__PURE__*/ createUseWriteContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"freezeRenderContract"`
 */
export const useWriteIthnftFreezeRenderContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "freezeRenderContract",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteIthnftRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"safeMint"`
 */
export const useWriteIthnftSafeMint = /*#__PURE__*/ createUseWriteContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "safeMint",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"safeMintBatch"`
 */
export const useWriteIthnftSafeMintBatch = /*#__PURE__*/ createUseWriteContract(
  { abi: ithnftAbi, address: ithnftAddress, functionName: "safeMintBatch" }
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteIthnftSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "safeTransferFrom",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteIthnftSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "setApprovalForAll",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"setRenderContract"`
 */
export const useWriteIthnftSetRenderContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "setRenderContract",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIthnftTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "transferFrom",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteIthnftTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteIthnftWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: ithnftAbi,
  address: ithnftAddress,
  functionName: "withdraw",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__
 */
export const useSimulateIthnft = /*#__PURE__*/ createUseSimulateContract({
  abi: ithnftAbi,
  address: ithnftAddress,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIthnftApprove = /*#__PURE__*/ createUseSimulateContract(
  { abi: ithnftAbi, address: ithnftAddress, functionName: "approve" }
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"freezeRenderContract"`
 */
export const useSimulateIthnftFreezeRenderContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "freezeRenderContract",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateIthnftRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"safeMint"`
 */
export const useSimulateIthnftSafeMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "safeMint",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"safeMintBatch"`
 */
export const useSimulateIthnftSafeMintBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "safeMintBatch",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateIthnftSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "safeTransferFrom",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateIthnftSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "setApprovalForAll",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"setRenderContract"`
 */
export const useSimulateIthnftSetRenderContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "setRenderContract",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIthnftTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "transferFrom",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateIthnftTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithnftAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateIthnftWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithnftAbi,
    address: ithnftAddress,
    functionName: "withdraw",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithnftAbi}__
 */
export const useWatchIthnftEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ithnftAbi,
  address: ithnftAddress,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithnftAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIthnftApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithnftAbi,
    address: ithnftAddress,
    eventName: "Approval",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithnftAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchIthnftApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithnftAbi,
    address: ithnftAddress,
    eventName: "ApprovalForAll",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithnftAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchIthnftOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithnftAbi,
    address: ithnftAddress,
    eventName: "OwnershipTransferred",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithnftAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIthnftTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithnftAbi,
    address: ithnftAddress,
    eventName: "Transfer",
  });
