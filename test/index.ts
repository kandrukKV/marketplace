import { expect } from "chai";
import { ethers } from "hardhat";

describe("Marketplace", function () {
  let nftContract: any;
  let marketplace: any;
  let owner: any;
  let user: any;

  before(async function name() {
    const nft = await ethers.getContractFactory("V721");
    const market = await ethers.getContractFactory("Marketplace");
    [owner, user] = await ethers.getSigners();
    nftContract = await nft.deploy();
    marketplace = await market.deploy();
  });

  it("Should return the new greeting once it's changed", async function () {});
});
