import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("listItemToAuction", "list item to auction")
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

    const approvedAddress = await nftContract.getApproved(taskArgs.id);

    if (approvedAddress !== process.env.MARKET_CONTRACT_ADDRESS) {
      await nftContract.approve(
        process.env.MARKET_CONTRACT_ADDRESS,
        taskArgs.id
      );
    }

    const amount = hre.ethers.utils.parseEther(taskArgs.price);

    await marketContract.listenItemToAuction(taskArgs.id, amount);

    const item = await marketContract.getAuctionItems();
    console.log("Current Auction list:", item);
  });

module.exports = {};

// npx hardhat listItemToAuction --id 0 --price 5 --network localhost
