import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";

const isDEVNET = process.env.NEXT_PUBLIC_NETWORK === "devnet";

export const network = isDEVNET
  ? WalletAdapterNetwork.Devnet
  : WalletAdapterNetwork.Mainnet;

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

export const connection = new Connection(RPC_URL);

export const txnConnection = new Connection(
  "https://api.mainnet-beta.solana.com"
);
