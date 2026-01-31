'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadWeb3, getContract } from '@/lib/web3'

export default function DistributorRegistration() {
    const router = useRouter()
    const [account, setAccount] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        shopName: '',
        shopAddress: '',
        geoLocation: '',
        storageType: 'Warehouse',
        hasColdStorage: false,
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
                    router.push('/')
                }
            } catch {
                router.push('/')
            }
        } else {
            router.push('/')
        }
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
                alert('You are already registered with a role.')
                router.push('/dashboard/distributor')
                return
            }

            // Call registerDistributorSelf function
            const receipt = await contract.methods.registerDistributorSelf(
                formData.shopName,
                formData.shopAddress,
                formData.geoLocation,
                formData.storageType,
                formData.hasColdStorage,
                formData.contact
            ).send({ from: account })

            if (receipt) {
                alert('✅ Distributor Registration successful!')
                router.push('/dashboard/distributor')
            }
        } catch (error: any) {
            console.error('Registration failed:', error)
            alert(error?.message || 'Registration failed. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-pink-500/30">
            {/* Header */}
            <header className="py-8 px-12 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🏭
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">FloraChain</h1>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Distributor Module</p>
                    </div>
                </Link>

                {account && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Terminal Linked</p>
                            <p className="text-sm font-bold font-mono text-emerald-400">
                                {account.slice(0, 8)}...{account.slice(-6)}
                            </p>
                        </div>
                    </div>
                )}
            </header>

            <div className="max-w-4xl mx-auto py-20 px-8">
                <div className="mb-16 text-center">
                    <div className="inline-block px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-6">
                        Logistics Provisioning
                    </div>
                    <h2 className="text-5xl font-black mb-4">Distributor Registration</h2>
                    <p className="text-gray-500 text-lg">Initialize your distribution hub credentials on the blockchain.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Distribution Center Name</label>
                        <input
                            type="text"
                            value={formData.shopName}
                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                            placeholder="e.g., Central Flower Hub Hub"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-violet-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Hub Address</label>
                        <input
                            type="text"
                            value={formData.shopAddress}
                            onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                            placeholder="Full physical address"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-violet-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Geo-Coordinates</label>
                        <input
                            type="text"
                            value={formData.geoLocation}
                            onChange={(e) => setFormData({ ...formData, geoLocation: e.target.value })}
                            placeholder="e.g., 19.0760, 72.8777"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-violet-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Facility Type</label>
                        <select
                            value={formData.storageType}
                            onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-violet-500/50 transition-all appearance-none"
                        >
                            <option value="Warehouse" className="bg-black">Bulk Warehouse</option>
                            <option value="Cold Storage" className="bg-black">Dedicated Cold Storage</option>
                            <option value="Terminal" className="bg-black">Cross-Docking Terminal</option>
                            <option value="Silo" className="bg-black">Automated Storage Silo</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Contact Protocol</label>
                        <input
                            type="tel"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            placeholder="+91 000 000 0000"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-violet-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-between group hover:border-violet-500/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">
                                ❄️
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Integrated Cold-Chain</h4>
                                <p className="text-sm text-gray-500">Enable advanced IoT freshness monitoring and MILP priority.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.hasColdStorage}
                                onChange={(e) => setFormData({ ...formData, hasColdStorage: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                    </div>

                    <div className="col-span-1 md:col-span-2 pt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-6 bg-white text-black rounded-2xl font-black text-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                                    <span>Syncing with Ledger...</span>
                                </>
                            ) : (
                                <>
                                    <span>Initialize Distributor Module</span>
                                    <span>⚡</span>
                                </>
                            )}
                        </button>

                        <Link
                            href="/"
                            className="block text-center mt-6 text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                        >
                            ← Back to Hub
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}
