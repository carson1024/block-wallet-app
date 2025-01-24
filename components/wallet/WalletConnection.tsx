/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { abbreviateTokenAddress } from "@/lib/utils";
import { MdAccountBalanceWallet } from "react-icons/md";
import toast from "react-hot-toast";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWalletMultiButton } from '@solana/wallet-adapter-base-ui';
import { WalletProfile } from "./WalletProfile";
import { Button } from "@heroui/button";
import { DialogTitle } from "@radix-ui/react-dialog";

//handle wallet balance fixed to 2 decimal numbers without rounding
export function toFixed(num: number, fixed: number): string {
  const re = new RegExp(`^-?\\d+(?:\\.\\d{0,${fixed || -1}})?`);
  return num.toString().match(re)![0];
}

const WalletConnection = () => {
  const [androidToastId, setAndroidToastId] = useState<string | undefined>(undefined);
  const successToast = useRef<string | undefined>(undefined);

  const { setVisible: setModalVisible } = useWalletModal();
  const { buttonState, onConnect, onDisconnect } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });

  const { publicKey, connecting, connected, wallet } =
    useWallet();

  const [open, setOpen] = useState<boolean>(false);

  const isMobileAdapter = useMemo(() => {
    if (!wallet) return false;

    return (wallet?.adapter?.name || '').toLowerCase().indexOf('mobile') >= 0;
  }, [wallet])

  useEffect(() => {
    if (connected) {

      if (androidToastId) {
        toast.dismiss(androidToastId)
        setAndroidToastId(undefined)
      }

      if (successToast.current) {
        toast.dismiss(successToast.current)
        return;
      };

      successToast.current = toast.success("Wallet connected");
    }
  }, [androidToastId, connected]);

  const getContent = () => {
    if (connected) return undefined
    if (connecting) return "Connecting..."
    if (!publicKey) return <div className="flex gap-[5px] items-center">
      <MdAccountBalanceWallet
        color="black"
        className="w-5 h-5"
      />
      <div className="hidden md:block">Connect Wallet</div>
      <div className="block md:hidden">Connect</div>
    </div>
  }

  return (
    <div className="text-white">
      {(!publicKey) && (
        <Button
          onPress={() => {
            switch (buttonState) {
              case 'no-wallet':
                setModalVisible(true);
                break;
              case 'has-wallet':
                if (onConnect) {
                  try {
                    onConnect();
                  } catch (error) {
                    console.error(error);
                  }
                }
                break;
            }
          }}
          className="text-sm font-normal text-default-600 bg-default-100"
          variant="flat"
        >
          {getContent()}
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex gap-2 items-center">
          {publicKey && (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                className="text-sm font-normal text-default-600 bg-default-100"
                startContent={
                <div className="!min-w-4 h-4 dark:bg-white bg-black rounded-full">
                  &nbsp;&nbsp;
                </div>}
                variant="flat"
                >
                  {abbreviateTokenAddress(publicKey.toBase58())}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black hover:bg-black focus:!bg-black">
                <DialogTitle>Wallet</DialogTitle>
                <WalletProfile />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default WalletConnection;