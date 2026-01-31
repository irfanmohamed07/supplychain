'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'

interface BatchData {
    id: number
    flowerName: string
    quantity: number
    cutTime: string
    freshnessLife: number
    freshnessScore: number
    pricePerUnit: number
    stage: string
    isAvailable: boolean
}

export default function HarvesterDashboard() {
    const router = useRouter()
    const [account, setAccount] = useState<string>('')
    const [balance, setBalance] = useState<string>('0.00')
    const [activeTab, setActiveTab] = useState('inventory')
    const [showCreateBatch, setShowCreateBatch] = useState(false)
    const [batches, setBatches] = useState<BatchData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [batchForm, setBatchForm] = useState({
        flowerName: '',
        description: '',
        quantity: '',
        freshnessLife: '72',
        season: 'Winter',
        imageHash: '',
        pricePerUnit: ''
    })

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setIsLoading(true)
        await checkConnection()
        setIsLoading(false)
    }

    const checkConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                    await getBalance(accounts[0])
                    await loadBatches(accounts[0])
                } else {
                    router.push('/')
                }
            } catch (error) {
                console.error('Error:', error)
            }
        } else {
            router.push('/')
        }
    }

    const getBalance = async (addr: string) => {
        try {
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [addr, 'latest']
            }) as string
            const ethBalance = parseInt(balance, 16) / 1e18
            setBalance(ethBalance.toFixed(4))
        } catch (error) {
            console.error('Error getting balance:', error)
        }
    }

    const loadBatches = async (userAddr: string) => {
        try {
            await loadWeb3()
            const { contract } = await getContract()

            const role = await contract.methods.addressToRole(userAddr).call()
            if (parseInt(role) !== 1) return

            const harvesterId = await contract.methods.addressToRoleId(userAddr).call()
            const batchCount = await contract.methods.batchCtr().call()

            const loadedBatches: BatchData[] = []
            for (let i = 1; i <= parseInt(batchCount); i++) {
                try {
                    const batch = await contract.methods.batches(i).call()
                    if (parseInt(batch.harvesterId) === parseInt(harvesterId)) {
                        const stage = await contract.methods.getBatchStage(i).call()
                        const freshnessScore = await contract.methods.calculateFreshnessScore(i).call()

                        loadedBatches.push({
                            id: parseInt(batch.batchId),
                            flowerName: batch.flowerName,
                            quantity: parseInt(batch.quantity),
                            cutTime: new Date(parseInt(batch.cutTime) * 1000).toLocaleString(),
                            freshnessLife: parseInt(batch.freshnessLife),
                            freshnessScore: parseInt(freshnessScore),
                            pricePerUnit: parseFloat(batch.pricePerUnit) / 1e18,
                            stage: stage,
                            isAvailable: batch.isAvailable
                        })
                    }
                } catch (e) { }
            }
            setBatches(loadedBatches.reverse())
        } catch (error) {
            console.error('Error loading batches:', error)
        }
    }

    const handleCreateBatch = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await loadWeb3()
            const { contract, account, web3 } = await getContract()

            const priceInWei = web3.utils.toWei(batchForm.pricePerUnit, 'ether')

            await contract.methods.createBatch(
                batchForm.flowerName,
                batchForm.description,
                parseInt(batchForm.quantity),
                parseInt(batchForm.freshnessLife),
                batchForm.season,
                batchForm.imageHash || 'QmDefault',
                priceInWei
            ).send({ from: account })

            alert('✅ Harvest Batch cryptographically signed and added to ledger.')
            setShowCreateBatch(false)
            setBatchForm({
                flowerName: '',
                description: '',
                quantity: '',
                freshnessLife: '72',
                season: 'Winter',
                imageHash: '',
                pricePerUnit: ''
            })
            await loadBatches(account)
        } catch (error: any) {
            console.error('Error:', error)
            alert(error?.message || 'Transaction failed.')
        } finally {
            setIsLoading(false)
        }
    }

    const stats = {
        activeBatches: batches.filter(b => b.isAvailable).length,
        totalRevenue: (batches.filter(b => !b.isAvailable).reduce((sum, b) => sum + b.pricePerUnit * b.quantity, 0)).toFixed(2),
        avgFreshness: batches.length > 0 ? Math.round(batches.reduce((sum, b) => sum + b.freshnessScore, 0) / batches.length) : 0,
        pendingOrders: 3 // Mock data for now
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-80 bg-black border-r border-white/5 flex flex-col p-8 z-50">
                <Link href="/" className="flex items-center gap-4 mb-16 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        🌿
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">FloraChain</h1>
                        <p className="text-[10px] text-emerald-500/50 font-mono uppercase tracking-widest leading-none">Harvester Ops</p>
                    </div>
                </Link>

                <nav className="space-y-2 flex-1">
                    {[
                        { id: 'inventory', label: 'Batch Inventory', icon: '🌷' },
                        { id: 'orders', label: 'Active Orders', icon: '📦' },
                        { id: 'fleet', label: 'Logistics Link', icon: '🚛' },
                        { id: 'analytics', label: 'Yield Analytics', icon: '📉' },
                        { id: 'settings', label: 'Facility Profile', icon: '⚙️' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === item.id
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Network Liquidity</p>
                        <p className="text-2xl font-black text-emerald-400">Ξ {balance}</p>
                        <div className="mt-4 pt-4 border-t border-white/5 overflow-hidden">
                            <p className="text-[10px] text-gray-600 font-mono truncate">{account}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <section className="ml-80 p-12">
                <header className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter mb-2">Operations Center</h2>
                        <p className="text-gray-500 font-medium">Real-time cryptographic oversight of your floral harvest chain.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateBatch(true)}
                        className="bg-white text-black px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-2xl flex items-center gap-4 group"
                    >
                        <span>Initiate Harvest Batch</span>
                        <span className="group-hover:translate-x-1 transition-transform">⚡</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                    {[
                        { label: 'Live Inventory', value: stats.activeBatches, icon: '🌸', color: 'emerald' },
                        { label: 'Settled Capital', value: `Ξ ${stats.totalRevenue}`, icon: '💰', color: 'blue' },
                        { label: 'Chain Integrity', value: `${stats.avgFreshness}%`, icon: '🌡️', color: 'amber' },
                        { label: 'Locked Orders', value: stats.pendingOrders, icon: '📦', color: 'purple' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] p-8 group hover:border-emerald-500/30 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="text-3xl">{stat.icon}</div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
                            <p className="text-4xl font-black mb-1">{stat.value}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Batch List */}
                <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
                    <div className="p-10 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase tracking-widest">Active Batch Ledger</h3>
                        <div className="flex gap-4">
                            <input type="text" placeholder="Filter Ledger..." className="bg-black border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500/50" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="px-10 py-6">Reference ID</th>
                                    <th className="px-10 py-6">Asset Type</th>
                                    <th className="px-10 py-6">Volume</th>
                                    <th className="px-10 py-6">Chain Status</th>
                                    <th className="px-10 py-6">Viability</th>
                                    <th className="px-10 py-6">Unit Val</th>
                                    <th className="px-10 py-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {batches.map(batch => (
                                    <tr key={batch.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-10 py-6 font-mono text-xs text-gray-400">#FL-{batch.id.toString().padStart(5, '0')}</td>
                                        <td className="px-10 py-6 font-black text-sm">{batch.flowerName}</td>
                                        <td className="px-10 py-6 font-bold text-gray-500">{batch.quantity} Units</td>
                                        <td className="px-10 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${batch.stage === 'Harvested' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {batch.stage}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${batch.freshnessScore}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">{batch.freshnessScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 font-mono font-bold text-emerald-500">Ξ {batch.pricePerUnit.toFixed(4)}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex gap-4">
                                                <button className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Audit</button>
                                                <button className="text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">Manifest</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Create Batch Modal */}
            {showCreateBatch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isLoading && setShowCreateBatch(false)}></div>
                    <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[48px] overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-4xl font-black tracking-tighter mb-2">Initialize Harvest</h3>
                                    <p className="text-gray-500 font-medium text-sm">Deploy a new floral asset batch to the blockchain.</p>
                                </div>

                                <div className="aspect-square bg-white/5 border border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center p-8 border-dashed group hover:border-emerald-500/30 transition-all cursor-pointer">
                                    <div className="text-5xl mb-4 grayscale group-hover:grayscale-0 transition-all">📸</div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-600 group-hover:text-emerald-500">Attach Cryptographic Evidence</p>
                                    <p className="text-[10px] text-gray-700 mt-2 font-mono">JPG, PNG OR IPFS HASH</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateBatch} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Species Identification</label>
                                    <input
                                        type="text"
                                        required
                                        value={batchForm.flowerName}
                                        onChange={e => setBatchForm({ ...batchForm, flowerName: e.target.value })}
                                        placeholder="e.g., Arctic White Lilies"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Lot Quantity</label>
                                        <input
                                            type="number"
                                            required
                                            value={batchForm.quantity}
                                            onChange={e => setBatchForm({ ...batchForm, quantity: e.target.value })}
                                            placeholder="500"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Freshness (Hrs)</label>
                                        <input
                                            type="number"
                                            required
                                            value={batchForm.freshnessLife}
                                            onChange={e => setBatchForm({ ...batchForm, freshnessLife: e.target.value })}
                                            placeholder="72"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Unit Valuation (Ξ)</label>
                                    <input
                                        type="text"
                                        required
                                        value={batchForm.pricePerUnit}
                                        onChange={e => setBatchForm({ ...batchForm, pricePerUnit: e.target.value })}
                                        placeholder="0.0025"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500/50 font-mono text-emerald-400"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Seasonality</label>
                                    <select
                                        value={batchForm.season}
                                        onChange={e => setBatchForm({ ...batchForm, season: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500/50 uppercase font-bold text-xs tracking-widest appearance-none text-white"
                                    >
                                        <option value="Winter" className="bg-black">Winter Projection</option>
                                        <option value="Spring" className="bg-black">Spring Growth</option>
                                        <option value="Summer" className="bg-black">Summer Cycle</option>
                                        <option value="Autumn" className="bg-black">Autumn Falling</option>
                                    </select>
                                </div>

                                <div className="pt-6 grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateBatch(false)}
                                        className="py-5 rounded-2xl border border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
                                    >
                                        {isLoading ? 'Processing...' : 'Deploy to Ledger'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
