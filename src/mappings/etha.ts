import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../types/ETHAToken/ERC20";
import { Transfer, Global, User } from "../types/schema";
import { ONE, ZERO, ADDRESS_ZERO } from "../utils";

export function handleTransfer(event: TransferEvent): void {
  let from = event.params.from;
  let to = event.params.to;
  let value = event.params.value;
  let txHash = event.transaction.hash.toHexString();

  let _transfer = new Transfer(txHash);

  _transfer.from = from;
  _transfer.to = to;
  _transfer.amount = value;
  _transfer.timestamp = event.block.timestamp;

  _transfer.save();

  // Global data
  let globalData = Global.load("0");
  if (!globalData) {
    globalData = new Global("0");
    globalData.holders = ZERO;
    globalData.supply = ZERO;
  }

  // FROM user
  let _fromUser = User.load(from.toHexString());
  if (!_fromUser) {
    _fromUser = new User(from.toHexString());
    _fromUser.balance = ZERO;
  } else {
    _fromUser.balance = _fromUser.balance.minus(value);

    // User with no balance
    if (_fromUser.balance.equals(ZERO)) {
      globalData.holders = globalData.holders.minus(ONE);
    }
  }
  _fromUser.save();

  // TO user
  let _toUser = User.load(to.toHexString());
  if (!_toUser) {
    _toUser = new User(to.toHexString());
    globalData.holders = globalData.holders.plus(ONE);
  }
  _toUser.balance = _toUser.balance.plus(value);
  _toUser.save();

  // Minting
  if (from.equals(ADDRESS_ZERO)) {
    globalData.supply = globalData.supply.plus(value);
  }

  // Burning
  if (to.equals(ADDRESS_ZERO)) {
    globalData.supply = globalData.supply.minus(value);
  }

  globalData.save();
}
