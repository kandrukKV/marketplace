import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("createItem", "Mint NFT721 and create new Item in Marketplace")
  .addParam("uri", "uri for media data")
  .addParam("name", "item's name")
  .setAction(async (taskArgs, hre) => {
    const marketplace = await hre.ethers.getContractFactory("Marketplace");

    const accounts = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
      process.env.MARKET_CONTRACT_ADDRESS || "",
      marketplace.interface,
      accounts[2]
    );

    const item = await contract.createItem(taskArgs.uri, taskArgs.name);
    console.log("Was created item:", item);
  });

module.exports = {};

// npx hardhat createItem --uri "uri-1" --name "First" --network localhost
// npx hardhat createItem --uri "uri-2" --name "Second" --network localhost
