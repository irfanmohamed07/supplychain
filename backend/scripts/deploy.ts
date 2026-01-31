import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  console.log('🌸 Deploying FloraChain contract...')

  const [deployer] = await ethers.getSigners()
  console.log('Deploying with account:', deployer.address)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log('Account balance:', ethers.formatEther(balance), 'ETH')

  if (balance === 0n) {
    throw new Error('Account has no funds. Please fund the account or use a different account.')
  }

  const FloraChain = await ethers.getContractFactory('FloraChain')
  const floraChain = await FloraChain.deploy()

  await floraChain.waitForDeployment()

  const address = await floraChain.getAddress()
  const network = await ethers.provider.getNetwork()
  const chainId = network.chainId.toString()

  console.log('🌸 FloraChain deployed to:', address)
  console.log('Network chain ID:', chainId)

  // Update deployments.json
  const deploymentsPath = path.join(__dirname, '../../client/src/deployments.json')

  let deployments = { networks: {} }

  // Check if file exists
  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'))
  }

  if (!deployments.networks[chainId]) {
    deployments.networks[chainId] = {}
  }

  deployments.networks[chainId].FloraChain = {
    address: address,
  }

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2))
  console.log('✅ Deployment info saved to client/src/deployments.json')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
