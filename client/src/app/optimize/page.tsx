'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
        }
    }
}

interface Entity {
    id: number
    name: string
    location?: string
    place?: string
}

interface OptimizationResult {
    success: boolean
    status: string
    route: {
        source: { type: string; id: number }
        destination: { type: string; id: number }
        distance_km: number
    }
    selected_transporter: {
        id: number
        name: string
        vehicle: string
        cold_chain: boolean
        capacity: number
    }
    cost_breakdown: {
        transport_cost: number
        cost_per_km: number
        currency: string
    }
    time_breakdown: {
        transit_time_hours: number
        estimated_speed_kmph: number
    }
    quality_metrics: {
        transporter_quality: number
        expected_freshness_on_arrival: number
        risk_level: number
    }
    comparison: {
        all_options: Array<{
            transporter_id: number
            name: string
            cost: number
            time_hours: number
            freshness: number
            risk: number
            selected: boolean
        }>
    }
}

export default function OptimizePage() {
    const [account, setAccount] = useState<string>('')
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [result, setResult] = useState<OptimizationResult | null>(null)
    const [entities, setEntities] = useState<{
        harvesters: Entity[]
        transporters: Entity[]
        distributors: Entity[]
        wholesalers: Entity[]
        retailers: Entity[]
    } | null>(null)

    const [formData, setFormData] = useState({
        sourceType: 'harvester',
        sourceId: '1',
        destinationType: 'retailer',
        destinationId: '1',
        quantity: '500',
        freshnessLifeHours: '72',
        priority: 'balanced',
        requireColdChain: false
    })

    useEffect(() => {
        checkConnection()
        fetchEntities()
    }, [])

    const checkConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                }
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    const fetchEntities = async () => {
        try {
            const response = await fetch('http://localhost:5000/entities')
            const data = await response.json()
            setEntities(data)
        } catch (error) {
            console.error('Error fetching entities:', error)
            // Use fallback data
            setEntities({
                harvesters: [
                    { id: 1, name: 'Green Valley Farms', location: 'Pune' },
                    { id: 2, name: 'Sunrise Flowers', location: 'Nashik' },
                    { id: 3, name: 'Blossom Gardens', location: 'Bangalore' }
                ],
                transporters: [
                    { id: 1, name: 'ColdChain Express' },
                    { id: 2, name: 'FastFlora Logistics' },
                    { id: 3, name: 'Premium Florals Transport' }
                ],
                distributors: [
                    { id: 1, name: 'Metro Flower Hub', location: 'Mumbai' },
                    { id: 2, name: 'Central Florals Dist', location: 'Delhi' }
                ],
                wholesalers: [
                    { id: 1, name: 'Dadar Flower Market', location: 'Mumbai' },
                    { id: 2, name: 'Ghazipur Mandi', location: 'Delhi' }
                ],
                retailers: [
                    { id: 1, name: 'Rose Garden Florist', location: 'Mumbai' },
                    { id: 2, name: 'Bloom & Petals', location: 'Delhi' },
                    { id: 3, name: 'Fresh Flowers Hub', location: 'Bangalore' }
                ]
            })
        }
    }

    const runOptimization = async () => {
        setIsOptimizing(true)
        setResult(null)

        try {
            const response = await fetch('http://localhost:5000/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_type: formData.sourceType,
                    source_id: parseInt(formData.sourceId),
                    destination_type: formData.destinationType,
                    destination_id: parseInt(formData.destinationId),
                    quantity: parseInt(formData.quantity),
                    freshness_life_hours: parseInt(formData.freshnessLifeHours),
                    priority: formData.priority,
                    require_cold_chain: formData.requireColdChain
                })
            })

            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error('Optimization error:', error)
            alert('Failed to connect to MILP service. Make sure it is running on port 5000.')
        } finally {
            setIsOptimizing(false)
        }
    }

    const getEntityList = (type: string) => {
        if (!entities) return []
        switch (type) {
            case 'harvester': return entities.harvesters
            case 'distributor': return entities.distributors
            case 'wholesaler': return entities.wholesalers
            case 'retailer': return entities.retailers
            default: return []
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="py-6 px-8 flex justify-between items-center border-b border-gray-700/50">
                <Link href="/" className="flex items-center gap-3">
                    <span className="text-3xl">🌸</span>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                            FloraChain
                        </h1>
                        <p className="text-xs text-gray-400">MILP Route Optimizer</p>
                    </div>
                </Link>

                {account && (
                    <div className="bg-gray-800/80 rounded-xl px-4 py-2 border border-gray-700">
                        <p className="text-xs text-gray-400">Connected</p>
                        <p className="text-sm font-mono text-emerald-400">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </p>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto py-8 px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">🧮 MILP Route Optimization</h2>
                    <p className="text-gray-400">
                        Get the optimal transport route before creating any order
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>📦</span> Route Parameters
                        </h3>

                        <div className="space-y-4">
                            {/* Source */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Source Type</label>
                                    <select
                                        value={formData.sourceType}
                                        onChange={(e) => setFormData({ ...formData, sourceType: e.target.value, sourceId: '1' })}
                                        className="input"
                                    >
                                        <option value="harvester">🌾 Harvester</option>
                                        <option value="distributor">🏭 Distributor</option>
                                        <option value="wholesaler">📦 Wholesaler</option>
                                        <option value="retailer">💐 Retailer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Source Entity</label>
                                    <select
                                        value={formData.sourceId}
                                        onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                                        className="input"
                                    >
                                        {getEntityList(formData.sourceType).map((e) => (
                                            <option key={e.id} value={e.id}>
                                                {e.name} {e.location ? `(${e.location})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Destination Type</label>
                                    <select
                                        value={formData.destinationType}
                                        onChange={(e) => setFormData({ ...formData, destinationType: e.target.value, destinationId: '1' })}
                                        className="input"
                                    >
                                        <option value="distributor">🏭 Distributor</option>
                                        <option value="wholesaler">📦 Wholesaler</option>
                                        <option value="retailer">💐 Retailer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Destination Entity</label>
                                    <select
                                        value={formData.destinationId}
                                        onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                                        className="input"
                                    >
                                        {getEntityList(formData.destinationType).map((e) => (
                                            <option key={e.id} value={e.id}>
                                                {e.name} {e.location ? `(${e.location})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Quantity & Freshness */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Quantity (stems)</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="input"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="label">Freshness Life (hours)</label>
                                    <input
                                        type="number"
                                        value={formData.freshnessLifeHours}
                                        onChange={(e) => setFormData({ ...formData, freshnessLifeHours: e.target.value })}
                                        className="input"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="label">Optimization Priority</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['balanced', 'cost', 'time', 'quality'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: p })}
                                            className={`py-2 px-3 rounded-lg border transition-all capitalize ${formData.priority === p
                                                    ? 'bg-purple-600 border-purple-500 text-white'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                                }`}
                                        >
                                            {p === 'balanced' && '⚖️ '}
                                            {p === 'cost' && '💰 '}
                                            {p === 'time' && '⏱️ '}
                                            {p === 'quality' && '⭐ '}
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cold Chain */}
                            <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="coldChain"
                                    checked={formData.requireColdChain}
                                    onChange={(e) => setFormData({ ...formData, requireColdChain: e.target.checked })}
                                    className="w-5 h-5 rounded"
                                />
                                <label htmlFor="coldChain" className="cursor-pointer">
                                    <span className="font-semibold">❄️ Require Cold Chain</span>
                                    <p className="text-sm text-gray-400">Only select transporters with refrigeration</p>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={runOptimization}
                                disabled={isOptimizing}
                                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                            >
                                {isOptimizing ? (
                                    <>
                                        <div className="spinner !w-5 !h-5"></div>
                                        <span>Optimizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🧮</span>
                                        <span>Run MILP Optimization</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>📊</span> Optimization Results
                        </h3>

                        {!result ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">🚛</div>
                                <p className="text-gray-400">Configure parameters and run optimization to see results</p>
                            </div>
                        ) : result.success ? (
                            <div className="space-y-6">
                                {/* Status Banner */}
                                <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3">
                                    <span className="text-2xl">✅</span>
                                    <div>
                                        <p className="font-bold text-emerald-400">Optimal Route Found!</p>
                                        <p className="text-sm text-gray-400">Status: {result.status}</p>
                                    </div>
                                </div>

                                {/* Selected Transporter */}
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                                    <p className="text-sm text-gray-400 mb-1">Best Transporter</p>
                                    <p className="text-xl font-bold">{result.selected_transporter.name}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="badge badge-info">{result.selected_transporter.vehicle}</span>
                                        {result.selected_transporter.cold_chain && (
                                            <span className="badge badge-success">❄️ Cold Chain</span>
                                        )}
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-800/50 rounded-xl p-4">
                                        <p className="text-sm text-gray-400">Distance</p>
                                        <p className="text-2xl font-bold">{result.route.distance_km} km</p>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4">
                                        <p className="text-sm text-gray-400">Transit Time</p>
                                        <p className="text-2xl font-bold">{result.time_breakdown.transit_time_hours.toFixed(1)} hrs</p>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4">
                                        <p className="text-sm text-gray-400">Cost</p>
                                        <p className="text-2xl font-bold">₹{result.cost_breakdown.transport_cost.toFixed(0)}</p>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4">
                                        <p className="text-sm text-gray-400">Arrival Freshness</p>
                                        <p className="text-2xl font-bold text-emerald-400">
                                            {result.quality_metrics.expected_freshness_on_arrival}%
                                        </p>
                                    </div>
                                </div>

                                {/* Risk Level */}
                                <div className="bg-gray-800/50 rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm text-gray-400">Risk Level</p>
                                        <span className={`badge ${result.quality_metrics.risk_level < 30 ? 'badge-success' :
                                                result.quality_metrics.risk_level < 60 ? 'badge-warning' : 'badge-danger'
                                            }`}>
                                            {result.quality_metrics.risk_level < 30 ? 'Low' :
                                                result.quality_metrics.risk_level < 60 ? 'Medium' : 'High'}
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${result.quality_metrics.risk_level < 30 ? 'bg-emerald-500' :
                                                    result.quality_metrics.risk_level < 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${result.quality_metrics.risk_level}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Comparison Table */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-2">All Options Compared</p>
                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Transporter</th>
                                                    <th>Cost</th>
                                                    <th>Time</th>
                                                    <th>Freshness</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.comparison.all_options.map((opt) => (
                                                    <tr key={opt.transporter_id} className={opt.selected ? 'bg-purple-500/10' : ''}>
                                                        <td className="flex items-center gap-2">
                                                            {opt.selected && <span>✓</span>}
                                                            {opt.name}
                                                        </td>
                                                        <td>₹{opt.cost.toFixed(0)}</td>
                                                        <td>{opt.time_hours.toFixed(1)}h</td>
                                                        <td>{opt.freshness.toFixed(0)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <button className="flex-1 btn-primary">
                                        ✅ Approve & Create Order
                                    </button>
                                    <button className="flex-1 btn-secondary">
                                        🔄 Re-optimize
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">❌</div>
                                <p className="text-red-400 font-bold">Optimization Failed</p>
                                <p className="text-gray-400">{result.status}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
