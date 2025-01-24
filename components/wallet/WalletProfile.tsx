/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { abbreviateTokenAddress } from "@/lib/utils";
import { FiMinusCircle } from "react-icons/fi";
import toast from "react-hot-toast";

//handle wallet balance fixed to 2 decimal numbers without rounding
export function toFixed(num: number, fixed: number): string {
  const re = new RegExp(`^-?\\d+(?:\\.\\d{0,${fixed || -1}})?`);
  return num.toString().match(re)![0];
}

export const WalletProfile = () => {
  const { select, wallets, publicKey, disconnect, connecting, connected } =
    useWallet();

  const [imageUrl, setImageUrl] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  const handleDisconnect = async () => {
    disconnect();
    toast("Wallet disconnected");
  };

  return (
    <>
      <div className="flex justify-between gap-2 items-center cursor-pointer">
        <div className="text-gray-400">CONNECTED WALLET</div>
        <div className="font-bold">
          {abbreviateTokenAddress(publicKey ? publicKey.toBase58() : '')}
        </div>
      </div>
      <div
        className="mx-auto flex gap-4 items-center hover:bg-gray-700 px-4 py-2 cursor-pointer"
        onClick={handleDisconnect}
      >
        <div className="">
          <FiMinusCircle className="text-white" />
        </div>
        <div>Disconnect Wallet</div>
      </div>
    </>
  );
};


