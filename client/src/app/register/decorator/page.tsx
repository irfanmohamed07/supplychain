'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadWeb3, getContract } from '@/lib/web3'

export default function DecoratorRegistration() {
    const router = useRouter()
    const [account, setAccount] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        workshopName: '',
        craftType: 'Dried Flower Arrangements',
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
                router.push('/dashboard/decorator')
                return
            }

            // Call registerDecoratorSelf function
            const receipt = await contract.methods.registerDecoratorSelf(
                formData.workshopName,
                formData.craftType,
                formData.contact
            ).send({ from: account })

            if (receipt) {
                alert('✅ Decorator Registration successful!')
                router.push('/dashboard/decorator')
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
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🎨
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">FloraChain</h1>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Decorator Module</p>
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
                    <div className="inline-block px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">
                        Creative Provisioning
                    </div>
                    <h2 className="text-5xl font-black mb-4">Decorator Registration</h2>
                    <p className="text-gray-500 text-lg">Initialize your artisanal workshop on the blockchain to receive recycled floral assets.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Artisanal Workshop Name</label>
                        <input
                            type="text"
                            value={formData.workshopName}
                            onChange={(e) => setFormData({ ...formData, workshopName: e.target.value })}
                            placeholder="e.g., The Eternal Bloom Studio"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-orange-500/50 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Craft Specialization</label>
                            <select
                                value={formData.craftType}
                                onChange={(e) => setFormData({ ...formData, craftType: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all appearance-none"
                            >
                                <option value="Dried Flower Arrangements" className="bg-black">Dried Flower Arrangements</option>
                                <option value="Potpourri" className="bg-black">Premium Potpourri Production</option>
                                <option value="Pressed Flower Art" className="bg-black">Pressed Flower Art</option>
                                <option value="Wreaths & Decorations" className="bg-black">Wreaths & Event Decorations</option>
                                <option value="Flower Candles" className="bg-black">Handmade Floral Candles</option>
                                <option value="Bio-Pigments" className="bg-black">Natural Dye & Bio-Pigments</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Contact Protocol</label>
                            <input
                                type="tel"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                placeholder="+91 000 000 0000"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-orange-500/50 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-8">
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
                                    <span>Initialize Decorator Account</span>
                                    <span>🎨</span>
                                </>
                            )}
                        </button>

                        <Link
                            href="/"
                            className="block text-center mt-6 text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                        >
                            ← Back to Portal
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}
