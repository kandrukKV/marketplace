//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INFT721 is IERC721 {
  function mint(address to, string memory uri) external;

  function burn(uint256 tokenId) external;
}
