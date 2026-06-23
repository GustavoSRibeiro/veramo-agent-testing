import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import hre from 'hardhat'

async function main() {
    const [unifesp, ru] = await hre.ethers.getSigners()
    console.log('Deployando CreditoRU...')
    console.log('UNIFESP:', unifesp.address)
    console.log('RU:', ru.address)

    const CreditoRU = await hre.ethers.getContractFactory('CreditoRU')
    const contrato = await CreditoRU.deploy(unifesp.address, ru.address)
    await contrato.waitForDeployment()

    const address = await contrato.getAddress()
    console.log('✅ CreditoRU deployado em:', address)

    // Salva o endereço para os servidores lerem
    const outputDir = join('..', 'credentials')
    if (!existsSync(outputDir)) mkdirSync(outputDir)
    writeFileSync(
        join(outputDir, 'contract-address.json'),
        JSON.stringify({ address, deployedAt: new Date().toISOString() }, null, 2)
    )
    console.log('✅ Endereço salvo em credentials/contract-address.json')
}

main().catch(console.error)