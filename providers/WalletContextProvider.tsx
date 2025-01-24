/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { FC, ReactNode, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  MathWalletAdapter,
  TrustWalletAdapter,
  CoinbaseWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";

import { RPC_URL, network } from "./RPCService";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {


  // You can also provide a custom RPC endpoint.
  const endpoint = RPC_URL

  //wallets
  const wallets = useMemo(
    () => [
      // new SolanaMobileWalletAdapter({
      //   addressSelector: createDefaultAddressSelector(),
      //   appIdentity: {
      //     name: 'Ape.lol',
      //     uri: 'https://app.ape.lol',
      //     icon: '/android-chrome-256x256.png',
      //   },
      //   authorizationResultCache: createDefaultAuthorizationResultCache(),
      //   cluster: WalletAdapterNetwork.Mainnet,
      //   onWalletNotFound: console.log
      // }),
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new MathWalletAdapter(),
      new TrustWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    [network]
  );

  // SEE https://github.com/phantom/sign-in-with-solana/blob/main/example-dapp/src/App.tsx
  // const autoConnect = useCallback(async (adapter: Adapter) => {
  //   adapter.autoConnect().catch((e) => {
  //     return autoSignIn(adapter);
  //   });
  //   return false;
  // }, [autoSignIn]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;