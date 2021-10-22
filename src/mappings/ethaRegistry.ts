import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { Created } from "../types/EthaRegistry/WalletRegistry";
import { SmartWallet, GlobalData } from "../types/schema";
import { SmartWallet as SmartWalletTemplate } from "../types/templates";
import { ONE, ZERO } from "../utils";

export function handleSmartWalletCreate(event: Created): void {
  let walletAddress = event.params.proxy;
  let ownerAddress = event.params.owner;

  let smartWallet = SmartWallet.load(walletAddress.toHexString());

  // create smart wallet
  if (!smartWallet) {
    smartWallet = new SmartWallet(walletAddress.toHexString());
    smartWallet.address = walletAddress;
    smartWallet.owner = ownerAddress;
    smartWallet.transactionHash = event.transaction.hash.toHexString();

    smartWallet.save();

    SmartWalletTemplate.create(walletAddress);

    // update number of smart wallets
    let _totalSmartWallets = GlobalData.load("0");
    if (!_totalSmartWallets) {
      _totalSmartWallets = new GlobalData("0");
      _totalSmartWallets.totalWallets = ZERO;
      _totalSmartWallets.tvl = BigDecimal.fromString("0");
    }
    _totalSmartWallets.totalWallets = _totalSmartWallets.totalWallets.plus(ONE);
    _totalSmartWallets.save();
  }
}
