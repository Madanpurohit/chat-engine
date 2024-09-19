"use client";
import {
  useAuthModal,
  useLogout,
  useSendUserOperation,
  useSignerStatus,
  useSmartAccountClient,
  useUser,
} from "@account-kit/react";
import DesktopGroupChatTailwind from "./components/page";
import { writeContract } from "@wagmi/core";
import { encodeFunctionData } from "viem";
import { abi } from "./abi/Chatter.json";

export default function Home() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4 justify-center text-center">
      {signerStatus.isInitializing ? (
        <>Loading...</>
      ) : user ? (
          <DesktopGroupChatTailwind/>
      ) : (
        <button className="btn btn-primary" onClick={openAuthModal}>
          Login
        </button>
      )}
    </main>
  );
}
