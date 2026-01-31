'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WholesalerDashboard() {
    const [account, setAccount] = useState<string>('')
    useEffect(() => { if (typeof window.ethereum !== 'undefined') { window.ethereum.request({ method: 'eth_accounts' }).then((accounts: unknown) => { if ((accounts as string[]).length > 0) setAccount((accounts as string[])[0]) }) } }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <aside className="sidebar">
                <Link href="/" className="flex items-center gap-3 mb-8"><span className="text-3xl">🌸</span><div><h1 className="text-xl font-bold text-white">FloraChain</h1><p className="text-xs text-gray-400">Wholesaler Portal</p></div></Link>
                <nav className="space-y-1"><button className="sidebar-link w-full active"><span>📊</span> Dashboard</button><button className="sidebar-link w-full"><span>📦</span> Inventory</button><button className="sidebar-link w-full"><span>🛒</span> Orders</button><button className="sidebar-link w-full"><span>💰</span> Pricing</button></nav>
                <div className="mt-auto pt-8"><div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-sm font-mono text-emerald-400">{account.slice(0, 8)}...{account.slice(-6)}</p></div></div>
            </aside>
            <main className="main-content">
                <h2 className="text-3xl font-bold text-white mb-8">Wholesaler Dashboard</h2>
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="stats-card"><div className="value">15K</div><p className="label">Flowers in Stock</p></div>
                    <div className="stats-card"><div className="value">12</div><p className="label">Active Orders</p></div>
                    <div className="stats-card"><div className="value">₹1.2L</div><p className="label">Today's Sales</p></div>
                    <div className="stats-card"><div className="value">4.6⭐</div><p className="label">Rating</p></div>
                </div>
                <div className="card"><h3 className="text-xl font-bold mb-4">Today's Market Prices</h3>
                    <div className="grid grid-cols-4 gap-4">{[{ name: 'Red Roses', price: 25, change: '+5%' }, { name: 'Marigolds', price: 8, change: '-2%' }, { name: 'Lilies', price: 45, change: '+3%' }, { name: 'Orchids', price: 120, change: '0%' }].map((f, i) => (<div key={i} className="bg-gray-800/50 rounded-xl p-4 text-center"><p className="font-bold">{f.name}</p><p className="text-2xl text-emerald-400">₹{f.price}</p><p className={`text-sm ${f.change.includes('+') ? 'text-green-400' : f.change.includes('-') ? 'text-red-400' : 'text-gray-400'}`}>{f.change}</p></div>))}</div>
                </div>
            </main>
        </div>
    )
}
