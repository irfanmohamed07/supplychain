'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'

interface Shipment {
    id: number
    batchId: number
    fromTo: string
    flowers: string
    qty: number
    status: string
    freshness: number
}

export default function DistributorDashboard() {
    const router = useRouter()
    const [account, setAccount] = useState<string>('')
    const [balance, setBalance] = useState<string>('0.00')
    const [activeTab, setActiveTab] = useState('inventory')
    const [incoming, setIncoming] = useState<Shipment[]>([])
    const [outgoing, setOutgoing] = useState<Shipment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setIsLoading(true)
        await checkConnection()
        loadMockData()
        setIsLoading(false)
    }

    const checkConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                    const balance = await window.ethereum.request({
                        method: 'eth_getBalance',
                        params: [accounts[0], 'latest']
                    }) as string
                    setBalance((parseInt(balance, 16) / 1e18).toFixed(4))
                } else {
                    router.push('/')
                }
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    const loadMockData = () => {
        setIncoming([
            { id: 1, batchId: 104, fromTo: 'Green Valley Farms', flowers: 'Arctic Lilies', qty: 500, status: 'In Transit', freshness: 94 },
            { id: 2, batchId: 106, fromTo: 'Blue Ridge Farm', flowers: 'Midnight Roses', qty: 1200, status: 'Picked Up', freshness: 88 }
        ])
        setOutgoing([
            { id: 1, batchId: 98, fromTo: 'Rose Garden Florist', flowers: 'Golden Sunflowers', qty: 300, status: 'Ready', freshness: 91 }
        ])
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-80 bg-black border-r border-white/5 flex flex-col p-8 z-50">
                <Link href="/" className="flex items-center gap-4 mb-16 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                        📦
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">FloraChain</h1>
                        <p className="text-[10px] text-purple-500/50 font-mono uppercase tracking-widest leading-none">Distributor Ops</p>
                    </div>
                </Link>

                <nav className="space-y-2 flex-1">
                    {[
                        { id: 'inventory', label: 'Storage Hub', icon: '🏪' },
                        { id: 'incoming', label: 'Incoming Flow', icon: '📥' },
                        { id: 'outgoing', label: 'Outgoing Flow', icon: '📤' },
                        { id: 'coldstorage', label: 'Thermal Control', icon: '❄️' },
                        { id: 'settlements', label: 'Financial Ledger', icon: '📜' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === item.id
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto bg-white/5 border border-white/10 rounded-3xl p-6">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Network Capital</p>
                    <p className="text-2xl font-black text-purple-400">Ξ {balance}</p>
                    <div className="mt-4 pt-4 border-t border-white/5 overflow-hidden">
                        <p className="text-[10px] text-gray-600 font-mono truncate">{account}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <section className="ml-80 p-12">
                <header className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter mb-2">Distribution Node</h2>
                        <p className="text-gray-500 font-medium">B2B supply chain coordination and asset preservation.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl">
                            Request Audit
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                    {[
                        { label: 'Incoming Lots', value: '2', icon: '📥' },
                        { label: 'Stock Volume', value: '5.2K', icon: '📦' },
                        { label: 'Outbound Tasks', value: '1', icon: '📤' },
                        { label: 'Vault Temp', value: '4.2°C', icon: '❄️' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] p-8 hover:border-purple-500/30 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-3xl">{stat.icon}</span>
                                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            </div>
                            <p className="text-4xl font-black mb-1">{stat.value}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Incoming */}
                    <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-widest">Incoming Shipments</h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-purple-500">View All</button>
                        </div>
                        <div className="space-y-4">
                            {incoming.map(item => (
                                <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 group hover:border-purple-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm font-black">{item.flowers}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">From: {item.fromTo}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase tracking-widest rounded-full">
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] text-gray-600 font-bold uppercase">Integrity Score</p>
                                            <p className="text-xs font-bold text-emerald-400">{item.freshness}%</p>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${item.freshness}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Outgoing */}
                    <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-widest">Ready to Dispatch</h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-purple-500">View All</button>
                        </div>
                        <div className="space-y-4">
                            {outgoing.map(item => (
                                <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 group hover:border-purple-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-sm font-black">{item.flowers}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">To: {item.fromTo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-purple-400">{item.qty} Units</p>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase mt-1 tracking-tighter">Approved for Transit</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2">
                                        <span>Execute Dispatch</span>
                                        <span className="text-base">⚡</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Thermal Insights */}
                <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 border border-blue-500/20 rounded-[40px] p-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[28px] bg-blue-500/20 flex items-center justify-center text-3xl">❄️</div>
                        <div>
                            <h4 className="text-2xl font-black mb-1">Cold-Vault Status</h4>
                            <p className="text-sm text-gray-500">All storage units are operating at optimal <span className="text-blue-400">4.0°C - 4.5°C</span> levels.</p>
                        </div>
                    </div>
                    <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        View Thermal History
                    </button>
                </div>
            </section>
        </main>
    )
}
