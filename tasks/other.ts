import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("other", "Mint NFT721 and create new Item in Marketplace").setAction(
  async (taskArgs, hre) => {
    const marketplace = await hre.ethers.getContractFactory("Marketplace");

    const accounts = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
      process.env.MARKET_CONTRACT_ADDRESS || "",
      marketplace.interface,
      accounts[0]
    );

    const listenedItems = await contract.getListenedItems();
    console.log("listenedItems:", listenedItems);

    const auctionItems = await contract.getAuctionItems();
    console.log("auctionItems:", auctionItems);
  }
);

module.exports = {};
