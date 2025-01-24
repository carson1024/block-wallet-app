"use client"

import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { Select, SelectItem } from "@heroui/select";
import { useWallet } from "@solana/wallet-adapter-react";
import { abbreviateTokenAddress } from "@/lib/utils";
import { RPC_URL, connection } from "@/providers/RPCService";
import { useEffect, useState } from "react";

export default function Home() {
  const { publicKey, connecting, connected, wallet } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  
  useEffect(() => {
    if (!publicKey) return;

    connection.getBalance(publicKey).then((value) => {
      setBalance(value);
    }).catch((error) => {
      console.error(error);
    });
  }, [publicKey]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Your wallet is blocked</span>
        <div className={subtitle({ class: "mt-4" })}>
          Remaining time: 10 minutes
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 w-full sm:px-10">
        <div className="flex flex-col lg:col-span-3 gap-3 border-2 border-gray-200 rounded-md px-4 py-6">
          <h2 className="text-2xl font-bold">Wallet Details</h2>
          <div className="grid grid-cols-1 gap-1 items-center">
            <label className="text-gray-400">Wallet Address:</label>
            <p className="text-lg hidden sm:block">{publicKey?.toBase58() || 'No wallet connected'}</p>
            <p className="text-lg sm:hidden">{abbreviateTokenAddress(publicKey?.toBase58() || '') || 'No wallet connected'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
            <label className="text-gray-400 sm:col-span-4">SOL Balance:</label>
            <p className="sm:col-span-8 text-lg">0.00 SOL</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
            <label className="text-gray-400 sm:col-span-4">USD Balance:</label>
            <p className="sm:col-span-8 text-lg">0.00 USD</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
            <label className="text-gray-400 sm:col-span-4">Blocked Status:</label>
            <p className="sm:col-span-8 text-red-500 text-lg">Blocked</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center">
            <label className="text-gray-400 sm:col-span-4">Blocked Time:</label>
            <p className="sm:col-span-8 text-lg">2025-01-23 10:00:00</p>
          </div>
        </div>
        <div className="flex flex-col lg:col-span-2 gap-3 border-2 border-gray-200 rounded-md px-4 py-6">
          <h2 className="text-2xl font-bold">Blocked Wallet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-center mb-1">
            <label className="text-gray-400 sm:col-span-4">Block Interval:</label>
            <div className="sm:col-span-8">
              <select className="py-2 px-4 rounded-md min-w-[150px]">
                <option value="24">24 hours</option>
                <option value="168">7 days</option>
                <option value="720">1 month</option>
              </select>
            </div>
          </div>
          <Link
            isExternal
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
            href={siteConfig.links.docs}
          >
            Block Wallet
          </Link>
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={'#'}
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
