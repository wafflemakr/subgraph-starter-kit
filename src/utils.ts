import {
  BigDecimal,
  BigInt,
  Address,
  ByteArray,
} from "@graphprotocol/graph-ts";
import { ERC20 } from "./types/templates/SmartWallet/ERC20";
import { ERC20NameBytes } from "./types/templates/SmartWallet/ERC20NameBytes";
import { ERC20SymbolBytes } from "./types/templates/SmartWallet/ERC20SymbolBytes";
import { PriceFeed } from "./types/templates/SmartWallet/PriceFeed";
import { CurvePool } from "./types/templates/SmartWallet/CurvePool";
import { VaultAdapter } from "./types/templates/SmartWallet/VaultAdapter";

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

// GENERAL ADAPTER
export let ADAPTER_ADDRESS = Address.fromString(
  "0x9F03524fE00bb663E3143C1985eE121596D6E40c"
);

// PRICE FEEDS
export let CHAINLINK_MATIC_ADDRESS = Address.fromString(
  "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
);
export let CHAINLINK_DAI_ADDRESS = Address.fromString(
  "0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D"
);
export let CHAINLINK_USDC_ADDRESS = Address.fromString(
  "0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7"
);
export let CHAINLINK_USDT_ADDRESS = Address.fromString(
  "0x0A6513e40db6EB1b165753AD52E80663aeA50545"
);
export let CHAINLINK_ETH_ADDRESS = Address.fromString(
  "0xF9680D99D6C9589e2a93a78A04A279e509205945"
);
export let CHAINLINK_BTC_ADDRESS = Address.fromString(
  "0xc907E116054Ad103354f2D350FD2514433D57F6f"
);
export let CHAINLINK_LINK_ADDRESS = Address.fromString(
  "0xd9FFdb71EbE7496cC440152d43986Aae0AB76665"
);
export let CHAINLINK_QUICK_ADDRESS = Address.fromString(
  "0xa058689f4bCa95208bba3F265674AE95dED75B6D"
);
export let CHAINLINK_AAVE_ADDRESS = Address.fromString(
  "0x72484B12719E23115761D5DA1646945632979bB6"
);

export let CURVE_POOL_ADDRESS = Address.fromString(
  "0x445FE580eF8d70FF569aB36e80c647af338db351"
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
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  // try types string and bytes32 for symbol
  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString();
      }
    }
  } else {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress);

  // try types string and bytes32 for name
  let nameValue = "unknown";
  let nameResult = contract.try_name();
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString();
      }
    }
  } else {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function getChainlinkPriceFeedTokenAddress(symbol: string): Address {
  if (symbol == "MATIC" || symbol == "WMATIC") {
    return CHAINLINK_MATIC_ADDRESS;
  }
  if (symbol == "ETH" || symbol == "WETH") {
    return CHAINLINK_ETH_ADDRESS;
  }
  if (symbol == "BTC" || symbol == "WBTC") {
    return CHAINLINK_BTC_ADDRESS;
  }
  if (symbol == "DAI") {
    return CHAINLINK_DAI_ADDRESS;
  }
  if (symbol == "USDC") {
    return CHAINLINK_USDC_ADDRESS;
  }
  if (symbol == "USDT") {
    return CHAINLINK_USDT_ADDRESS;
  }
  if (symbol == "LINK") {
    return CHAINLINK_LINK_ADDRESS;
  }
  if (symbol == "QUICK") {
    return CHAINLINK_QUICK_ADDRESS;
  }
  if (symbol == "AAVE") {
    return CHAINLINK_AAVE_ADDRESS;
  }

  return ADDRESS_ZERO;
}

export function convertUSD(
  amount: BigDecimal,
  symbol: string,
  token: Address
): BigDecimal {
  if (symbol === "UNI-V2") {
    let contract = VaultAdapter.bind(ADAPTER_ADDRESS);

    let valueUSD = ZERO;
    let result = contract.try_getQuickswapBalance(
      token,
      BigInt.fromString(amount.toString())
    );

    if (!result.reverted) valueUSD = result.value.value2; // lpValueUSD

    return convertTokenToDecimal(valueUSD, WEI).times(amount);
  } else if (symbol === "am3CRV") {
    let contract = CurvePool.bind(CURVE_POOL_ADDRESS);

    let price = ZERO;
    let result = contract.try_get_virtual_price();

    if (!result.reverted) price = result.value; // lpValueUSD

    return convertTokenToDecimal(price, WEI).times(amount);
  } else {
    let priceFeedAddr = getChainlinkPriceFeedTokenAddress(symbol);

    // Feed not supported
    if (priceFeedAddr === ADDRESS_ZERO) return BigDecimal.fromString("0");

    let contract = PriceFeed.bind(priceFeedAddr);

    let price = BigInt.fromI32(0);
    let result = contract.try_latestAnswer();
    if (!result.reverted) {
      price = result.value;
    }

    return convertTokenToDecimal(price, BI_8).times(amount);
  }
}
