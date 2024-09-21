import {
  AlchemyAccountsUIConfig,
  cookieStorage,
  createConfig,
} from "@account-kit/react";
import { sepolia } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email" as const }],
    ],
    addPasskeyOnSignup: false,
  },
};


export const config = createConfig(
  {
    apiKey: process.env.NEXT_PUBLIC_API_KEY || "", 
    chain: sepolia,
    ssr: true, 
    storage: cookieStorage, 
    policyId: process.env.NEXT_PUBLIC_POLICY_ID
  },
  uiConfig
);

export const queryClient = new QueryClient();
