import { ethers } from "hardhat";

async function main() {
  const V721 = await ethers.getContractFactory("V721");
  const token = await V721.deploy();

  await token.deployed();

  console.log("V721 deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
