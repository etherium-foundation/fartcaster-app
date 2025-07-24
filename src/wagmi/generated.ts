import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ITH
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ithAbi = [
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'guy', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'src', type: 'address' },
      { name: 'dst', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [{ name: 'wad', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: '', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'dst', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: true,
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: '', type: 'address' },
      { name: '', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  { payable: true, type: 'fallback', stateMutability: 'payable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'guy', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'dst', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'dst', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Withdrawal',
  },
] as const

export const ithAddress = '0xC5471B96D3D8bB5d387C04139f4a3d0626D95330' as const

export const ithConfig = { address: ithAddress, abi: ithAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__
 */
export const useReadIth = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"name"`
 */
export const useReadIthName = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIthTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadIthDecimals = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIthBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIthSymbol = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadIthAllowance = /*#__PURE__*/ createUseReadContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__
 */
export const useWriteIth = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIthApprove = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIthTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteIthWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIthTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteIthDeposit = /*#__PURE__*/ createUseWriteContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__
 */
export const useSimulateIth = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIthApprove = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIthTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ithAbi,
    address: ithAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateIthWithdraw = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIthTransfer = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ithAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateIthDeposit = /*#__PURE__*/ createUseSimulateContract({
  abi: ithAbi,
  address: ithAddress,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__
 */
export const useWatchIthEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ithAbi,
  address: ithAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIthApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithAbi,
    address: ithAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIthTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithAbi,
    address: ithAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchIthDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithAbi,
    address: ithAddress,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ithAbi}__ and `eventName` set to `"Withdrawal"`
 */
export const useWatchIthWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ithAbi,
    address: ithAddress,
    eventName: 'Withdrawal',
  })
