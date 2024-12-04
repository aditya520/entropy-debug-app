"use client"

import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo } from "react"
import { EntropyDeployments } from "@/store/EntropyDeployments"
import { isValidTxHash, fetchTopics } from "@/lib/utils"

export default function PythEntropyDebugApp() {
  const [isMainnet, setIsMainnet] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [selectedChain, setSelectedChain] = useState("");

  const validateTxHash = (hash: string) => {
    if (!isValidTxHash(hash) && hash !== "") {
      setError("Transaction hash must be 64 hexadecimal characters");
    } else {
      setError("");
    }
    setTxHash(hash);
  };

  const availableChains = useMemo(() => {
    return Object.entries(EntropyDeployments)
      .filter(([_, deployment]) => deployment.network === (isMainnet ? "mainnet" : "testnet"))
      .map(([key, _]) => key);
  }, [isMainnet]);

  const handleFetchInfo = async () => {
    try {
      const receipt = await fetchTopics(txHash, selectedChain);
      console.log(receipt);
    } catch (error) {
      console.error("Error fetching transaction info:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-screen">
      <h1 className="text-4xl font-bold mt-8">Pyth Entropy Debug App</h1>
      
      <div className="flex items-center space-x-2 mt-4">
        <label htmlFor="network-mode">Testnet</label>
        <Switch 
          id="network-mode" 
          defaultChecked={false} 
          onCheckedChange={setIsMainnet}
        />
        <label htmlFor="network-mode">Mainnet</label>
      </div>
      <div className="mt-4">
          <Select onValueChange={setSelectedChain} value={selectedChain}>
          <SelectTrigger>
            <SelectValue placeholder="Select Chain" />
          </SelectTrigger>
          <SelectContent>
            {availableChains.map((chain) => (
              <SelectItem key={chain} value={chain}>
                {chain.charAt(0).toUpperCase() + chain.slice(1).replace(/-/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4">
        <label htmlFor="tx-hash" className="mr-2">Transaction Hash:</label>
        <Input 
          minLength={64}
          id="tx-hash" 
          className={`border rounded p-2 w-full ${error ? 'border-red-500' : ''}`}
          placeholder="Enter transaction hash"
          value={txHash}
          onChange={(e) => validateTxHash(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <div className="mt-4">
        <button 
          className="bg-blue-500 text-white p-2 rounded"
          onClick={handleFetchInfo}
        >
          Fetch Info
        </button>
      </div>
    </div>
  );
}
