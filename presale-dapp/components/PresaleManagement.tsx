import { useState } from 'react'
import { ethers } from 'ethers'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface PresaleManagementProps {
  contract: ethers.Contract
}

export default function PresaleManagement({ contract }: PresaleManagementProps) {
  const [newRate, setNewRate] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')

  const handleSetRate = async () => {
    try {
      const tx = await contract.setRate(ethers.utils.parseEther(newRate))
      await tx.wait()
      setNewRate('')
      alert('Rate updated successfully')
    } catch (error) {
      console.error("Error setting new rate:", error)
      alert('Error setting new rate')
    }
  }

  const handleUpdateSaleTimes = async () => {
    try {
      const startTimestamp = Math.floor(new Date(newStartTime).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(newEndTime).getTime() / 1000)
      const tx = await contract.updateSaleTimes(startTimestamp, endTimestamp)
      await tx.wait()
      setNewStartTime('')
      setNewEndTime('')
      alert('Sale times updated successfully')
    } catch (error) {
      console.error("Error updating sale times:", error)
      alert('Error updating sale times')
    }
  }

  const handleWithdrawFunds = async () => {
    try {
      const tx = await contract.withdrawFunds()
      await tx.wait()
      alert('Funds withdrawn successfully')
    } catch (error) {
      console.error("Error withdrawing funds:", error)
      alert('Error withdrawing funds')
    }
  }

  const handleWithdrawRemainingTokens = async () => {
    try {
      const tx = await contract.withdrawRemainingTokens()
      await tx.wait()
      alert('Remaining tokens withdrawn successfully')
    } catch (error) {
      console.error("Error withdrawing remaining tokens:", error)
      alert('Error withdrawing remaining tokens')
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Presale Management</CardTitle>
        <CardDescription>Manage presale settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="New Rate (tokens per ETH)"
            />
            <Button onClick={handleSetRate} className="mt-2 w-full">Set New Rate</Button>
          </div>
          <div>
            <Input
              type="datetime-local"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
            />
            <Input
              type="datetime-local"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="mt-2"
            />
            <Button onClick={handleUpdateSaleTimes} className="mt-2 w-full">Update Sale Times</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        <Button onClick={handleWithdrawFunds} className="w-full">Withdraw Funds</Button>
        <Button onClick={handleWithdrawRemainingTokens} className="w-full">Withdraw Remaining Tokens</Button>
      </CardFooter>
    </Card>
  )
}

