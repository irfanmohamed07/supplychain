'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RetailerDashboard() {
    const [account, setAccount] = useState<string>('')
    const [inventory] = useState([
        { id: 1, name: 'Red Roses', qty: 150, freshness: 92, price: 30, lowStock: false },
        { id: 2, name: 'White Lilies', qty: 80, freshness: 85, price: 55, lowStock: false },
        { id: 3, name: 'Yellow Marigolds', qty: 25, freshness: 78, price: 12, lowStock: true },
        { id: 4, name: 'Purple Orchids', qty: 30, freshness: 88, price: 150, lowStock: false }
    ])

    useEffect(() => { if (typeof window.ethereum !== 'undefined') { window.ethereum.request({ method: 'eth_accounts' }).then((accounts: unknown) => { if ((accounts as string[]).length > 0) setAccount((accounts as string[])[0]) }) } }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <aside className="sidebar">
                <Link href="/" className="flex items-center gap-3 mb-8"><span className="text-3xl">🌸</span><div><h1 className="text-xl font-bold text-white">FloraChain</h1><p className="text-xs text-gray-400">Retailer Portal</p></div></Link>
                <nav className="space-y-1"><button className="sidebar-link w-full active"><span>📊</span> Dashboard</button><button className="sidebar-link w-full"><span>🌷</span> Inventory</button><button className="sidebar-link w-full"><span>🛒</span> Orders</button><button className="sidebar-link w-full"><span>📱</span> POS</button><button className="sidebar-link w-full"><span>📦</span> Restock</button></nav>
                <div className="mt-auto pt-8"><div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-sm font-mono text-emerald-400">{account.slice(0, 8)}...{account.slice(-6)}</p></div></div>
            </aside>
            <main className="main-content">
                <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-white">Retailer Dashboard</h2><p className="text-gray-400">Rose Garden Florist</p></div><button className="btn-primary">+ Add Stock</button></div>

                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="stats-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-2xl">💐</div><div><p className="value">285</p><p className="label">In Stock</p></div></div></div>
                    <div className="stats-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">🛒</div><div><p className="value">8</p><p className="label">Orders Today</p></div></div></div>
                    <div className="stats-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">💰</div><div><p className="value">₹12.5K</p><p className="label">Today's Sales</p></div></div></div>
                    <div className="stats-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-2xl">⚠️</div><div><p className="value">1</p><p className="label">Low Stock</p></div></div></div>
                </div>

                <div className="card"><h3 className="text-xl font-bold mb-4">Current Inventory</h3>
                    <div className="grid grid-cols-4 gap-4">{inventory.map((item) => (<div key={item.id} className={`bg-gray-800/50 rounded-xl p-4 border ${item.lowStock ? 'border-yellow-500/50' : 'border-gray-700'}`}>
                        <div className="flex justify-between items-start mb-2"><span className="font-bold">{item.name}</span>{item.lowStock && <span className="badge badge-warning text-xs">Low</span>}</div>
                        <p className="text-2xl font-bold text-white">{item.qty}</p>
                        <div className="flex items-center gap-2 mt-2"><span className="text-xs text-gray-400">Freshness:</span><div className="flex-1 h-1.5 bg-gray-700 rounded-full"><div className={`h-full rounded-full ${item.freshness >= 85 ? 'bg-emerald-500' : item.freshness >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.freshness}%` }}></div></div><span className="text-xs">{item.freshness}%</span></div>
                        <p className="text-sm text-gray-400 mt-2">₹{item.price}/stem</p>
                    </div>))}</div>
                </div>
            </main>
        </div>
    )
}
