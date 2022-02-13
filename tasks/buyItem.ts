import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("buyItem", "Buy item on the marketplace")
  .addParam("id", "token id")
  .setAction(async (taskArgs, hre) => {
    const marketplace = await hre.ethers.getContractFactory("Marketplace");

    const accounts = await hre.ethers.getSigners();

    const marketContract = new hre.ethers.Contract(
      process.env.MARKET_CONTRACT_ADDRESS || "",
      marketplace.interface,
      accounts[2]
    );

    const currentItem = await marketContract.getItem(taskArgs.id);

    await marketContract.buyItem(taskArgs.id, { value: currentItem.price });
  });

module.exports = {};

// npx hardhat buyItem --id 2 --network localhost
