import { getContract } from './web3'

export interface UserRole {
  role: string
  roleId: number
}

export const getUserRole = async (): Promise<UserRole | null> => {
  try {
    const { contract, account } = await getContract()
    const role = await contract.methods.addressToRole(account).call()
    const roleId = await contract.methods.addressToRoleId(account).call()
    
    const roleNames = ['None', 'Harvester', 'Transporter', 'Distributor', 'Wholesaler', 'Retailer', 'Consumer', 'Decorator', 'Authority']
    
    return {
      role: roleNames[parseInt(role)] || 'None',
      roleId: parseInt(roleId)
    }
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

export const checkIsOwner = async (): Promise<boolean> => {
  try {
    const { contract, account } = await getContract()
    const owner = await contract.methods.owner().call()
    return account.toLowerCase() === owner.toLowerCase()
  } catch (error) {
    console.error('Error checking owner:', error)
    return false
  }
}

export const getContractOwner = async (): Promise<string | null> => {
  try {
    const { contract } = await getContract()
    return await contract.methods.owner().call()
  } catch (error) {
    console.error('Error getting contract owner:', error)
    return null
  }
}

