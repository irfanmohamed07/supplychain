'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
    const [account, setAccount] = useState<string>('')
    const [stats] = useState({ totalUsers: 156, activeOrders: 42, pendingDisputes: 3, totalVolume: '₹45.2L' })

    useEffect(() => { if (typeof window.ethereum !== 'undefined') { window.ethereum.request({ method: 'eth_accounts' }).then((accounts: unknown) => { if ((accounts as string[]).length > 0) setAccount((accounts as string[])[0]) }) } }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <aside className="sidebar">
                <Link href="/" className="flex items-center gap-3 mb-8"><span className="text-3xl">🌸</span><div><h1 className="text-xl font-bold text-white">FloraChain</h1><p className="text-xs text-gray-400">Admin Portal</p></div></Link>
                <nav className="space-y-1">
                    <button className="sidebar-link w-full active"><span>📊</span> Dashboard</button>
                    <button className="sidebar-link w-full"><span>👥</span> Users</button>
                    <button className="sidebar-link w-full"><span>📝</span> Audit Logs</button>
                    <button className="sidebar-link w-full"><span>⚠️</span> Disputes</button>
                    <button className="sidebar-link w-full"><span>🔒</span> Freeze Accounts</button>
                    <button className="sidebar-link w-full"><span>📈</span> Analytics</button>
                </nav>
                <div className="mt-auto pt-8"><div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-xs text-gray-400">Admin Wallet</p><p className="text-sm font-mono text-emerald-400">{account.slice(0, 8)}...{account.slice(-6)}</p></div></div>
            </aside>
            <main className="main-content">
                <div className="mb-8"><h2 className="text-3xl font-bold text-white">Admin Dashboard</h2><p className="text-gray-400">System overview and management</p></div>

                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="stats-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">👥</div><div><p className="value">{stats.totalUsers}</p><p className="label">Total Users</p></div></div></div>
                    <div className="stats-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">📦</div><div><p className="value">{stats.activeOrders}</p><p className="label">Active Orders</p></div></div></div>
                    <div className="stats-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-2xl">⚠️</div><div><p className="value">{stats.pendingDisputes}</p><p className="label">Disputes</p></div></div></div>
                    <div className="stats-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">💰</div><div><p className="value">{stats.totalVolume}</p><p className="label">Total Volume</p></div></div></div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="card"><h3 className="text-xl font-bold mb-4">📝 Recent Audit Logs</h3>
                        <div className="space-y-3">{[
                            { action: 'User Registered', user: '0x1234...5678', time: '5 min ago', type: 'Harvester' },
                            { action: 'Batch Created', user: '0xabcd...efgh', time: '12 min ago', type: '#1234' },
                            { action: 'Order Completed', user: '0x9876...5432', time: '25 min ago', type: '₹2,500' },
                            { action: 'Temperature Breach', user: 'Batch #1230', time: '1 hr ago', type: '9.2°C' }
                        ].map((log, i) => (<div key={i} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl"><div><p className="font-semibold">{log.action}</p><p className="text-sm text-gray-400">{log.user}</p></div><div className="text-right"><p className="text-sm text-gray-400">{log.time}</p><span className="badge badge-info">{log.type}</span></div></div>))}</div>
                    </div>
                    <div className="card"><h3 className="text-xl font-bold mb-4">⚠️ Pending Disputes</h3>
                        <div className="space-y-3">{[
                            { title: 'Quality Dispute', batch: '#1228', amount: '₹1,200', status: 'Pending' },
                            { title: 'Delivery Delay', batch: '#1225', amount: '₹800', status: 'Under Review' },
                            { title: 'Cold Chain Breach', batch: '#1230', amount: '₹500', status: 'Evidence Required' }
                        ].map((d, i) => (<div key={i} className="p-4 bg-gray-800/50 rounded-xl border border-red-500/30"><div className="flex justify-between mb-2"><span className="font-bold">{d.title}</span><span className="badge badge-warning">{d.status}</span></div><p className="text-sm text-gray-400">Batch: {d.batch} • Disputed Amount: {d.amount}</p><button className="mt-3 btn-secondary py-2 w-full text-sm">Review Case</button></div>))}</div>
                    </div>
                </div>
            </main>
        </div>
    )
}
