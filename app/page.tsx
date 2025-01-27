"use client"

import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { abbreviateTokenAddress, getRemainingTimeString } from "@/lib/utils";
import { RPC_URL, connection } from "@/providers/RPCService";
import { useEffect, useState } from "react";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { BlockWallet } from "@/idl/block_wallet";
import { getProgram } from "@/providers/RPCService";
import { formatDecimals, parseLamports } from "@/lib/utils";
import { PublicKey } from "@solana/web3.js";
import moment from "moment";
const BLOCK_FEE_LAMPORTS: number = 50000000; // 0.05 SOL
const UNBLOCK_FEE_LAMPORTS: number = 250000000;
const FEE_ACCOUNT = new PublicKey("FwLFdJeGwx7UUAQReU4tx94KA4KZjyp4eX8kdWf4yyG8");

export default function Home() {
  const wallet = useAnchorWallet();
  const [balance, setBalance] = useState<number>(0);
  const [balanceUSD, setBalanceUSD] = useState<number>(-1);
  const [program, setProgram] = useState<Program<BlockWallet> | null>(null);
  const [walletPDA, setWalletPDA] = useState<PublicKey | null>(null);
  const [blockExpiry, setBlockExpiry] = useState<number>(0);
  const [blockRemaining, setBlockRemaining] = useState<number>(0);
  const [blockInterval, setBlockInterval] = useState<number>(24);
  const [blockState, setBlockState] = useState<'blocked' | 'unblocked' | 'pending'>('pending');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notifyUpdate, setNotifyUpdate] = useState<boolean>(false);

  useEffect(() => {
    if (!connection || !wallet) return;
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    const program = getProgram(provider);
    const [walletPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("wallet"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
    setWalletPDA(walletPDA);
    setProgram(program);
  }, [wallet]);

  useEffect(() => {
    if (!program || !walletPDA || !wallet) return;
    let interval: NodeJS.Timeout | null = null;
    setBlockRemaining(0);
    setBlockState('pending');
    console.log("Getting Wallet State...");
    setIsLoading(true);

    connection.getBalance(wallet.publicKey).then((value) => {
      setBalance(value);
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`)
        .then((response) => response.json())
        .then((data) => {
          setBalanceUSD(data.solana.usd * parseLamports(value));
        })
        .catch((error) => {
          setBalanceUSD(-1);
          // console.error(error);
        });
    }).catch((error) => {
      // console.error(error);
    });

    program.account.wallet.fetch(walletPDA).then((value) => {
      const expiry = value.blockExpiry.toNumber() * 1000;
      // console.log("Wallet State", value, expiry, new Date().getTime());
      setBlockExpiry(expiry);
      if (expiry > new Date().getTime()) {
        setBlockRemaining(expiry - new Date().getTime());
        setBlockState('blocked');
      } else {
        setBlockState('unblocked');
      }
      interval = setInterval(() => {
        if (expiry > new Date().getTime()) {
          setBlockRemaining(expiry - new Date().getTime());
          setBlockState('blocked');
        }else if (interval) {
          setBlockRemaining(0);
          clearInterval(interval);
          setBlockState('unblocked');
        }
      }, 1000);
    }).catch((error) => {
      setBlockExpiry(0);
      setBlockState('unblocked');
      console.error("Error Getting Wallet State", error);
    }).finally(() => {
      setIsLoading(false);
    });
    return () => {
      interval && clearInterval(interval);
    };
  }, [program, walletPDA, wallet, notifyUpdate]);

  const handleBlockWallet = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!program || !walletPDA || !wallet) return;

    setIsLoading(true);
    try {
      const accountInfo = await connection.getAccountInfo(walletPDA);
      
      // console.log("Account Info", accountInfo);
      if (!accountInfo) {
        // If account doesn't exist, send both initialize and block instructions
        const tx = await program.methods.initialize(FEE_ACCOUNT)
          .accounts({
            user: wallet.publicKey,
          })
          .postInstructions([
            await program.methods.blockWallet(new BN(blockInterval * 60 * 60))
              .accounts({
                user: wallet.publicKey,
                feeAccount: FEE_ACCOUNT,
              })
              .instruction()
          ])
          .rpc();
        await connection.confirmTransaction(tx, 'finalized');
      } else {
        // If account exists, just send block instruction
        const tx = await program.methods.blockWallet(new BN(blockInterval * 60 * 60))
          .accounts({
            user: wallet.publicKey,
            feeAccount: FEE_ACCOUNT,
          })
          .rpc();
        await connection.confirmTransaction(tx, 'finalized');
      }
    } catch (e) {
      console.error("Error Blocking Wallet", e);
    }
    setIsLoading(false);
    setNotifyUpdate(!notifyUpdate);
  }

  const handleUnblockWallet = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!program || !walletPDA || !wallet) return;

    setIsLoading(true);
    try {
      const accountInfo = await connection.getAccountInfo(walletPDA);
      
      if (!accountInfo) {
        // If account doesn't exist, send both initialize and block instructions
        const tx = await program.methods.initialize(FEE_ACCOUNT)
          .accounts({
            user: wallet.publicKey,
          })
          .postInstructions([
            await program.methods.unblockWallet()
              .accounts({
                user: wallet.publicKey,
                feeAccount: FEE_ACCOUNT,
              })
              .instruction()
          ])
          .rpc();
        await connection.confirmTransaction(tx, 'finalized');
      } else {
        // If account exists, just send block instruction
        const tx = await program.methods.unblockWallet()
          .accounts({
            user: wallet.publicKey,
            feeAccount: FEE_ACCOUNT,
          })
          .rpc();
        await connection.confirmTransaction(tx, 'finalized');
      }
    } catch (e) {
      console.error("Error Unblocking Wallet", e);
    }
    setIsLoading(false);
    setNotifyUpdate(!notifyUpdate);
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <p className={title()}>Your wallet is 
        {
          blockExpiry > new Date().getTime() ? (<>
            <span className="text-red-500"> Blocked</span>
          </>
          ) : (
            <span className="text-green-500"> Unblocked</span>
          )
        }
        </p>
        <div className={subtitle({ class: "mt-4" })}>
        {
          blockRemaining > 0 && (
              <span className="=">Remaining time: {getRemainingTimeString(blockRemaining)}</span>
          )
        }
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 w-full sm:px-10">
        <div className="flex flex-col lg:col-span-3 gap-3 border-2 border-gray-200 rounded-md px-4 py-6">
          <h2 className="text-2xl font-bold">Wallet Details</h2>
          <div className="grid grid-cols-1 gap-1 items-center">
            <p className="text-gray-400">Wallet Address:</p>
            <p className="text-lg hidden sm:block">{wallet?.publicKey?.toBase58() || 'No wallet connected'}</p>
            <p className="text-lg sm:hidden">{abbreviateTokenAddress(wallet?.publicKey?.toBase58() || '') || 'No wallet connected'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
            <p className="text-gray-400 sm:col-span-4">SOL Balance:</p>
            <p className="sm:col-span-8 text-lg">{ formatDecimals(parseLamports(balance)) } SOL</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
            <p className="text-gray-400 sm:col-span-4">USD Balance:</p>
            <p className="sm:col-span-8 text-lg">{ balanceUSD >= 0 ? formatDecimals(balanceUSD) + ' USD' : 'Calculating...' }</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
            <p className="text-gray-400 sm:col-span-4">Blocked Status:</p>
            {
              blockExpiry > new Date().getTime() ? (
                <p className="sm:col-span-8 text-red-500 text-lg">Blocked</p>
              ) : (
                <p className="sm:col-span-8 text-green-500 text-lg">Unblocked</p>
              )
            }
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
            <p className="text-gray-400 sm:col-span-4">Blocked Time:</p>
            {
              blockExpiry > new Date().getTime() ? (
                <p className="sm:col-span-8 text-lg">{moment(blockExpiry).format('YYYY-MM-DD HH:mm:ss')}</p>
              ) : (
                <p className="sm:col-span-8 text-lg">---</p>
              )
            }
          </div>
        </div>
        <div className="flex flex-col lg:col-span-2 gap-3 border-2 border-gray-200 rounded-md px-4 py-6">
          <h2 className="text-2xl font-bold">Blocked Wallet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center mb-1">
            <p className="text-gray-400 sm:col-span-4">Block Interval:</p>
            <div className="sm:col-span-8">
              <select className="py-2 px-4 rounded-md min-w-[150px]" value={blockInterval} onChange={(e) => {
                setBlockInterval(parseInt(e.target.value));
              }}>
                <option value="24">24 hours</option>
                <option value="168">7 days</option>
                <option value="720">1 month</option>
              </select>
            </div>
          </div>
          <Link
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
            href={'javascript:;'}
            isDisabled={blockState === 'blocked' || balance < BLOCK_FEE_LAMPORTS || isLoading}
            onClick={handleBlockWallet}
          >
            Block Wallet
          </Link>
          <Link
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={'javascript:;'}
            isDisabled={blockState === 'unblocked' || balance < UNBLOCK_FEE_LAMPORTS || isLoading}
            onClick={handleUnblockWallet}
          >
            Unblock Wallet
          </Link>
          <p className="text-gray-400 text-sm">
            To <b>block a wallet</b>, you need to pay 0.05 SOL fee and to <b>unblock a wallet before expiration</b>, you need to pay 0.25 SOL fee.
          </p>
        </div>
      </div>
      
    </section>
  );
}
