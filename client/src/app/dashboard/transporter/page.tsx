'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'

interface DeliveryData {
    id: number
    batchId: number
    flowerName: string
    from: string
    to: string
    status: string
    quantity: number
    tempStatus: string
}

export default function TransporterDashboard() {
    const router = useRouter()
    const [account, setAccount] = useState<string>('')
    const [balance, setBalance] = useState<string>('0.00')
    const [activeTab, setActiveTab] = useState('fleet')
    const [deliveries, setDeliveries] = useState<DeliveryData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setIsLoading(true)
        await checkConnection()
        await loadDeliveries()
        setIsLoading(false)
    }

    const checkConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                    await getBalance(accounts[0])
                } else {
                    router.push('/')
                }
            } catch (error) {
                console.error('Error:', error)
            }
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

    const loadDeliveries = async () => {
        // Mocking real blockchain filtering for now as createOrder transporterId logic is demo-level
        setDeliveries([
            { id: 1, batchId: 104, flowerName: 'Arctic Lilies', from: 'Pune Sector 4', to: 'Mumbai Hub', status: 'In Transit', quantity: 500, tempStatus: 'Optimal (4.2°C)' },
            { id: 2, batchId: 105, flowerName: 'Midnight Roses', from: 'Nashik Farm', to: 'Delhi Express', status: 'Picked Up', quantity: 1200, tempStatus: 'Optimal (3.8°C)' },
            { id: 3, batchId: 98, flowerName: 'Golden Sunflowers', from: 'Green Valley', to: 'Kolkata Center', status: 'Delivered', quantity: 300, tempStatus: 'Maintained' },
        ])
    }

    const handleTempPing = async (batchId: number) => {
        try {
            await loadWeb3()
            const { contract, account } = await getContract()

            // Simulation of IoT sensor ping
            const randomTemp = Math.floor(Math.random() * 600) + 200 // 2.0 to 8.0 C

            await contract.methods.recordTemperature(
                batchId,
                randomTemp,
                "Transit Sector 7G"
            ).send({ from: account })

            alert(`✅ Temperature Ping Recorded: ${(randomTemp / 100).toFixed(1)}°C. Ledger Updated.`)
        } catch (error: any) {
            alert(error?.message || 'Ledger update failed.')
        }
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-80 bg-black border-r border-white/5 flex flex-col p-8 z-50">
                <Link href="/" className="flex items-center gap-4 mb-16 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        🚛
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">FloraChain</h1>
                        <p className="text-[10px] text-blue-500/50 font-mono uppercase tracking-widest leading-none">Logistics Ops</p>
                    </div>
                </Link>

                <nav className="space-y-2 flex-1">
                    {[
                        { id: 'fleet', label: 'Fleet Terminal', icon: '🚛' },
                        { id: 'routes', label: 'Route Optimizer', icon: '📍' },
                        { id: 'coldchain', label: 'Cold-Chain IoT', icon: '🌡️' },
                        { id: 'ledger', label: 'Transit Ledger', icon: '📜' },
                        { id: 'earnings', label: 'Settle Capital', icon: '💰' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === item.id
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto bg-white/5 border border-white/10 rounded-3xl p-6">
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Gas Reservoir</p>
                    <p className="text-2xl font-black text-blue-400">Ξ {balance}</p>
                    <div className="mt-4 pt-4 border-t border-white/5 overflow-hidden">
                        <p className="text-[10px] text-gray-600 font-mono truncate">{account}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <section className="ml-80 p-12">
                <header className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter mb-2">Transit Control</h2>
                        <p className="text-gray-500 font-medium">Real-time IoT integration for flowers in movement.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Fleet Status</p>
                            <p className="text-emerald-400 font-bold text-sm uppercase">All Nodes Optimal</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                    {[
                        { label: 'Active Manifests', value: '3', icon: '📦', color: 'blue' },
                        { label: 'Avg Temp (C)', value: '4.2°', icon: '🌡️', color: 'cyan' },
                        { label: 'Route Efficiency', value: '94%', icon: '📍', color: 'indigo' },
                        { label: 'Pending Payout', value: 'Ξ 0.42', icon: '💰', color: 'emerald' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] p-8 hover:border-blue-500/30 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="text-3xl">{stat.icon}</div>
                                <div className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`}></div>
                            </div>
                            <p className="text-4xl font-black mb-1">{stat.value}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
                    <div className="p-10 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase tracking-widest">Active Manifest Ledger</h3>
                        <div className="flex gap-3">
                            <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">Cold Chain Secured</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="px-10 py-6">Manifest ID</th>
                                    <th className="px-10 py-6">Origin & Destination</th>
                                    <th className="px-10 py-6">Cargo Details</th>
                                    <th className="px-10 py-6">Ledger Stage</th>
                                    <th className="px-10 py-6">IoT Telemetry</th>
                                    <th className="px-10 py-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {deliveries.map(dev => (
                                    <tr key={dev.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-10 py-6 font-mono text-xs text-gray-400">#MN-{dev.batchId}</td>
                                        <td className="px-10 py-6 text-sm">
                                            <div className="space-y-1">
                                                <p className="font-bold">FROM: {dev.from}</p>
                                                <p className="text-gray-500">TO: {dev.to}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="font-black text-sm">{dev.flowerName}</p>
                                            <p className="text-xs text-gray-600 uppercase font-bold tracking-tighter">{dev.quantity} Units</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${dev.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {dev.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs font-bold text-gray-400">{dev.tempStatus}</span>
                                                <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: '85%' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleTempPing(dev.batchId)}
                                                    className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
                                                >
                                                    T-PING
                                                </button>
                                                <button className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Update</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Automation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 rounded-[40px] p-10 flex gap-8 items-center group cursor-pointer hover:border-blue-500/50 transition-all">
                        <div className="w-24 h-24 rounded-[32px] bg-blue-500/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">📍</div>
                        <div>
                            <h4 className="text-2xl font-black mb-2">MILP Optimizer</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">Execute deterministic route optimization to minimize fuel consumption and freshness decay.</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20 rounded-[40px] p-10 flex gap-8 items-center group cursor-pointer hover:border-violet-500/50 transition-all">
                        <div className="w-24 h-24 rounded-[32px] bg-violet-500/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">🤖</div>
                        <div>
                            <h4 className="text-2xl font-black mb-2">Auto-Logistics</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">Automate manifest assignments based on location proximity and vehicle thermal capability.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
