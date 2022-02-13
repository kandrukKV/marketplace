import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("makeBid", "Buy item on the marketplace")
  .addParam("id", "token id")
  .addParam("price", "new price")
  .setAction(async (taskArgs, hre) => {
    const marketplace = await hre.ethers.getContractFactory("Marketplace");

    const accounts = await hre.ethers.getSigners();

    const marketContract = new hre.ethers.Contract(
      process.env.MARKET_CONTRACT_ADDRESS || "",
      marketplace.interface,
      accounts[0]
    );

    const amount = hre.ethers.utils.parseEther(taskArgs.price);

    await marketContract.makeBid(taskArgs.id, { value: amount });

    const item = await marketContract.getItem(taskArgs.id);

    console.log("Changed item", item);
  });

module.exports = {};

// npx hardhat makeBid --id 0 --price 3 --network localhost
