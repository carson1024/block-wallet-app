import type { Adapter } from "@solana/wallet-adapter-base";
import type {
  SolanaSignInInput,
  SolanaSignInOutput
} from "@solana/wallet-standard-features";

const plainMessage = "Login to the Ape.lol.";
export const messageToSign = new TextEncoder().encode(plainMessage);

export const createSignInData = (): SolanaSignInInput => {
  const now: Date = new Date();
  const uri = window.location.href;
  const currentUrl = new URL(uri);
  const domain = currentUrl.host;

  // Convert the Date object to a string
  const currentDateTime = now.toISOString();
  const signInData: SolanaSignInInput = {
    domain,
    statement: plainMessage,
    version: "1",
    nonce: "oBbLoEldZs",
    chainId: "mainnet",
    issuedAt: currentDateTime,
    resources: [domain]
  };

  return signInData;
};

export const autoSignIn = async (adapter: Adapter) => {
  if (!("signIn" in adapter)) return true;

  // Fetch the signInInput from the backend
  /*
    const createResponse = await fetch("/backend/createSignInData");
    const input: SolanaSignInInput = await createResponse.json();
    */
  const input: SolanaSignInInput = await createSignInData();

  // Send the signInInput to the wallet and trigger a sign-in request
  const output = await adapter.signIn(input);
  const constructPayload = JSON.stringify({ input, output });

  console.log("output", constructPayload);

  return false;
};
