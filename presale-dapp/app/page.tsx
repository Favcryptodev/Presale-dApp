'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import PresaleManagement from '../components/PresaleManagement'

// Updated ABI of the Presale contract
const PRESALE_ABI = [
  "function rate() public view returns (uint256)",
  "function startTime() public view returns (uint256)",
  "function endTime() public view returns (uint256)",
  "function buyTokens() external payable",
  "function tokenBalances(address) public view returns (uint256)",
  "function owner() public view returns (address)",
  "function setRate(uint256 _rate) external",
  "function updateSaleTimes(uint256 _startTime, uint256 _endTime) external",
  "function withdrawFunds() external",
  "function withdrawRemainingTokens() external"
]

// Address of the deployed Presale contract
const PRESALE_ADDRESS = "0x..." // Replace with your actual contract address

export default function Home() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [address, setAddress] = useState<string>('')
  const [rate, setRate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isOwner, setIsOwner] = useState<boolean>(false)

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(web3Provider)

        const web3Signer = web3Provider.getSigner()
        setSigner(web3Signer)

        const presaleContract = new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, web3Signer)
        setContract(presaleContract)

        const addresses = await web3Provider.listAccounts()
        if (addresses.length > 0) {
          setAddress(addresses[0])
          updateBalance(presaleContract, addresses[0])
          checkOwner(presaleContract, addresses[0])
        }

        const rateValue = await presaleContract.rate()
        setRate(ethers.utils.formatEther(rateValue))

        const startTimeValue = await presaleContract.startTime()
        setStartTime(new Date(startTimeValue.toNumber() * 1000).toLocaleString())

        const endTimeValue = await presaleContract.endTime()
        setEndTime(new Date(endTimeValue.toNumber() * 1000).toLocaleString())
      }
    }

    init()
  }, [])

  const updateBalance = async (contract: ethers.Contract, address: string) => {
    const balanceValue = await contract.tokenBalances(address)
    setBalance(ethers.utils.formatEther(balanceValue))
  }

  const checkOwner = async (contract: ethers.Contract, address: string) => {
    const owner = await contract.owner()
    setIsOwner(owner.toLowerCase() === address.toLowerCase())
  }

  const handleConnect = async () => {
    if (provider) {
      await provider.send("eth_requestAccounts", [])
      const web3Signer = provider.getSigner()
      setSigner(web3Signer)
      const address = await web3Signer.getAddress()
      setAddress(address)
      if (contract) {
        updateBalance(contract, address)
        checkOwner(contract, address)
      }
    }
  }

  const handleBuy = async () => {
    if (contract && signer) {
      try {
        const tx = await contract.buyTokens({ value: ethers.utils.parseEther(amount) })
        await tx.wait()
        updateBalance(contract, await signer.getAddress())
        setAmount('')
      } catch (error) {
        console.error("Error buying tokens:", error)
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-[350px] mb-4">
        <CardHeader>
          <CardTitle>Presale dApp</CardTitle>
          <CardDescription>Buy tokens in our presale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!address ? (
              <Button onClick={handleConnect} className="w-full">Connect Wallet</Button>
            ) : (
              <>
                <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
                <p>Token Balance: {balance}</p>
                <p>Rate: {rate} tokens per ETH</p>
                <p>Start Time: {startTime}</p>
                <p>End Time: {endTime}</p>
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount in ETH"
                />
              </>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBuy} disabled={!address || !amount} className="w-full">
            Buy Tokens
          </Button>
        </CardFooter>
      </Card>
      {isOwner && contract && (
        <PresaleManagement contract={contract} />
      )}
    </main>
  )
}

