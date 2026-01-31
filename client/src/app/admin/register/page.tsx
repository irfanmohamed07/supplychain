'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getContract } from '@/lib/web3'

export default function AdminRegister() {
    const [account, setAccount] = useState<string>('')
    const [isOwner, setIsOwner] = useState(false)
    const [selectedRole, setSelectedRole] = useState('Harvester')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const [userData, setUserData] = useState({
        address: '',
        // Common fields
        name: '',
        contact: '',
        geoLocation: '',

        // Harvester specific
        farmName: '',
        flowerTypes: '',
        dailyCapacity: '',
        seasonalFlowers: '',

        // Transporter specific
        vehicleType: '',
        coldChainSupport: false,
        capacity: '',
        serviceRegion: '',
        availability: '',

        // Distributor/Wholesaler/Retailer specific
        shopName: '',
        shopAddress: '',
        storageType: '',
        hasColdStorage: false,
        shopPhotos: '',
        inventory: '',
        seasonalAvailable: '',

        // Consumer specific
        deliveryAddress: '',

        // Decorator specific
        workshopName: '',
        craftType: ''
    })

    useEffect(() => {
        checkIfOwner()
    }, [])

    const checkIfOwner = async () => {
        try {
            const { contract, account } = await getContract()
            setAccount(account)

            const owner = await contract.methods.owner().call()
            setIsOwner(account.toLowerCase() === owner.toLowerCase())

            if (account.toLowerCase() !== owner.toLowerCase()) {
                setMessage('⛔ Access Denied: Only the contract owner can register users')
            }
        } catch (error) {
            console.error('Error checking owner:', error)
            setMessage('❌ Error connecting to contract')
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const { contract, account } = await getContract()

            let tx
            switch (selectedRole) {
                case 'Harvester':
                    tx = await contract.methods.registerHarvester(
                        userData.address,
                        userData.name,
                        userData.farmName,
                        userData.geoLocation,
                        userData.flowerTypes,
                        userData.dailyCapacity,
                        userData.seasonalFlowers,
                        userData.contact
                    ).send({ from: account })
                    break

                case 'Transporter':
                    tx = await contract.methods.registerTransporter(
                        userData.address,
                        userData.vehicleType,
                        userData.coldChainSupport,
                        userData.capacity,
                        userData.serviceRegion,
                        userData.availability,
                        userData.contact
                    ).send({ from: account })
                    break

                case 'Distributor':
                    tx = await contract.methods.registerDistributor(
                        userData.address,
                        userData.shopName,
                        userData.shopAddress,
                        userData.geoLocation,
                        userData.storageType,
                        userData.hasColdStorage,
                        userData.contact
                    ).send({ from: account })
                    break

                case 'Wholesaler':
                    tx = await contract.methods.registerWholesaler(
                        userData.address,
                        userData.shopName,
                        userData.shopAddress,
                        userData.geoLocation,
                        userData.storageType,
                        userData.hasColdStorage,
                        userData.contact
                    ).send({ from: account })
                    break

                case 'Retailer':
                    tx = await contract.methods.registerRetailer(
                        userData.address,
                        userData.shopName,
                        userData.shopPhotos,
                        userData.shopAddress,
                        userData.geoLocation,
                        userData.storageType,
                        userData.hasColdStorage,
                        userData.inventory,
                        userData.seasonalAvailable,
                        userData.contact
                    ).send({ from: account })
                    break

                case 'Consumer':
                    tx = await contract.methods.registerConsumer(
                        userData.address,
                        userData.name,
                        userData.deliveryAddress,
                        userData.geoLocation,
                        userData.contact
                    ).send({ from: account })
                    break

                case 'Decorator':
                    tx = await contract.methods.registerDecorator(
                        userData.address,
                        userData.workshopName,
                        userData.craftType,
                        userData.contact
                    ).send({ from: account })
                    break
            }

            setMessage(`✅ Successfully registered ${userData.address} as ${selectedRole}`)
            // Reset form
            setUserData({
                address: '', name: '', contact: '', geoLocation: '', farmName: '',
                flowerTypes: '', dailyCapacity: '', seasonalFlowers: '', vehicleType: '',
                coldChainSupport: false, capacity: '', serviceRegion: '', availability: '',
                shopName: '', shopAddress: '', storageType: '', hasColdStorage: false,
                shopPhotos: '', inventory: '', seasonalAvailable: '', deliveryAddress: '',
                workshopName: '', craftType: ''
            })
        } catch (error: any) {
            console.error('Registration error:', error)
            setMessage(`❌ Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const renderRoleSpecificFields = () => {
        switch (selectedRole) {
            case 'Harvester':
                return (
                    <>
                        <input
                            className="input"
                            type="text"
                            placeholder="Farm Name"
                            value={userData.farmName}
                            onChange={e => setUserData({ ...userData, farmName: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="text"
                            placeholder="Flower Types (e.g., Roses, Tulips)"
                            value={userData.flowerTypes}
                            onChange={e => setUserData({ ...userData, flowerTypes: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="number"
                            placeholder="Daily Capacity (stems)"
                            value={userData.dailyCapacity}
                            onChange={e => setUserData({ ...userData, dailyCapacity: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="text"
                            placeholder="Seasonal Flowers"
                            value={userData.seasonalFlowers}
                            onChange={e => setUserData({ ...userData, seasonalFlowers: e.target.value })}
                        />
                    </>
                )

            case 'Transporter':
                return (
                    <>
                        <input
                            className="input"
                            type="text"
                            placeholder="Vehicle Type"
                            value={userData.vehicleType}
                            onChange={e => setUserData({ ...userData, vehicleType: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="number"
                            placeholder="Capacity (units)"
                            value={userData.capacity}
                            onChange={e => setUserData({ ...userData, capacity: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="text"
                            placeholder="Service Region"
                            value={userData.serviceRegion}
                            onChange={e => setUserData({ ...userData, serviceRegion: e.target.value })}
                        />
                        <input
                            className="input"
                            type="text"
                            placeholder="Availability"
                            value={userData.availability}
                            onChange={e => setUserData({ ...userData, availability: e.target.value })}
                        />
                        <label className="flex items-center gap-2 text-gray-300">
                            <input
                                type="checkbox"
                                checked={userData.coldChainSupport}
                                onChange={e => setUserData({ ...userData, coldChainSupport: e.target.checked })}
                            />
                            Cold Chain Support
                        </label>
                    </>
                )

            case 'Distributor':
            case 'Wholesaler':
            case 'Retailer':
                return (
                    <>
                        <input
                            className="input"
                            type="text"
                            placeholder="Shop Name"
                            value={userData.shopName}
                            onChange={e => setUserData({ ...userData, shopName: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="text"
                            placeholder="Shop Address"
                            value={userData.shopAddress}
                            onChange={e => setUserData({ ...userData, shopAddress: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="text"
                            placeholder="Storage Type"
                            value={userData.storageType}
                            onChange={e => setUserData({ ...userData, storageType: e.target.value })}
                        />
                        {selectedRole === 'Retailer' && (
                            <>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Shop Photos (IPFS Hash)"
                                    value={userData.shopPhotos}
                                    onChange={e => setUserData({ ...userData, shopPhotos: e.target.value })}
                                />
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Inventory"
                                    value={userData.inventory}
                                    onChange={e => setUserData({ ...userData, inventory: e.target.value })}
                                />
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Seasonal Available"
                                    value={userData.seasonalAvailable}
                                    onChange={e => setUserData({ ...userData, seasonalAvailable: e.target.value })}
                                />
                            </>
                        )}
                        <label className="flex items-center gap-2 text-gray-300">
                            <input
                                type="checkbox"
                                checked={userData.hasColdStorage}
                                onChange={e => setUserData({ ...userData, hasColdStorage: e.target.checked })}
                            />
                            Has Cold Storage
                        </label>
                    </>
                )

            case 'Consumer':
                return (
                    <input
                        className="input"
                        type="text"
                        placeholder="Delivery Address"
                        value={userData.deliveryAddress}
                        onChange={e => setUserData({ ...userData, deliveryAddress: e.target.value })}
                        required
                    />
                )

            case 'Decorator':
                return (
                    <>
                        <input
                            className="input"
                            type="text"
                            placeholder="Workshop Name"
                            value={userData.workshopName}
                            onChange={e => setUserData({ ...userData, workshopName: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            type="text"
                            placeholder="Craft Type"
                            value={userData.craftType}
                            onChange={e => setUserData({ ...userData, craftType: e.target.value })}
                            required
                        />
                    </>
                )
        }
    }

    if (!isOwner) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
                <div className="card max-w-md text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-4">{message || 'Only the contract owner can access this page'}</p>
                    <Link href="/" className="btn-primary inline-block">
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">🔑 Register New User</h1>
                        <p className="text-gray-400">Contract Owner: {account.slice(0, 10)}...{account.slice(-8)}</p>
                    </div>
                    <Link href="/admin" className="btn-secondary">
                        Back to Admin
                    </Link>
                </div>

                {/* Message */}
                {message && (
                    <div className={`glass rounded-xl p-4 mb-6 ${message.includes('✅') ? 'border-emerald-500/50' : 'border-red-500/50'}`}>
                        <p className="text-white">{message}</p>
                    </div>
                )}

                {/* Registration Form */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">User Registration</h2>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Role Selection */}
                        <div>
                            <label className="label">Select Role</label>
                            <select
                                className="input"
                                value={selectedRole}
                                onChange={e => setSelectedRole(e.target.value)}
                            >
                                <option>Harvester</option>
                                <option>Transporter</option>
                                <option>Distributor</option>
                                <option>Wholesaler</option>
                                <option>Retailer</option>
                                <option>Consumer</option>
                                <option>Decorator</option>
                            </select>
                        </div>

                        {/* User Address */}
                        <div>
                            <label className="label">User Wallet Address *</label>
                            <input
                                className="input font-mono"
                                type="text"
                                placeholder="0x..."
                                value={userData.address}
                                onChange={e => setUserData({ ...userData, address: e.target.value })}
                                required
                            />
                        </div>

                        {/* Common Fields */}
                        <div>
                            <label className="label">Name *</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Full Name"
                                value={userData.name}
                                onChange={e => setUserData({ ...userData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Geographic Location</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="City, State, Country"
                                value={userData.geoLocation}
                                onChange={e => setUserData({ ...userData, geoLocation: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">Contact *</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Phone/Email"
                                value={userData.contact}
                                onChange={e => setUserData({ ...userData, contact: e.target.value })}
                                required
                            />
                        </div>

                        {/* Role-Specific Fields */}
                        <div className="space-y-4">
                            <label className="label">{selectedRole}-Specific Details</label>
                            {renderRoleSpecificFields()}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? '⏳ Registering...' : `Register as ${selectedRole}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
