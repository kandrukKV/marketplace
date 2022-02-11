//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "../interfaces/INFT721.sol";

import "hardhat/console.sol";

contract Marketplace is AccessControl {
  using EnumerableMap for EnumerableMap.UintToAddressMap;
  using EnumerableSet for EnumerableSet.UintSet;

  INFT721 private nftToken;

  EnumerableMap.UintToAddressMap private _owners;
  // сопоставление ID => address

  mapping(address => EnumerableSet.UintSet) private _holderTokens;
  // по адресу юзера храним айдишники нфт

  struct Item {
    string name;
    uint256 price;
    address owner;
    uint256 id;
  }

  mapping(uint256 => Item) private _items;
  // здесь будут храниться все данные об NFT в формате id => Item;

  bytes32 public constant ADMIN = keccak256("ADMIN");

  constructor(address _nftToken) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    nftToken = INFT721(_nftToken);
    _setupRole(ADMIN, msg.sender);
  }

  function createItem(string memory _uri, string memory _name)
    external
    returns (Item memory)
  {
    uint256 tokenId = mint(msg.sender, _uri);
    _items[tokenId].name = _name;
    _items[tokenId].price = 0;
    _items[tokenId].owner = _owners.get(tokenId);
    _items[tokenId].id = tokenId;

    return _items[tokenId];
  }

  function mint(address _to, string memory _uri) internal returns (uint256) {
    uint256 tokenId = nftToken.mint(_to, _uri);
    _owners.set(tokenId, _to);
    _holderTokens[_to].add(tokenId);
    return tokenId;
  }
}
