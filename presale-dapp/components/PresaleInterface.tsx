'use client'

import { useState } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { parseEther } from "viem";

// Replace with your actual ABI and contract address
const PRESALE_ABI = [
  {
    "inputs": [],
    "name": "rate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];
const PRESALE_ADDRESS = "0x..."; // Replace with your deployed contract address

export default function PresaleInterface() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");

  const { data: rate } = useContractRead({
    address: PRESALE_ADDRESS,
    abi: PRESALE_ABI,
    functionName: "rate",
  });

  const { data: startTime } = useContractRead({
    address: PRESALE_ADDRESS,
    abi: PRESALE_ABI,
    functionName: "startTime",
  });

  const { data: endTime } = useContractRead({
    address: PRESALE_ADDRESS,
    abi: PRESALE_ABI,
    functionName: "endTime",
  });

  const { config } = usePrepareContractWrite({
    address: PRESALE_ADDRESS,
    abi: PRESALE_ABI,
    functionName: 'buyTokens',
    value: amount ? parseEther(amount) : undefined,
  })
  const { write: buyTokens } = useContractWrite(config)

  const handleBuy = () => {
    if (buyTokens) {
      buyTokens();
    }
  };

  return (
    <div className="space-y-4">
      <ConnectKitButton />
      {isConnected && (
        <>
          <div>Connected Address: {address}</div>
          <div>Rate: {rate ? rate.toString() : 'Loading...'} tokens per ETH</div>
          <div>Start Time: {startTime ? new Date(Number(startTime) * 1000).toLocaleString() : 'Loading...'}</div>
          <div>End Time: {endTime ? new Date(Number(endTime) * 1000).toLocaleString() : 'Loading...'}</div>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETH"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleBuy}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={!buyTokens}
          >
            Buy Tokens
          </button>
        </>
      )}
    </div>
  );
}

