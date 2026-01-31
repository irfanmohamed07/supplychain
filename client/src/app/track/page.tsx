'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode.react'
import { loadWeb3, getContract } from '@/lib/web3'

interface OwnershipRecord {
  role: string
  name: string
  location: string
  timestamp: string
  action: string
}

interface TemperatureLog {
  timestamp: string
  temperature: number
  isBreach: boolean
  location: string
}

interface BatchDetails {
  batchId: number
  flowerName: string
  description: string
  quantity: number
  cutTime: string
  freshnessLife: number
  freshnessScore: number
  pricePerUnit: number
  stage: string
  harvesterName: string
  harvesterLocation: string
  ownershipHistory: OwnershipRecord[]
  temperatureLogs: TemperatureLog[]
  paymentStatus: string
  hasBreaches: boolean
}

export default function TrackPage() {
  const [account, setAccount] = useState<string>('')
  const [batchId, setBatchId] = useState<string>('')
  const [batch, setBatch] = useState<BatchDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'journey' | 'technical' | 'details'>('journey')

  useEffect(() => {
    checkConnection()
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

  const trackBatch = async () => {
    if (!batchId) return
    setIsLoading(true)
    try {
      await loadWeb3()
      const { contract } = await getContract()

      const batchIdNum = parseInt(batchId)
      const batchData = await contract.methods.batches(batchIdNum).call()
      const stage = await contract.methods.getBatchStage(batchIdNum).call()
      const freshnessScore = await contract.methods.calculateFreshnessScore(batchIdNum).call()
      const harvester = await contract.methods.harvesters(batchData.harvesterId).call()
      const tempLogs = await contract.methods.getTemperatureLogs(batchIdNum).call()

      const pricePerUnit = parseFloat(batchData.pricePerUnit) / 1e18

      const ownershipHistory: OwnershipRecord[] = [
        {
          role: 'Harvester',
          name: harvester.farmName || 'Original Source',
          location: harvester.geoLocation || 'Pune Facility',
          timestamp: new Date(parseInt(batchData.createdAt) * 1000).toLocaleString(),
          action: 'Genesis Harvest'
        }
      ]

      if (parseInt(batchData.stage) > 0) {
        ownershipHistory.push({
          role: 'Supply Node',
          name: 'FloraChain Logistics',
          location: 'Network Transit',
          timestamp: 'Real-time',
          action: 'Stage: ' + stage
        })
      }

      setBatch({
        batchId: batchIdNum,
        flowerName: batchData.flowerName,
        description: batchData.description,
        quantity: parseInt(batchData.quantity),
        cutTime: new Date(parseInt(batchData.cutTime) * 1000).toISOString(),
        freshnessLife: parseInt(batchData.freshnessLife),
        freshnessScore: parseInt(freshnessScore),
        pricePerUnit: pricePerUnit,
        stage: stage,
        harvesterName: harvester.farmName,
        harvesterLocation: harvester.geoLocation,
        ownershipHistory: ownershipHistory,
        temperatureLogs: tempLogs.map((log: any) => ({
          timestamp: new Date(parseInt(log.timestamp) * 1000).toLocaleString(),
          temperature: parseFloat(log.temperature) / 100,
          isBreach: log.isBreach,
          location: log.location
        })),
        paymentStatus: 'Escrow Active',
        hasBreaches: tempLogs.some((log: any) => log.isBreach)
      })
    } catch (error: any) {
      console.error('Tracking Error:', error)
      alert('Batch ID verification failed on-chain.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020202] text-white selection:bg-cyan-500/30 font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full"></div>
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl px-12 py-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-xl group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            🔍
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Traceability.OS</h1>
            <p className="text-[9px] text-cyan-500 font-mono tracking-[0.2em] leading-none uppercase">Blockchain Audit Terminal</p>
          </div>
        </Link>

        {account ? (
          <div className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="font-mono text-xs text-gray-400">{account.slice(0, 6)}...{account.slice(-4)}</span>
          </div>
        ) : (
          <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Connect Terminal</button>
        )}
      </nav>

      <div className="max-w-6xl mx-auto py-24 px-8 relative">
        {/* Hero Search */}
        {!batch && (
          <div className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
              <h2 className="text-7xl font-black tracking-tighter leading-none">VERIFY EVERY <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">PETAL'S JOURNEY.</span></h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">Instant cryptographic proof of origin, temperature compliance, and handling history.</p>
            </div>

            <div className="max-w-2xl mx-auto group">
              <div className="bg-white/5 border border-white/10 p-2 rounded-[32px] flex gap-2 focus-within:border-cyan-500/50 focus-within:bg-white/[0.08] transition-all duration-500 shadow-2xl">
                <input
                  type="text"
                  placeholder="Input Smart Batch ID (e.g. 104)"
                  value={batchId}
                  onChange={e => setBatchId(e.target.value)}
                  className="flex-1 bg-transparent px-8 py-6 text-xl font-bold outline-none placeholder:text-gray-700"
                />
                <button
                  onClick={trackBatch}
                  disabled={isLoading || !batchId}
                  className="bg-cyan-500 text-black px-12 py-6 rounded-[24px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  {isLoading ? 'Decrypting...' : 'Trace Asset'}
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-12 pt-12">
              <div className="text-left space-y-1">
                <p className="text-2xl font-black">2048-Bit</p>
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Encryption</p>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div className="text-left space-y-1">
                <p className="text-2xl font-black">Real-Time</p>
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">IoT Pings</p>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div className="text-left space-y-1">
                <p className="text-2xl font-black">Escrow</p>
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Guaranteed</p>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {batch && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Card */}
            <div className="bg-white/5 border border-white/10 rounded-[48px] p-12 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-cyan-500/20 transition-all"></div>

              <div className="flex flex-col lg:flex-row gap-16 relative z-10">
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-[32px] inline-block shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                    <QRCode value={batchId} size={160} level="H" bgColor="#FFFFFF" fgColor="#000000" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Authentication QR</p>
                    <p className="text-xs text-gray-500 font-mono">ID: {batch.batchId.toString().padStart(8, '0')}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-12">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-6xl font-black tracking-tighter mb-2">{batch.flowerName}</h3>
                      <div className="flex gap-4">
                        <span className="px-5 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">{batch.stage}</span>
                        <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${batch.hasBreaches ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {batch.hasBreaches ? 'Violations Detected' : 'Compliance Verified'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest">Freshness Rating</p>
                      <p className="text-6xl font-black text-white">{batch.freshnessScore}<span className="text-2xl text-cyan-500 font-bold">%</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-10">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Volume</p>
                      <p className="text-2xl font-black">{batch.quantity} Units</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Origin</p>
                      <p className="text-2xl font-black">{batch.harvesterName || 'Global'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Harvested</p>
                      <p className="text-2xl font-black">{new Date(batch.cutTime).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Financials</p>
                      <p className="text-2xl font-black text-cyan-500">Ξ {batch.pricePerUnit.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center border-b border-white/5 gap-12">
              {[
                { id: 'journey', label: 'Asset Journey', icon: '🚛' },
                { id: 'technical', label: 'Technical Telemetry', icon: '🌡️' },
                { id: 'details', label: 'Provenance Record', icon: '📋' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-6 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-cyan-500' : 'text-gray-600 hover:text-white'}`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500 rounded-t-full shadow-[0_-5px_15px_rgba(6,182,212,0.5)]"></div>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'journey' && (
                <div className="space-y-8 max-w-4xl mx-auto">
                  {batch.ownershipHistory.map((record, i) => (
                    <div key={i} className="flex gap-12 group">
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] z-10"></div>
                        {i < batch.ownershipHistory.length - 1 && <div className="w-0.5 flex-1 bg-white/5 my-2"></div>}
                      </div>
                      <div className="flex-1 pb-12">
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 group-hover:bg-white/[0.08] group-hover:border-cyan-500/30 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-2xl font-black mb-1">{record.action}</h4>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full">{record.role}</span>
                                <span className="text-sm font-bold text-gray-600">@{record.name}</span>
                              </div>
                            </div>
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{record.timestamp}</p>
                          </div>
                          <p className="text-gray-400 text-sm font-medium">Verified at location: <span className="text-white">{record.location}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {batch.temperatureLogs.length === 0 ? (
                      <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                        <p className="text-gray-600 font-bold uppercase tracking-widest">Waiting for IoT Telemetry Ping...</p>
                      </div>
                    ) : (
                      batch.temperatureLogs.map((log, i) => (
                        <div key={i} className={`bg-white/5 border rounded-[32px] p-8 ${log.isBreach ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 hover:border-cyan-500/30'}`}>
                          <div className="flex justify-between items-start mb-6">
                            <div className="text-2xl text-gray-400">🌡️</div>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${log.isBreach ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                              {log.isBreach ? 'BREACH' : 'OPTIMAL'}
                            </span>
                          </div>
                          <p className="text-4xl font-black mb-2">{log.temperature.toFixed(1)}°C</p>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Reading @ {log.timestamp}</p>
                          <p className="text-xs text-gray-400 font-medium truncate">📍 {log.location}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                  <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-8">
                    <h4 className="text-2xl font-black mb-6 border-b border-white/5 pb-4">Provenance Metadata</h4>
                    <div className="space-y-4">
                      {[
                        { l: 'Asset Description', v: batch.description },
                        { l: 'Genetic Longevity', v: `${batch.freshnessLife} Hours` },
                        { l: 'Supply Capacity', v: `${batch.quantity} Units` },
                        { l: 'Unit Valuation', v: `Ξ ${batch.pricePerUnit.toFixed(4)}` },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-start group">
                          <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">{item.l}</span>
                          <span className="text-sm font-bold text-gray-300 max-w-[200px] text-right group-hover:text-cyan-500 transition-colors">{item.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-8">
                    <h4 className="text-2xl font-black mb-6 border-b border-white/5 pb-4">Compliance Audit</h4>
                    <div className="space-y-4">
                      {[
                        { l: 'Escrow Status', v: batch.paymentStatus, c: 'text-cyan-500' },
                        { l: 'Compliance Grade', v: batch.hasBreaches ? 'Partial' : 'Full', c: batch.hasBreaches ? 'text-red-400' : 'text-emerald-400' },
                        { l: 'Data Redundancy', v: 'Blockchain Verified', c: 'text-gray-400' },
                        { l: 'Last Audit Update', v: new Date().toLocaleTimeString(), c: 'text-gray-400' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center group">
                          <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{item.l}</span>
                          <span className={`text-sm font-bold ${item.c} group-hover:underline`}>{item.v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-6">
                      <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">
                        Download Provenance PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; }
      `}</style>
    </main>
  )
}
