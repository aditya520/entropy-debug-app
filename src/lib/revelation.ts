import { createPublicClient, http, parseEventLogs, publicActions } from 'viem'
import { EntropyAbi } from './EntropyAbi'
import { EntropyDeployment, EntropyDeployments } from "@/store/EntropyDeployments";



export async function requestCallback(txHash: string, chain: string) {
  const deployment = EntropyDeployments[chain]
  if (!deployment) {
    throw new Error(`Deployment for chain ${chain} not found`)
  }

  const { provider, sequenceNumber, userRandomNumber } = await fetchInfoFromTx(txHash, deployment)
  const revelation = await getRevelation(chain, Number(sequenceNumber))
  console.log("revelation", revelation)
  console.log("typeof revelation", typeof revelation)

  // It means the there is an error message
  if (typeof revelation === "string") {
    return "We found an error message: " + revelation
  } 
    
  if (typeof revelation === "object") {
    console.log("Hurray we found the revelation!: ", revelation)
    const message = `Please run the following command to reveal the randomness: cast send ${deployment.address} 'revealWithCallback(address, uint64, bytes32, bytes32)' ${provider} ${sequenceNumber} ${userRandomNumber} ${revelation.value.data} -r ${deployment.rpc} --private-key <YOUR_PRIVATE_KEY>`
    console.log("message", message)

    return message
  }
  
  return null
}

  export async function fetchInfoFromTx(txHash: string, deployment: EntropyDeployment) { 
    const publicClient = createPublicClient({
      transport: http(deployment.rpc)
    }).extend(publicActions)
    if (!publicClient) {
      throw new Error(`Public client for chain ${deployment} not found`)
    }
  
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`
    })
    if (!receipt) {
      throw new Error(`Transaction receipt not found for ${txHash}`)
    }
    console.log("receipt: ", receipt)

    const logs = parseEventLogs({
      abi: EntropyAbi,
      logs: receipt.logs,
      eventName: "RequestedWithCallback"
    })
    if (!logs) {
      throw new Error(`Logs not found for ${txHash}`)
    }
    console.log("logs: ", logs)
  
    const provider = logs[0].args.provider
    const sequenceNumber = logs[0].args.sequenceNumber
    const userRandomNumber = logs[0].args.userRandomNumber

    return { provider, sequenceNumber, userRandomNumber }
  }
  
export async function getRevelation(chain: string, sequenceNumber: number) {
  const deployment = EntropyDeployments[chain]
  if (!deployment) {
    throw new Error(`Deployment for chain ${chain} not found`)
  }

  let response: Response
  
  try {
      const isMainnet = deployment.network === "mainnet"
      const baseUrl = isMainnet 
        ? "https://fortuna.dourolabs.app" 
        : "https://fortuna-staging.dourolabs.app"
      
      response = await fetch(
        `${baseUrl}/v1/chains/${chain}/revelations/${sequenceNumber}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    } catch (error) {
      console.error("Error fetching revelation:", error)
      return null
    }

  if (response.status.toString().startsWith("4") || response.status.toString().startsWith("5")) {
    return await response.text()
  }

  return await response.json()
}