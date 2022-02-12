import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("itemsByOwner", "Get itemList by ovners")
  .addParam("address", "address owner's")
  .setAction(async (taskArgs, hre) => {
    const marketplace = await hre.ethers.getContractFactory("Marketplace");

    const accounts = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
      process.env.MARKET_CONTRACT_ADDRESS || "",
      marketplace.interface,
      accounts[0]
    );

    const item = await contract.getItemsByOwner(taskArgs.address);
    console.log("Item list:", item);
  });

module.exports = {};

// npx hardhat itemsByOwner --address 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC --network localhost
