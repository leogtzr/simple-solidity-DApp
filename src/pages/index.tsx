import { useState, useEffect, useRef } from "react";
import {
	useConnect,
	useAccount,
	useDisconnect,
	useChainId,
	usePublicClient,
	useWalletClient,
	useSendTransaction
} from "wagmi";
import { injected } from "wagmi/connectors";
import truncateEthAddress from "truncate-eth-address";
import SimpleSolidityABI from "../../SimpleSolidityABI.json";
import { parseEther } from "viem";

export default function Home() {
	const [isClient, setIsClient] = useState(false);
	useEffect(() => setIsClient(true), []);
	const { connect } = useConnect();
	const { disconnect } = useDisconnect();
	const { address, isConnected } = useAccount();
	const [likesCount, setLikesCount] = useState(0);
	const [dislikesCount, setDislikesCount] = useState(0);
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { data: walletClient } = useWalletClient();
	const { sendTransaction } = useSendTransaction();
	const [donationAmount, setDonationAmount] = useState();
	const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
	const chainId = useChainId();
	const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
	const publicClient = usePublicClient();

	const eventUnwatchRef = useRef(null);

	useEffect(() => {
		if (!publicClient) {
			return;
		}
		if (eventUnwatchRef.current) {
			eventUnwatchRef.current();
			eventUnwatchRef.current = null;
		}

		eventUnwatchRef.current = publicClient.watchContractEvent({
			address: contractAddress,
			abi: SimpleSolidityABI.abi,
			eventName: ["Like", "Dislike"],
			onLogs: (logs) => {
				// TODO: do something with the logs...
				console.log('debug:x The logs ...'); // Remove this shit.
				console.log(logs);
				fetchContractData();
			},
			onError(error) {
				console.log(error);
			},
			pollingInterval: 2000,
		});

		return () => {
			if (eventUnwatchRef.current) {
				eventUnwatchRef.current();
				eventUnwatchRef.current = null;
			}
		};
	}, [publicClient, contractAddress]);

	const fetchContractData = async () => {
		try {
			const message = await publicClient.readContract({
				address: contractAddress,
				abi: SimpleSolidityABI.abi,
				functionName: "message"
			});
			const likes = await publicClient.readContract({
				address: contractAddress,
				abi: SimpleSolidityABI.abi,
				functionName: "likesCount"
			});
			const dislikes = await publicClient.readContract({
				address: contractAddress,
				abi: SimpleSolidityABI.abi,
				functionName: "dislikesCount"
			});
			setMessage(message);
			setLikesCount(Number(likes));
			setDislikesCount(Number(dislikes));
		} catch (error) {
			console.error("Error leyendo contrato:", error);
		}
	};

	const handleLike = async () => {
		if (!walletClient) return;
		setIsLoading(true);
		try {
			const hash = await walletClient.writeContract({
				address: contractAddress,
				abi: SimpleSolidityABI.abi,
				functionName: "like",
			});
			await publicClient.waitForTransactionReceipt({ hash });
			await fetchContractData();
		} catch (error) {
			console.error("Error al dar like:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDislike = async () => {
		if (!walletClient) return;
		setIsLoading(true);
		try {
			const hash = await walletClient.writeContract({
				address: contractAddress,
				abi: SimpleSolidityABI.abi,
				functionName: "dislike",
			});
			await publicClient.waitForTransactionReceipt({ hash });
			await fetchContractData();
		} catch (error) {
			console.error("Error al dar dislike:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const donate = (amount) => {
		sendTransaction({ to: contractAddress, value: parseEther(amount) });
	};

	useEffect(() => {
		setIsCorrectNetwork(chainId === 31337);
	}, [chainId]);

	useEffect(() => {
		if (isConnected && isCorrectNetwork) {
			fetchContractData();
		}
		if (isConnected && !isCorrectNetwork) {
			disconnect();
		}
		// eslint-disable-next-line
	}, [isConnected, isCorrectNetwork, disconnect]);

	const handleConnect = () => {
		if (window.ethereum) {
			window.ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: "0x7a69" }]
			}).then(() => {
				connect({ connector: injected() });
			}).catch((error) => {
				console.error("Error switching network:", error);
				connect({ connector: injected() });
			});
		} else {
			connect({ connector: injected() });
		}
	};

	if (!isClient) {
		return (
			<main className="max-w-[1000px] mx-auto px-4 py-20">
				<div className="animate-pulse h-32 bg-gray-800 rounded-xl" />
			</main>
		);
	}

	return (
		<main className="max-w-[1000px] mx-auto px-4 py-20">
			<div className="flex items-center justify-between">
				<p className="text-4xl">Hello, Simple Solidity</p>
				{isConnected ? (
					<div className="flex items-center gap-4">
						{!isCorrectNetwork && (
							<p className="text-red-500">Switch to Anvil Network</p>
						)}
						<p>{truncateEthAddress(address)}</p>
						<button
							onClick={disconnect}
							className="py-2 px-4 bg-red-600 rounded-xl"
						>
							Disconnect
						</button>
					</div>
				) : (
					<button
						onClick={handleConnect}
						className="py-3 px-8 bg-zinc-800 cursor-pointer rounded-xl"
					>
						Connect
					</button>
				)}
			</div>

			<div className="mt-8">
				<h2 className="text-2xl mb-4">Contrato SimpleSolidity</h2>
				<p>Mensaje actual: <strong>{message}</strong></p>
				<div className="flex gap-4 mt-4">
					<div className="p-4 bg-gray-800 rounded">
						<p>Likes: {likesCount}</p>
					</div>
					<div className="p-4 bg-gray-800 rounded">
						<p>Dislikes: {dislikesCount}</p>
					</div>
				</div>
				<div className="flex items-center gap-5 mt-5">
					<button
						onClick={handleLike}
						disabled={isLoading}
						className={`py-3 w-[200px] bg-blue-500 rounded-2xl text-center ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
							}`}
					>
						{isLoading ? "Procesando..." : "Like"}
					</button>
					<button
						onClick={handleDislike}
						disabled={isLoading}
						className={`py-3 w-[200px] bg-red-700 rounded-2xl text-center ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
							}`}
					>
						{isLoading ? "Procesando..." : "Dislike"}
					</button>
				</div>
				<div className="mt-32">
					<p className="mb-3">Buy me a coffee</p>
					<div className="flex items-center gap-5">
						<input
							value={donationAmount}
							onChange={(e) => setDonationAmount(e.target.value)}
							className="py-3 text-white w-full max-w-[500px] rounded-sm"
							type="number"
							placeholder="Donation amount in ETH"
						/>
						<button
							onClick={() => donate(donationAmount)}
							className="py-3 w-[200px] bg-white text-black text-center cursor-pointer rounded-xl"
						>
							Donate
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}