import {
    ethers,
    run,
} from "hardhat";

async function main() {

    const faucet = await ethers.deployContract("TokenFaucet");
    await faucet.waitForDeployment();
    console.log(`TokenFaucet Contract deployed to ${ faucet.target }`);
    console.log(`Waiting confirmation ....`);
    // Wait for 5 blocks
    let currentBlock = await ethers.provider.getBlockNumber();
    while (currentBlock + 5 > (await ethers.provider.getBlockNumber())) {}
    console.log(`Verifying ....`);
    const contractAddress = faucet.target;
    await run("verify:verify", {
        address: contractAddress,
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
