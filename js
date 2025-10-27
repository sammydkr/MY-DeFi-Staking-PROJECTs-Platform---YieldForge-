// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Mock Tokens
  const MockToken = await ethers.getContractFactory("MockERC20");
  const stakingToken = await MockToken.deploy("Staking Token", "STK");
  const rewardsToken = await MockToken.deploy("Rewards Token", "RWD");

  await stakingToken.deployed();
  await rewardsToken.deployed();

  console.log("Staking Token deployed to:", stakingToken.address);
  console.log("Rewards Token deployed to:", rewardsToken.address);

  // Deploy Staking Contract
  const Staking = await ethers.getContractFactory("YieldForge");
  const staking = await Staking.deploy(stakingToken.address, rewardsToken.address);

  await staking.deployed();
  console.log("Staking Contract deployed to:", staking.address);

  // Fund the staking contract with rewards tokens
  await rewardsToken.transfer(staking.address, ethers.utils.parseEther("100000"));
  console.log("Funded staking contract with 100,000 RWD tokens");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: network.name,
    stakingToken: stakingToken.address,
    rewardsToken: rewardsToken.address,
    stakingContract: staking.address,
    deployer: deployer.address
  };

  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
