import { EntropyDeployments } from "@/store/EntropyDeployments";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createPublicClient, http, parseEventLogs } from 'viem'
import { EntropyAbi } from './EntropyAbi'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidTxHash(hash: string) {
  const cleanHash = hash.toLowerCase().replace('0x', '');
  return /^[a-f0-9]{64}$/.test(cleanHash);
}

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

export async function getRevelation(chain:string, sequenceNumber:number) {
  const deployment = EntropyDeployments[chain]
  if (!deployment) {
    throw new Error(`Deployment for chain ${chain} not found`)
  }

  try {
    const isMainnet = deployment.network === "mainnet"
    const response = await fetch(
      `/api/revelation?chain=${chain}&sequenceNumber=${sequenceNumber}&isMainnet=${isMainnet}`,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
    const data = await response.json()
    return data.value.data
  } catch (error) {
    console.error("Error fetching revelation:", error)
    return null
  }
}