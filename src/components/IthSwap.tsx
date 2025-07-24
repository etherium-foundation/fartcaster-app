"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useBalance,
  useConnect,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWriteIthDeposit } from "@/wagmi/generated";

export default function IthSwap() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, error: writeError } = useWriteIthDeposit();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get user's ETH balance
  const { data: balance } = useBalance({
    address,
  });

  const handleSwap = async () => {
    if (!amount || !isConnected) return;

    try {
      setError(null);

      const amountWei = parseEther(amount);

      // Check if user has enough ETH
      if (balance && amountWei > balance.value) {
        setError("Insufficient ETH balance");
        return;
      }

      await writeContract({
        value: amountWei,
      });
    } catch (error) {
      console.error("Swap failed:", error);
      setError("Transaction failed. Please try again.");
    }
  };

  const handleMaxAmount = () => {
    if (balance) {
      // Leave some ETH for gas fees (0.001 ETH)
      const maxAmount = balance.value;
      if (maxAmount > 0n) {
        setAmount(formatEther(maxAmount));
      } else {
        setError("Insufficient ETH for gas fees");
      }
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError(null);
  };

  // Clear error when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      setError(null);
      setAmount("");
    }
  }, [isSuccess]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || "Transaction failed");
    }
  }, [writeError]);

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          Connect your wallet to swap ETH for ITH
        </p>
        <Button
          onClick={() => {
            if (connectors[0]) {
              connect({ connector: connectors[0] });
            }
          }}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 gap-2">
        <h2 className="text-2xl font-semibold leading-none tracking-tight text-center">
          Swap ETH to ITH
        </h2>
        <p className="text-sm text-gray-500 text-center">
          Wrap your ETH into ITH using the official ITH contract and show your
          love for Etherium!
        </p>
      </div>

      <div className="space-y-4">
        {/* Balance Display */}
        {balance && (
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Available Balance
            </p>
            <p className="text-2xl font-bold">
              {Number(formatEther(balance.value)).toFixed(6)} ETH
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Amount (ETH)
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.0"
                step="0.001"
                min="0"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button
              onClick={handleMaxAmount}
              variant="secondary"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
            >
              MAX
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            You&apos;ll receive
          </div>
          <div className="text-2xl font-bold">
            {amount ? `${amount} ITH` : "0 ITH"}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSwap}
          disabled={
            !amount || parseFloat(amount) <= 0 || isConfirming || !!error
          }
          className="w-full"
        >
          {isConfirming ? "Confirming..." : "Swap ETH to ITH"}
        </Button>

        {isSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <p className="font-medium">Swap successful!</p>
            <p className="text-sm text-green-600">
              Transaction: {hash?.slice(0, 10)}...{hash?.slice(-8)}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>
            ITH is ERC-20 compatible ETH that can be used in the ITH ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}
