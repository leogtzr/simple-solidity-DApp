import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { anvil } from "viem/chains";
import { injected } from "wagmi/connectors";

const config = createConfig({
  chains: [anvil],
  transports: {
    [anvil.id]: http('http://localhost:8545'),
  },
  connectors: [injected()],
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
