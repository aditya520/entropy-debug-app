import { createPublicClient, http, parseEventLogs } from 'viem'
import { EntropyAbi } from './EntropyAbi'
import { EntropyDeployments } from "@/store/EntropyDeployments";


export async function fetchInfoFromTx(txHash: string, chain: string) {
    const deployment = EntropyDeployments[chain]
    if (!deployment) {
      throw new Error(`Deployment for chain ${chain} not found`)
    }
    console.log(deployment)
  
    const publicClient = createPublicClient({
      transport: http(deployment.rpc)
    })
  
    console.log(publicClient.chain)
  
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`
    })
  
    console.log(receipt)
  
    const logs = parseEventLogs({
      abi: EntropyAbi,
      logs: receipt.logs,
      eventName: "RequestedWithCallback"
    })
  
    console.log(logs)
    const provider = logs[0].args.provider
    const sequenceNumber = logs[0].args.sequenceNumber
    const userRandomNumber = logs[0].args.userRandomNumber
  
    const revelation = await getRevelation(chain, Number(sequenceNumber))
    console.log(revelation)
  
    return { provider, sequenceNumber, userRandomNumber, revelation }
  }
  
  export async function getRevelation(chain: string, sequenceNumber: number) {
    const deployment = EntropyDeployments[chain]
    if (!deployment) {
      throw new Error(`Deployment for chain ${chain} not found`)
    }
  
    try {
      const isMainnet = deployment.network === "mainnet"
      const baseUrl = isMainnet 
        ? "https://fortuna.dourolabs.app" 
        : "https://fortuna-staging.dourolabs.app"
      
      const response = await fetch(
        `${baseUrl}/v1/chains/${chain}/revelations/${sequenceNumber}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      if (response.status === 403) {
        const text = await response.text()
        return text
      }
      if (response.status === 200) {
        return await response.json()
      } else {
        return response
      }
    } catch (error) {
      console.error("Error fetching revelation:", error)
      return null
    }
  }