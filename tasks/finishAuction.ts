import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("finishAuction", "Finish current auction")
  .addParam("id", "token id")
  .setAction(async (taskArgs, hre) => {
    const marketplace = await hre.ethers.getContractFactory("Marketplace");

    const accounts = await hre.ethers.getSigners();

    const marketContract = new hre.ethers.Contract(
      process.env.MARKET_CONTRACT_ADDRESS || "",
      marketplace.interface,
      accounts[3]
    );

    await marketContract.finishAuction(taskArgs.id);

    const item = marketContract.getItem(taskArgs.id);

    console.log("Changed item", item);
  });

module.exports = {};

// npx hardhat finishAuction --id 2 --network localhost
