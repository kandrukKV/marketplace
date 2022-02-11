import { ethers } from "hardhat";

async function main() {
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const market = await Marketplace.deploy(
    process.env.NFT_CONTRACT_ADDRESS as string
  );

  await market.deployed();

  console.log("Marketplace deployed to:", market.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
