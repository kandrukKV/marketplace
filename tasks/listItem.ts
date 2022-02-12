import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("listItem", "list item to marketplace")
  .addParam("id", "token id")
  .addParam("price", "token price")
  .setAction(async (taskArgs, hre) => {
    const marketplace = await hre.ethers.getContractFactory("Marketplace");

    const nft = await hre.ethers.getContractFactory("V721");

    const accounts = await hre.ethers.getSigners();

    const marketContract = new hre.ethers.Contract(
      process.env.MARKET_CONTRACT_ADDRESS || "",
      marketplace.interface,
      accounts[2]
    );

    const nftContract = new hre.ethers.Contract(
      process.env.NFT_CONTRACT_ADDRESS || "",
      nft.interface,
      accounts[2]
    );

    await nftContract.approve(process.env.MARKET_CONTRACT_ADDRESS, taskArgs.id);

    const amount = hre.ethers.utils.parseEther(taskArgs.price);
    console.log("Amount:", amount);

    await marketContract.listItem(taskArgs.id, amount);

    const item = await marketContract.getListenedItems();
    console.log("Current Listing list:", item);
  });

module.exports = {};

// npx hardhat listItem --id 0 --price 5 --network localhost
