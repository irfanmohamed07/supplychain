'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadWeb3, getContract } from '@/lib/web3'

export default function TransporterRegistration() {
    const router = useRouter()
    const [account, setAccount] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        vehicleType: 'Refrigerated Truck',
        coldChainSupport: true,
        capacity: '',
        serviceRegion: '',
        availability: '24/7',
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
            } catch (error) {
                console.error('Error:', error)
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
                router.push('/dashboard/transporter')
                return
            }

            // Call registerTransporterSelf function
            const receipt = await contract.methods.registerTransporterSelf(
                formData.vehicleType,
                formData.coldChainSupport,
                parseInt(formData.capacity) || 0,
                formData.serviceRegion,
                formData.availability,
                formData.contact
            ).send({ from: account })

            if (receipt) {
                alert('✅ Transporter Registration successful!')
                router.push('/dashboard/transporter')
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
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🚛
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">FloraChain</h1>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Logistics Module</p>
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
                    <div className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                        Fleet Provisioning
                    </div>
                    <h2 className="text-5xl font-black mb-4">Transporter Registration</h2>
                    <p className="text-gray-500 text-lg">Initialize your logistics fleet on the FloraChain network.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Vehicle Specification</label>
                        <select
                            value={formData.vehicleType}
                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500/50 transition-all appearance-none"
                        >
                            <option value="Refrigerated Truck" className="bg-black">Heavy Refrigerated Truck</option>
                            <option value="Climate Van" className="bg-black">Mid-Range Climate Van</option>
                            <option value="Electric Delivery" className="bg-black">Electric Last-Mile Vehicle</option>
                            <option value="Air Freight" className="bg-black">Specialized Air Logistics</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Payload Capacity (Units)</label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            placeholder="e.g., 5000"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-blue-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Service Boundary</label>
                        <input
                            type="text"
                            value={formData.serviceRegion}
                            onChange={(e) => setFormData({ ...formData, serviceRegion: e.target.value })}
                            placeholder="e.g., North-West corridor"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-blue-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Operational Uptime</label>
                        <input
                            type="text"
                            value={formData.availability}
                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                            placeholder="e.g., 24/7 or 06:00-22:00"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-blue-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Logistics Contact Protocol</label>
                        <input
                            type="tel"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            placeholder="+91 000 000 0000"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-blue-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">
                                🌡️
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Active Cold-Chain Protocol</h4>
                                <p className="text-sm text-gray-500">Certify that vehicle maintains required temperature parameters.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.coldChainSupport}
                                onChange={(e) => setFormData({ ...formData, coldChainSupport: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
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
                                    <span>Initialize Logistics Module</span>
                                    <span>⚡</span>
                                </>
                            )}
                        </button>

                        <Link
                            href="/"
                            className="block text-center mt-6 text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                        >
                            ← Back to Fleet Hub
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}
