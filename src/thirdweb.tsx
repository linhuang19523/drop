import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Base } from "@thirdweb-dev/chains";

export function ThirdwebProviderConfig({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider
      activeChain={Base}
      clientId="4af7c9e771573bda4e3b10b286200f1f"
      supportedChains={[Base]}
    >
      {children}
    </ThirdwebProvider>
  );
} 