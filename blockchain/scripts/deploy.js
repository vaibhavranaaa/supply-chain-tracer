const hre = require("hardhat");

async function main() {
  console.log("Deploying SupplyChain contract...");

  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();

  await supplyChain.waitForDeployment();

  console.log("✅ SupplyChain deployed to:", await supplyChain.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});