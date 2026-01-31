'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadWeb3, getContract } from '@/lib/web3'

declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
        }
    }
}

export default function HarvesterRegistration() {
    const router = useRouter()
    const [account, setAccount] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        farmerName: '',
        farmName: '',
        geoLocation: '',
        flowerTypes: '',
        dailyCapacity: '',
        seasonalFlowers: '',
        contact: ''
    })

    useEffect(() => {
        checkConnection()
    }, [])

    const checkConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                } else {
                    // Redirect back if not connected
                    router.push('/')
                }
            } catch (error) {
                console.error('Error:', error)
                router.push('/')
            }
        } else {
            router.push('/')
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await loadWeb3()
            const { contract, account } = await getContract()
            
            // Check if already registered
            const role = await contract.methods.addressToRole(account).call()
            if (parseInt(role) !== 0) {
                alert('You are already registered with a role. Please use your dashboard.')
                router.push('/dashboard/harvester')
                return
            }

            // Call registerHarvesterSelf function
            const receipt = await contract.methods.registerHarvesterSelf(
                formData.farmerName,
                formData.farmName,
                formData.geoLocation,
                formData.flowerTypes,
                formData.dailyCapacity,
                formData.seasonalFlowers,
                formData.contact
            ).send({ from: account })

            if (receipt) {
                alert('✅ Registration successful! You can now access the Harvester Dashboard.')
                router.push('/dashboard/harvester')
            }
        } catch (error: any) {
            console.error('Registration failed:', error)
            let errorMessage = 'Registration failed. Please try again.'
            
            if (error?.message) {
                if (error.message.includes('Already registered')) {
                    errorMessage = 'You are already registered. Redirecting to dashboard...'
                    setTimeout(() => router.push('/dashboard/harvester'), 2000)
                } else {
                    errorMessage = error.message
                }
            }
            
            alert(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Header */}
            <header className="py-6 px-8 flex justify-between items-center border-b border-gray-700/50 backdrop-blur-sm">
                <Link href="/" className="flex items-center gap-3">
                    <span className="text-4xl">🌸</span>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                            FloraChain
                        </h1>
                        <p className="text-xs text-gray-400">Harvester Registration</p>
                    </div>
                </Link>

                {account && (
                    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700">
                        <p className="text-xs text-gray-400">Connected Wallet</p>
                        <p className="text-sm font-mono text-emerald-400">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </p>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <div className="max-w-3xl mx-auto py-12 px-8">
                {/* Title Section */}
                <div className="text-center mb-12">
                    <div className="text-6xl mb-4">🌾</div>
                    <h2 className="text-3xl font-bold mb-2">Register as Harvester</h2>
                    <p className="text-gray-400">Join the FloraChain network as a flower farmer</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Farmer Name */}
                    <div>
                        <label className="label">Farmer Name *</label>
                        <input
                            type="text"
                            name="farmerName"
                            value={formData.farmerName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="input"
                            required
                        />
                    </div>

                    {/* Farm Name */}
                    <div>
                        <label className="label">Farm Name *</label>
                        <input
                            type="text"
                            name="farmName"
                            value={formData.farmName}
                            onChange={handleInputChange}
                            placeholder="Enter your farm name"
                            className="input"
                            required
                        />
                    </div>

                    {/* Geo Location */}
                    <div>
                        <label className="label">Geo-Location (Latitude, Longitude) *</label>
                        <input
                            type="text"
                            name="geoLocation"
                            value={formData.geoLocation}
                            onChange={handleInputChange}
                            placeholder="e.g., 28.6139, 77.2090"
                            className="input"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                                Find your coordinates →
                            </a>
                        </p>
                    </div>

                    {/* Flower Types */}
                    <div>
                        <label className="label">Flower Types Grown *</label>
                        <input
                            type="text"
                            name="flowerTypes"
                            value={formData.flowerTypes}
                            onChange={handleInputChange}
                            placeholder="e.g., Roses, Marigolds, Lilies, Orchids"
                            className="input"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate multiple flower types with commas</p>
                    </div>

                    {/* Daily Capacity */}
                    <div>
                        <label className="label">Daily Harvest Capacity (stems/bunches) *</label>
                        <input
                            type="number"
                            name="dailyCapacity"
                            value={formData.dailyCapacity}
                            onChange={handleInputChange}
                            placeholder="e.g., 5000"
                            className="input"
                            min="1"
                            required
                        />
                    </div>

                    {/* Seasonal Flowers */}
                    <div>
                        <label className="label">Seasonal Availability</label>
                        <textarea
                            name="seasonalFlowers"
                            value={formData.seasonalFlowers}
                            onChange={handleInputChange}
                            placeholder="Describe seasonal flowers availability (e.g., Marigolds: Oct-Dec, Roses: Year-round)"
                            className="input"
                            rows={3}
                        />
                    </div>

                    {/* Contact */}
                    <div>
                        <label className="label">Contact Number *</label>
                        <input
                            type="tel"
                            name="contact"
                            value={formData.contact}
                            onChange={handleInputChange}
                            placeholder="e.g., +91 9876543210"
                            className="input"
                            required
                        />
                    </div>

                    {/* Wallet Info */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <span>🔐</span> Blockchain Identity
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Wallet Address:</span>
                                <span className="font-mono text-emerald-400">{account}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Role:</span>
                                <span className="text-white">Harvester (Farmer)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Initial Reputation:</span>
                                <span className="text-yellow-400">100 ⭐</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            Your wallet address will be your unique identifier on the blockchain.
                            This transaction will require a small gas fee.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner !w-5 !h-5"></div>
                                <span>Registering on Blockchain...</span>
                            </>
                        ) : (
                            <>
                                <span>🌾</span>
                                <span>Register as Harvester</span>
                            </>
                        )}
                    </button>

                    {/* Back Link */}
                    <Link
                        href="/"
                        className="block text-center text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Role Selection
                    </Link>
                </form>
            </div>
        </main>
    )
}
