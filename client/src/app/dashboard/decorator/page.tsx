'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DecoratorDashboard() {
    const [account, setAccount] = useState<string>('')
    useEffect(() => { if (typeof window.ethereum !== 'undefined') { window.ethereum.request({ method: 'eth_accounts' }).then((accounts: unknown) => { if ((accounts as string[]).length > 0) setAccount((accounts as string[])[0]) }) } }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <aside className="sidebar">
                <Link href="/" className="flex items-center gap-3 mb-8"><span className="text-3xl">🌸</span><div><h1 className="text-xl font-bold text-white">FloraChain</h1><p className="text-xs text-gray-400">Decorator Portal</p></div></Link>
                <nav className="space-y-1"><button className="sidebar-link w-full active"><span>📊</span> Dashboard</button><button className="sidebar-link w-full"><span>♻️</span> Recyclable Flowers</button><button className="sidebar-link w-full"><span>🎨</span> My Crafts</button><button className="sidebar-link w-full"><span>🛒</span> Orders</button></nav>
                <div className="mt-auto pt-8"><div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-sm font-mono text-emerald-400">{account.slice(0, 8)}...</p></div></div>
            </aside>
            <main className="main-content">
                <h2 className="text-3xl font-bold text-white mb-2">Decorator Dashboard</h2><p className="text-gray-400 mb-8">Create eco-friendly crafts from recycled flowers</p>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="stats-card"><div className="value text-orange-400">23</div><p className="label">Available Batches</p></div>
                    <div className="stats-card"><div className="value text-emerald-400">12</div><p className="label">Crafts Created</p></div>
                    <div className="stats-card"><div className="value text-purple-400">₹8.5K</div><p className="label">Earnings</p></div>
                </div>

                <div className="card mb-6"><h3 className="text-xl font-bold mb-4">♻️ Available for Recycling</h3><p className="text-gray-400 mb-4">Flowers past their freshness threshold available at discounted rates</p>
                    <div className="grid grid-cols-3 gap-4">{[{ name: 'Dried Roses', qty: 200, price: 5, freshness: 25 }, { name: 'Marigold Petals', qty: 500, price: 2, freshness: 30 }, { name: 'Mixed Flowers', qty: 300, price: 3, freshness: 20 }].map((f, i) => (<div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-orange-500/30"><p className="font-bold">{f.name}</p><p className="text-gray-400">{f.qty} stems • ₹{f.price}/stem</p><p className="text-sm text-orange-400 mt-2">Freshness: {f.freshness}%</p><button className="mt-3 w-full btn-secondary py-2 text-sm">Claim Batch</button></div>))}</div>
                </div>

                <div className="card"><h3 className="text-xl font-bold mb-4">🎨 Craft Ideas</h3>
                    <div className="grid grid-cols-4 gap-4">{['Dried Flower Frame', 'Potpourri Jar', 'Pressed Art', 'Floral Candle'].map((c, i) => (<div key={i} className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 text-center border border-orange-500/20 hover:border-orange-500/50 cursor-pointer transition-all"><div className="text-4xl mb-2">🎨</div><p className="font-semibold">{c}</p></div>))}</div>
                </div>
            </main>
        </div>
    )
}
