import { EntropyDeployments } from "@/store/EntropyDeployments";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createPublicClient, http } from 'viem'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidTxHash(hash: string) {
  const cleanHash = hash.toLowerCase().replace('0x', '');
  return /^[a-f0-9]{64}$/.test(cleanHash);
}

export async function fetchTopics(txHash: string, chain: string) {
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

  return receipt
}