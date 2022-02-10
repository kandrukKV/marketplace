//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "../interfaces/INFT721.sol";

import "hardhat/console.sol";

contract Marketplace is AccessControl {
  using EnumerableMap for EnumerableMap.UintToAddressMap;

  INFT721 private nftToken;

  EnumerableMap.UintToAddressMap private _owners;
  // сопоставление ID => address

  mapping(address => EnumerableSet.UintSet) private _holderTokens;
  // по адресу юзера храним айдишники нфт

  struct Item {
    uint256 id;
    string description;
    uint256 price;
  }

  mapping(uint256 => Item) private _items;
  // здесь будут храниться все данные об NFT в формате id => Item;

  bytes32 public constant ADMIN = keccak256("ADMIN");

  constructor(address _nftToken) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    nftToken = INFT721(_nftToken);
    _setupRole(ADMIN, msg.sender);
  }

  function createItem(string memory uri) external {}
}
