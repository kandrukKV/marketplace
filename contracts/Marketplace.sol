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
  uint256 private auctionDuration;
  uint256 private minBidCount;

  mapping(address => EnumerableSet.UintSet) private _holderTokens;
  // по адресу юзера храним айдишники нфт

  EnumerableSet.UintSet private _listingList;
  // тут токены, которые выставлены на продажу

  EnumerableSet.UintSet private _auctionList;
  // тут токены, которые выставлены на аукцион

  struct Item {
    string name;
    uint256 price;
    address owner;
    uint256 id;
    uint256 startTime;
    uint256 bidCount;
    address buyer;
  }

  mapping(uint256 => Item) private _items;
  // здесь будут храниться все данные об NFT в формате id => Item;

  bytes32 public constant ADMIN = keccak256("ADMIN");

  constructor(address _nftToken) {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    nftToken = INFT721(_nftToken);
    _setupRole(ADMIN, msg.sender);
    auctionDuration = 4320;
    minBidCount = 2;
  }

  function createItem(string memory _uri, string memory _name)
    external
    returns (uint256)
  {
    uint256 tokenId = mint(msg.sender, _uri);
    _items[tokenId].name = _name;
    _items[tokenId].price = 0;
    _items[tokenId].owner = msg.sender;
    _items[tokenId].id = tokenId;

    return tokenId;
  }

  function mint(address _to, string memory _uri) internal returns (uint256) {
    uint256 tokenId = nftToken.mint(_to, _uri); // минт на контракте токена
    _holderTokens[_to].add(tokenId); // добавили собственнику token
    return tokenId;
  }

  function getHolderTokens(address owner, uint256 index)
    public
    view
    returns (uint256)
  {
    return _holderTokens[owner].at(index);
  }

  function listItem(uint256 _tokenId, uint256 _price) public {
    checkParams(_tokenId, _price);
    _items[_tokenId].price = _price;
    _listingList.add(_tokenId);
  }

  function buyItem(uint256 _tokenId) public payable {
    require(_listingList.contains(_tokenId), "Token is not for sale.");
    require(msg.value >= _items[_tokenId].price, "Insufficient funds.");
    require(_listingList.contains(_tokenId), "No sale");

    address currentOwner = _items[_tokenId].owner;

    nftToken.safeTransferFrom(currentOwner, msg.sender, _tokenId);

    (bool success, ) = currentOwner.call{ value: _items[_tokenId].price }("");
    require(success, "Transfer failed.");

    _listingList.remove(_tokenId);
    _holderTokens[currentOwner].remove(_tokenId);
    _holderTokens[msg.sender].add(_tokenId);
    _items[_tokenId].price = 0;
    _items[_tokenId].owner = msg.sender;
  }

  function cancel(uint256 _tokenId) public {
    require(
      _holderTokens[msg.sender].contains(_tokenId),
      "cancel: No token is available."
    );
    require(_listingList.contains(_tokenId), "Item isn't on the market");
    _listingList.remove(_tokenId);
    _items[_tokenId].price = 0;
  }

  function listenItemToAuction(uint256 _tokenId, uint256 _startPrice) public {
    checkParams(_tokenId, _startPrice);
    _auctionList.add(_tokenId);
    _items[_tokenId].price = _startPrice;
    _items[_tokenId].startTime = block.timestamp;
    _items[_tokenId].bidCount = 0;
  }

  function makeBid(uint256 _tokenId, uint256 _price) public payable {
    require(_auctionList.contains(_tokenId), "No auction");
    require(
      _price > _items[_tokenId].price,
      "The bid must be more then current price."
    );
    require(msg.value >= _items[_tokenId].price, "Insufficient funds.");

    (bool success, ) = _items[_tokenId].buyer.call{
      value: _items[_tokenId].price
    }("");
    require(success, "Transfer failed.");

    _items[_tokenId].bidCount += 1;
    _items[_tokenId].buyer = msg.sender;
    _items[_tokenId].price = msg.value;
  }

  function finishAuction(uint256 _tokenId) public {
    require(_auctionList.contains(_tokenId), "No auction");
    require(
      _holderTokens[msg.sender].contains(_tokenId),
      " No token is available."
    );
    require(
      (block.timestamp - _items[_tokenId].startTime) > auctionDuration,
      "Auction time is not over yet"
    );
    if (_items[_tokenId].bidCount >= minBidCount) {
      // аукцион состоялся
      (bool success, ) = _items[_tokenId].owner.call{
        value: _items[_tokenId].price
      }("");
      require(success, "Transfer failed.");
      nftToken.safeTransferFrom(
        _items[_tokenId].owner,
        _items[_tokenId].buyer,
        _tokenId
      );
      _holderTokens[_items[_tokenId].owner].remove(_tokenId);
      _holderTokens[_items[_tokenId].buyer].add(_tokenId);
      _auctionList.remove(_tokenId);
      _items[_tokenId].owner = _items[_tokenId].buyer;
      _items[_tokenId].bidCount = 0;
      _items[_tokenId].buyer = address(0);
      _items[_tokenId].price = 0;
    } else {
      // аукцион не состоялся
      if (_items[_tokenId].bidCount > 0) {
        (bool success, ) = _items[_tokenId].buyer.call{
          value: _items[_tokenId].price
        }("");
        require(success, "Transfer failed.");
      }
      _auctionList.remove(_tokenId);
      _items[_tokenId].bidCount = 0;
      _items[_tokenId].buyer = address(0);
      _items[_tokenId].price = 0;
    }
  }

  function cancelAuction(uint256 _tokenId) public {
    require(
      _holderTokens[msg.sender].contains(_tokenId),
      " No token is available."
    );
    require(_auctionList.contains(_tokenId), "The token is missing");
    if (_items[_tokenId].bidCount > 0) {
      (bool success, ) = _items[_tokenId].buyer.call{
        value: _items[_tokenId].price
      }("");
      require(success, "Transfer failed.");
    }
    _auctionList.remove(_tokenId);
    _items[_tokenId].bidCount = 0;
    _items[_tokenId].buyer = address(0);
    _items[_tokenId].price = 0;
  }

  function checkParams(uint256 _tokenId, uint256 _price) internal view {
    require(_price > 0, "StartPrice must be more them zero.");

    // нужна ли проверка на нфт контракте ???
    require(
      _holderTokens[msg.sender].contains(_tokenId),
      " No token is available."
    );
    require(!_listingList.contains(_tokenId), "The token is for sale");
    require(!_auctionList.contains(_tokenId), "The token is sold at auction.");
    require(
      nftToken.getApproved(_tokenId) == address(this),
      "You must make approve this token."
    );
  }

  // view functions

  function getItem(uint256 tokenId) public view returns (Item memory) {
    return _items[tokenId];
  }

  function getItemsByOwner(address owner) public view returns (Item[] memory) {
    uint256 count = _holderTokens[owner].length();
    Item[] memory itemList = new Item[](count);

    for (uint256 i; i < count; i++) {
      uint256 tokenId = _holderTokens[owner].at(i);
      itemList[i] = _items[tokenId];
    }

    return itemList;
  }

  function getListenedItems() public view returns (Item[] memory) {
    uint256 count = _listingList.length();
    Item[] memory itemList = new Item[](count);
    for (uint256 i; i < count; i++) {
      uint256 tokenId = _listingList.at(i);
      itemList[i] = _items[tokenId];
    }
    return itemList;
  }

  function getAuctionItems() public view returns (Item[] memory) {
    uint256 count = _auctionList.length();
    Item[] memory itemList = new Item[](count);
    for (uint256 i; i < count; i++) {
      uint256 tokenId = _auctionList.at(i);
      itemList[i] = _items[tokenId];
    }
    return itemList;
  }
}
