import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("other", "Mint NFT721 and create new Item in Marketplace").setAction(
  async (taskArgs, hre) => {
    const nftToken = await hre.ethers.getContractFactory("V721");

    const accounts = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
      process.env.NFT_CONTRACT_ADDRESS || "",
      nftToken.interface,
      accounts[0]
    );

    const item = await contract.ownerOf(0);
    console.log("Was created item:", item);
  }
);

module.exports = {};
