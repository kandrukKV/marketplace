import { task } from "hardhat/config";
// eslint-disable-next-line node/no-unpublished-import
import "@nomiclabs/hardhat-waffle";

task("setMinter", "Set address how cat mint NFT")
  .addParam("address", "addresse minter's")
  .setAction(async (taskArgs, hre) => {
    const nftToken = await hre.ethers.getContractFactory("V721");

    const accounts = await hre.ethers.getSigners();

    const contract = new hre.ethers.Contract(
      process.env.NFT_CONTRACT_ADDRESS || "",
      nftToken.interface,
      accounts[0]
    );

    await contract.setMinter(taskArgs.address);
  });

module.exports = {};

// npx hardhat setMinter --address 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 --network localhost
