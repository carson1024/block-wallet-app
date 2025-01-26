import { Idl, IdlAccounts, Program, AnchorProvider } from "@coral-xyz/anchor";
import { BlockWallet } from "@/idl/block_wallet";
import BlockWalletIDL from "@/idl/block_wallet.json";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

const isDEVNET = process.env.NEXT_PUBLIC_NETWORK === "devnet";

export const network = isDEVNET
  ? WalletAdapterNetwork.Devnet
  : WalletAdapterNetwork.Mainnet;

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

export const connection = new Connection(RPC_URL);

export const programId = new PublicKey("A77rXueYXYg3bJejEFRuQFv2bbV3sBhCZwotH4cy4HCX");

// This is a helper function to get the Counter Anchor program.
export function getProgram(provider: AnchorProvider) {
  return new Program<BlockWallet>(BlockWalletIDL as any, provider);
}