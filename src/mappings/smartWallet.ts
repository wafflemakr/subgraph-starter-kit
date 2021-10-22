import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  LogMint,
  LogRedeem,
  LogBorrow,
  LogPayback,
  LogDeposit,
  LogWithdraw,
  LogSwap,
  Claim,
  Staked,
  Unstaked,
  VaultDeposit,
  VaultWithdraw,
  VaultClaim,
} from "../types/templates/SmartWallet/SmartWallet";
import {
  SmartWallet,
  Activity,
  TotalData,
  ProtocolData,
} from "../types/schema";
import {
  fetchTokenSymbol,
  fetchTokenDecimals,
  convertTokenToDecimal,
  formatAddress,
  ADDRESS_ZERO,
} from "../utils";

function storeActivity(event: LogMint, type: string): void {
  let walletAddress = event.address;

  // Event params
  let token = formatAddress(event.params.erc20);
  let amount = event.params.tokenAmt;

  let transactionId = event.transaction.hash.toHexString();
  let timestamp = event.block.timestamp;
  let decimals = fetchTokenDecimals(token);
  let symbol = fetchTokenSymbol(token);
  let realAmount = convertTokenToDecimal(amount, decimals);

  let smartWallet = SmartWallet.load(walletAddress.toHexString());

  if (smartWallet) {
    // store activity event data
    let _activity = Activity.load(transactionId);

    // multiple events in the same transaction Hash
    if (
      _activity != null &&
      _activity.type == type &&
      _activity.token0 == token
    ) {
      _activity.amount = _activity.amount.plus(realAmount);
    } else {
      _activity = new Activity(transactionId);
      _activity.wallet = smartWallet.id;
      _activity.token0 = token;
      _activity.token1 = ADDRESS_ZERO as Bytes;
      _activity.amount = realAmount;
      _activity.symbol0 = symbol;
      _activity.symbol1 = "";
      _activity.timestamp = timestamp;
      _activity.transactionHash = transactionId;
      _activity.type = type;
    }

    _activity.save();

    // update TotalData schema
    let totalDataId = smartWallet.id
      .concat("-")
      .concat(symbol)
      .concat("-")
      .concat(type);
    let totalData = TotalData.load(totalDataId);
    if (!totalData) {
      totalData = new TotalData(totalDataId);
      totalData.wallet = smartWallet.id;
      totalData.token = token;
      totalData.symbol = symbol;
      totalData.type = type;
      totalData.total = BigInt.fromI32(0).toBigDecimal();
    }

    totalData.total = totalData.total.plus(realAmount);

    totalData.save();
  }
}

export function handleSmartWalletLogMint(event: LogMint): void {
  storeActivity(event, "Supply");
}

export function handleSmartWalletLogRedeem(event: LogRedeem): void {
  storeActivity(event as LogMint, "Redeem");
}

export function handleSmartWalletLogBorrow(event: LogBorrow): void {
  storeActivity(event as LogMint, "Borrow");
}

export function handleSmartWalletLogPayback(event: LogPayback): void {
  storeActivity(event as LogMint, "Payback");
}

export function handleSmartWalletLogDeposit(event: LogDeposit): void {
  storeActivity(event as LogMint, "Deposit");
}

export function handleSmartWalletLogWithdraw(event: LogWithdraw): void {
  storeActivity(event as LogMint, "Withdraw");
}

export function handleSmartWalletVaultDeposit(event: VaultDeposit): void {
  storeActivity(event as LogMint, "VaultDeposit");
}

export function handleSmartWalletVaultWithdraw(event: VaultWithdraw): void {
  storeActivity(event as LogMint, "VaultWithdraw");
}

export function handleSmartWalletVaultClaim(event: VaultClaim): void {
  storeActivity(event as LogMint, "Claim");
}

export function handleSmartWalletStaked(event: Staked): void {
  storeActivity(event as LogMint, "Stake");
}

export function handleSmartWalletUnstaked(event: Unstaked): void {
  storeActivity(event as LogMint, "Unstake");
}

export function handleSmartWalletClaim(event: Claim): void {
  storeActivity(event as LogMint, "Claim");
}

export function handleSmartWalletLogSwap(event: LogSwap): void {
  let walletAddress = event.address;

  // Event params
  let token0 = formatAddress(event.params.src);
  let token1 = formatAddress(event.params.dest);
  let amount0 = event.params.amount;

  let transactionId = event.transaction.hash.toHexString();
  let timestamp = event.block.timestamp;
  let decimals0 = fetchTokenDecimals(token0);
  let symbol0 = fetchTokenSymbol(token0);
  let symbol1 = fetchTokenSymbol(token1);
  let realAmount = convertTokenToDecimal(amount0, decimals0);

  let smartWallet = SmartWallet.load(walletAddress.toHexString());

  if (smartWallet) {
    // store activity event data
    let _activity = new Activity(transactionId);
    _activity.wallet = smartWallet.id;
    _activity.token0 = token0;
    _activity.token1 = token1;
    _activity.amount = realAmount;
    _activity.symbol0 = symbol0;
    _activity.symbol1 = symbol1;
    _activity.timestamp = timestamp;
    _activity.transactionHash = transactionId;
    _activity.type = "Swap";
    _activity.save();
  }
}
