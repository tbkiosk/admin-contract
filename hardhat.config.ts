import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-toolbox";
import DotEnv from 'dotenv'

DotEnv.config()

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY!


const config: HardhatUserConfig = {
  solidity: "0.8.19",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
