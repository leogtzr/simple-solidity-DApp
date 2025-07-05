import { useState, useEffect } from "react";
import {
    useConnect,
    useAccount,
    useDisconnect,
    useChainId,
    useWriteContract,
    useWaitForTransactionReceipt
} from "wagmi";
import { injected } from "wagmi/connectors";
import SimpleSolidityABI from "../../SimpleSolidityABI.json";
import truncateEthAddress from "truncate-eth-address";

export default function AdminDashboard() {
    const [message, setMessage] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState(null);

    const { connect } = useConnect();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { writeContract, data: writeData, error: writeError } = useWriteContract();
    const chainId = useChainId();

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const ANVIL_CHAIN_ID = 31337;

    const isCorrectNetwork = chainId === ANVIL_CHAIN_ID;

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: writeData,
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && isConnected && !isCorrectNetwork) {
            disconnect();
        }
    }, [isClient, isConnected, isCorrectNetwork, disconnect]);

    useEffect(() => {
        if (isConfirming) {
            setIsLoading(true);
        } else if (isConfirmed) {
            setIsLoading(false);
            setMessage('');
            setTxHash(writeData);
            setTimeout(() => setTxHash(null), 5000);
        } else if (writeError) {
            setIsLoading(false);
        }
    }, [isConfirming, isConfirmed, writeError, writeData]);

    const handleConnect = async () => {
        try {
            if (typeof window !== "undefined" && window.ethereum) {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: "0x7a69" }] // 31337 in hex, we can get the Chain Id in Anvil just running "anvil" 
                });
            }
            connect({ connector: injected() });
        } catch (error) {
            console.error("Error switching network:", error);
            connect({ connector: injected() });
        }
    };

    const handleSetMessage = async () => {
        if (!message.trim()) {
            alert("Por favor ingresa un mensaje");
            return;
        }

        if (!isConnected || !isCorrectNetwork) {
            alert("Por favor conecta tu wallet a la red Anvil");
            return;
        }

        try {
            setIsLoading(true);
            writeContract({
                abi: SimpleSolidityABI.abi,
                address: contractAddress,
                functionName: "setMessage",
                args: [message.trim()]
            });
        } catch (error) {
            console.error("Error enviando transacción:", error);
            setIsLoading(false);
        }
    };

    if (!isClient) {
        return (
            <main className="max-w-4xl mx-auto px-4 py-20">
                <div className="animate-pulse">
                    <div className="h-10 bg-gray-300 rounded mb-8"></div>
                    <div className="h-32 bg-gray-300 rounded"></div>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto px-4 py-20">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>

                {isConnected ? (
                    <div className="flex items-center gap-4">
                        {!isCorrectNetwork && (
                            <span className="text-red-400 text-sm bg-red-900/20 px-3 py-1 rounded-full">
                                ⚠️ Switch to Anvil Network
                            </span>
                        )}
                        <span className="text-gray-300 bg-gray-800 px-3 py-2 rounded-lg">
                            {truncateEthAddress(address)}
                        </span>
                        <button
                            onClick={disconnect}
                            className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Set Contract Message</h2>

                <div className="mb-6 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Network:</span>
                        <span className={`px-2 py-1 rounded text-sm ${isCorrectNetwork
                                ? 'bg-green-900/20 text-green-400'
                                : 'bg-red-900/20 text-red-400'
                            }`}>
                            {isCorrectNetwork ? '✅ Anvil (31337)' : '❌ Wrong Network'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Contract:</span>
                        <span className="text-gray-300 font-mono text-sm">
                            {contractAddress}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-2">New Message:</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                            placeholder="Enter the new message for the contract..."
                            rows={4}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        onClick={handleSetMessage}
                        disabled={!isConnected || !isCorrectNetwork || isLoading || !message.trim()}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${(!isConnected || !isCorrectNetwork || isLoading || !message.trim())
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                            }`}
                    >
                        {isLoading
                            ? (isConfirming ? '⏳ Confirming Transaction...' : '📤 Sending Transaction...')
                            : '💾 Set Message'
                        }
                    </button>
                </div>

                {writeError && (
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 font-medium">❌ Transaction Failed</p>
                        <p className="text-red-300 text-sm mt-1">
                            {writeError.message || 'Unknown error occurred'}
                        </p>
                    </div>
                )}

                {txHash && (
                    <div className="mt-4 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 font-medium">✅ Transaction Successful!</p>
                        <p className="text-green-300 text-sm mt-1">
                            Hash: <span className="font-mono">{txHash}</span>
                        </p>
                    </div>
                )}

                {!isConnected && (
                    <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 font-medium">📝 Instructions:</p>
                        <ol className="text-blue-300 text-sm mt-2 space-y-1 list-decimal list-inside">
                            <li>Connect your wallet (MetaMask recommended)</li>
                            <li>Make sure you're on the Anvil network (Chain ID: 31337)</li>
                            <li>Enter your message and click "Set Message"</li>
                            <li>Confirm the transaction in your wallet</li>
                        </ol>
                    </div>
                )}
            </div>
        </main>
    );
}