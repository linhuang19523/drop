import {
  ConnectWallet,
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimedNFTSupply,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useNFT,
  useUnclaimedNFTSupply,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import { useMemo, useState } from "react";
import { useToast } from "./components/ui/use-toast";
import { parseIneligibility } from "./utils/parseIneligibility";
import "./styles/custom.css";
import {
  contractConst,
  themeConst,
} from "./consts/parameters";

export default function Home() {
  const { contract } = useContract(contractConst);
  const contractMetadata = useContractMetadata(contract);
  const { toast } = useToast();
  const address = useAddress();
  const [quantity, setQuantity] = useState(1);
  
  const claimConditions = useClaimConditions(contract);
  const activeClaimCondition = useActiveClaimConditionForWallet(
    contract,
    address,
  );
  const claimerProofs = useClaimerProofs(contract, address || "");
  const claimIneligibilityReasons = useClaimIneligibilityReasons(contract, {
    quantity,
    walletAddress: address || "",
  });
  const unclaimedSupply = useUnclaimedNFTSupply(contract);
  const claimedSupply = useClaimedNFTSupply(contract);
  const { data: firstNft, isLoading: firstNftLoading } = useNFT(contract, 0);

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0)
      .add(BigNumber.from(unclaimedSupply.data || 0))
      .toString();
  }, [claimedSupply.data, unclaimedSupply.data]);

  const priceToMint = useMemo(() => {
    const bnPrice = BigNumber.from(
      activeClaimCondition.data?.currencyMetadata.value || 0,
    );
    return `${utils.formatUnits(
      bnPrice.mul(quantity).toString(),
      activeClaimCondition.data?.currencyMetadata.decimals || 18,
    )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ]);

  const maxClaimable = useMemo(() => {
    let bnMaxClaimable;
    try {
      bnMaxClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimableSupply || 0,
      );
    } catch (e) {
      bnMaxClaimable = BigNumber.from(1_000_000);
    }

    let perTransactionClaimable;
    try {
      perTransactionClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimablePerWallet || 0,
      );
    } catch (e) {
      perTransactionClaimable = BigNumber.from(1_000_000);
    }

    if (perTransactionClaimable.lte(bnMaxClaimable)) {
      bnMaxClaimable = perTransactionClaimable;
    }

    const maxAvailable = BigNumber.from(unclaimedSupply.data || 0);

    let max;
    if (maxAvailable.lt(bnMaxClaimable)) {
      max = maxAvailable;
    } else {
      max = bnMaxClaimable;
    }

    if (max.gte(1_000_000)) {
      return 1_000_000;
    }
    return max.toNumber();
  }, [
    activeClaimCondition.data?.maxClaimableSupply,
    activeClaimCondition.data?.maxClaimablePerWallet,
    unclaimedSupply.data,
  ]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition.isSuccess &&
          BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(0)) ||
        (numberClaimed === numberTotal)
      );
    } catch (e) {
      return false;
    }
  }, [
    activeClaimCondition.data?.availableSupply,
    activeClaimCondition.isSuccess,
    numberClaimed,
    numberTotal,
  ]);

  const canClaim = useMemo(() => {
    return (
      activeClaimCondition.isSuccess &&
      claimIneligibilityReasons.isSuccess &&
      claimIneligibilityReasons.data?.length === 0 &&
      !isSoldOut
    );
  }, [
    activeClaimCondition.isSuccess,
    claimIneligibilityReasons.data?.length,
    claimIneligibilityReasons.isSuccess,
    isSoldOut,
  ]);

  const isLoading = useMemo(() => {
    return (
      activeClaimCondition.isLoading ||
      unclaimedSupply.isLoading ||
      claimedSupply.isLoading ||
      !contract
    );
  }, [
    activeClaimCondition.isLoading,
    contract,
    claimedSupply.isLoading,
    unclaimedSupply.isLoading,
  ]);

  const buttonLoading = useMemo(
    () => isLoading || claimIneligibilityReasons.isLoading,
    [claimIneligibilityReasons.isLoading, isLoading],
  );

  const buttonText = useMemo(() => {
    return "MINT";
  }, []);

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading...
      </div>
    );
  }

  return (
    <div className="nft-container">
      <div className="nft-card">
        <a 
          href="https://x.com/hayako10782670" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-6 right-6 text-[var(--neon-blue)] hover:text-[var(--neon-pink)] transition-colors duration-300"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="24" 
            height="24" 
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <h1 className="nft-title rainbow-text">
          {contractMetadata.data?.name || "SKULLIEN DROP"}
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex justify-start items-center">
            <img
              src="/nft.png"
              alt="SKULLIEN NFT"
              className="rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              style={{ width: "220px" }}
            />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-value">{numberClaimed}</div>
                <div className="stat-label">NFTs Claimed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{numberTotal}</div>
                <div className="stat-label">Total Supply</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{priceToMint}</div>
                <div className="stat-label">Price per NFT</div>
              </div>
            </div>

            <div className="quantity-control">
              <button
                className="quantity-button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="text-xl font-bold text-white">{quantity}</span>
              <button
                className="quantity-button"
                onClick={() => setQuantity(Math.min(maxClaimable, quantity + 1))}
                disabled={quantity >= maxClaimable}
              >
                +
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <ConnectWallet 
                className="!nft-button"
                switchToActiveChain={true}
                theme={themeConst}
                modalSize="wide"
              />
              {address && (
                <Web3Button
                  contractAddress={contractConst}
                  action={(contract) => contract.erc721.claim(quantity)}
                  isDisabled={false}
                  onError={(err) => {
                    toast({
                      title: "Failed to mint NFT",
                      description: err.message || "Something went wrong",
                      variant: "destructive",
                    });
                  }}
                  onSuccess={() => {
                    toast({
                      title: "Successfully minted NFT",
                      description: "The NFT has been transferred to your wallet",
                    });
                  }}
                  className="!nft-button"
                  theme={themeConst}
                >
                  {buttonText}
                </Web3Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
