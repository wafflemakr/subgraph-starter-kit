import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { ERC20 } from "./types/ETHAToken/ERC20";

export let WEI = BigInt.fromI32(18);
export let BI_8 = BigInt.fromI32(8);
export let ZERO = BigInt.fromI32(0);
export let ONE = BigInt.fromI32(1);

// ADDRESSES
export let ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
export let MATIC_ADDRESS = Address.fromString(
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
);
export let WMATIC_ADDRESS = Address.fromString(
  "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
);

export function isNullEthValue(value: string): boolean {
  return (
    value ==
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  );
}

export function formatAddress(tokenAddress: Address): Address {
  return tokenAddress.toHexString() == MATIC_ADDRESS.toHexString()
    ? Address.fromString(WMATIC_ADDRESS.toHexString())
    : tokenAddress;
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO; i.lt(decimals as BigInt); i = i.plus(ONE)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function convertTokenToDecimal(
  tokenAmount: BigInt,
  exchangeDecimals: BigInt
): BigDecimal {
  if (exchangeDecimals == ZERO) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);
  // try types uint8 for decimals
  let decimalValue = 18;
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue);
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  if (tokenAddress.toString() == MATIC_ADDRESS.toString()) {
    return "WMATIC";
  }

  let contract = ERC20.bind(tokenAddress);

  // try types string and bytes32 for symbol
  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();
  if (!symbolResult.reverted) {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);

  // try types string and bytes32 for name
  let nameValue = "unknown";
  let nameResult = contract.try_name();
  if (!nameResult.reverted) {
    nameValue = nameResult.value;
  }

  return nameValue;
}
