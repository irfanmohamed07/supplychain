'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, callback: (...args: unknown[]) => void) => void
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void
    }
  }
}

interface RoleCard {
  id: string
  name: string
  icon: string
  description: string
  color: string
  gradient: string
  path: string
}

const roles: RoleCard[] = [
  {
    id: 'harvester',
    name: 'Harvester',
    icon: '🌾',
    description: 'Farmers managing daily harvest datasets and live market supply',
    color: 'emerald-500',
    gradient: 'from-emerald-500/20 to-emerald-600/20',
    path: '/register/harvester'
  },
  {
    id: 'transporter',
    name: 'Transporter',
    icon: '🚛',
    description: 'Logistics optimizers with MILP-based route & cold-chain management',
    color: 'blue-500',
    gradient: 'from-blue-500/20 to-blue-600/20',
    path: '/register/transporter'
  },
  {
    id: 'distributor',
    name: 'Distributor',
    icon: '🏭',
    description: 'B2B centers managing large-scale inventory and distribution flow',
    color: 'violet-500',
    gradient: 'from-violet-500/20 to-violet-600/20',
    path: '/register/distributor'
  },
  {
    id: 'wholesaler',
    name: 'Wholesaler',
    icon: '📦',
    description: 'Bulk market traders connecting harvesters to retailers',
    color: 'amber-500',
    gradient: 'from-amber-500/20 to-amber-600/20',
    path: '/register/wholesaler'
  },
  {
    id: 'retailer',
    name: 'Retailer',
    icon: '💐',
    description: 'Consumer-facing shops with real-time stock and demand intelligence',
    color: 'pink-500',
    gradient: 'from-pink-500/20 to-pink-600/20',
    path: '/register/retailer'
  },
  {
    id: 'consumer',
    name: 'Consumer',
    icon: '🛒',
    description: 'End buyers browsing nearby shops with verified freshness tracking',
    color: 'cyan-500',
    gradient: 'from-cyan-500/20 to-cyan-600/20',
    path: '/register/consumer'
  },
  {
    id: 'decorator',
    name: 'Decorator / Recycler',
    icon: '🎨',
    description: 'Sustainability artisans creating value from recycled flower batches',
    color: 'orange-500',
    gradient: 'from-orange-500/20 to-orange-600/20',
    path: '/register/decorator'
  },
  {
    id: 'authority',
    name: 'Admin / Authority',
    icon: '🛡️',
    description: 'System auditors managing compliance, fraud detection, and logistics audit',
    color: 'slate-500',
    gradient: 'from-slate-500/20 to-slate-600/20',
    path: '/register/authority'
  }
]

export default function Home() {
  const router = useRouter()
  const [account, setAccount] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleCard | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    checkConnection()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: unknown) => {
        const accs = accounts as string[]
        if (accs.length > 0) {
          setAccount(accs[0])
          getBalance(accs[0])
          checkUserRole(accs[0])
        } else {
          setAccount('')
          setBalance('')
          setUserRole('')
        }
      })
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
        if (accounts.length > 0) {
          setAccount(accounts[0])
          await getBalance(accounts[0])
          await checkUserRole(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const getBalance = async (address: string) => {
    try {
      const { web3 } = await getContract()
      const balance = await web3.eth.getBalance(address)
      const ethBalance = parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(4)
      setBalance(ethBalance)
    } catch (error) {
      console.error('Error getting balance:', error)
    }
  }

  const checkUserRole = async (address: string) => {
    try {
      const { contract } = await getContract()
      const role = await contract.methods.addressToRole(address).call()
      const roleNames = ['None', 'Harvester', 'Transporter', 'Distributor', 'Wholesaler', 'Retailer', 'Consumer', 'Decorator', 'Authority']
      setUserRole(roleNames[parseInt(role)])
    } catch (error) {
      console.error('Error checking role:', error)
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use FloraChain!')
      return
    }

    setIsConnecting(true)
    try {
      await loadWeb3()
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      if (accounts.length > 0) {
        setAccount(accounts[0])
        await getBalance(accounts[0])
        await checkUserRole(accounts[0])
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleRoleClick = (role: RoleCard) => {
    setSelectedRole(role)
    setShowModal(true)
  }

  const handleRegister = () => {
    if (selectedRole) {
      router.push(selectedRole.path)
    }
  }

  const handleLogin = () => {
    if (userRole && userRole !== 'None') {
      const rolePaths: { [key: string]: string } = {
        'Harvester': '/dashboard/harvester',
        'Transporter': '/dashboard/transporter',
        'Distributor': '/dashboard/distributor',
        'Wholesaler': '/dashboard/wholesaler',
        'Retailer': '/dashboard/retailer',
        'Consumer': '/marketplace',
        'Decorator': '/dashboard/decorator',
        'Authority': '/admin'
      }
      router.push(rolePaths[userRole] || '/marketplace')
    } else {
      alert('You are not registered. Please register first.')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-pink-500/30">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-pink-400 text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
          No AI / ML • Pure Deterministic Logic
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 animate-slide-up">
          FloraChain <br />
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent italic">
            Enterprise
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Blockchain-Powered, Rule-Based, Optimized, and Auditable Fresh-Cut Flower Supply Chain Operating System.
        </p>

        <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all flex items-center gap-2 group"
            >
              🚀 {isConnecting ? 'Connecting...' : 'Initialize Enterprise Portal'}
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-full backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl">
                🌸
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Linked Wallet</p>
                <p className="font-bold text-white leading-none">{account.slice(0, 6)}...{account.slice(-4)}</p>
                <p className="text-xs text-emerald-400 font-semibold mt-1">Balance: {balance} ETH</p>
              </div>
              <button
                onClick={handleLogin}
                className="ml-4 px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-all"
              >
                Access Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ERP Modules Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-bold tracking-tight">Supply Chain Operating Hub</h2>
          <div className="flex items-center gap-6 text-sm text-gray-500 font-mono">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div> Blockchain Ledger
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> MILP Optimized
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, idx) => (
            <button
              key={role.id}
              onClick={() => handleRoleClick(role)}
              style={{ animationDelay: `${(idx * 0.05) + 0.3}s` }}
              className="group relative text-left bg-white/[0.02] border border-white/5 p-8 rounded-[32px] hover:bg-white/[0.05] hover:border-white/20 transition-all animate-fade-in"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} border border-white/5 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                {role.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">{role.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {role.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 group-hover:text-white transition-colors">
                Initialize Module <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* System Capabilities Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-20">
          <div>
            <div className="text-3xl mb-6">📉</div>
            <h4 className="text-xl font-bold mb-4">Marketplace & ERP</h4>
            <p className="text-gray-500 leading-relaxed">
              Integrated Farmer ERP for daily harvest datasets, real-time demand & stock intelligence using deterministic rules.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-6">🚛</div>
            <h4 className="text-xl font-bold mb-4">Logistics Optimizer</h4>
            <p className="text-gray-500 leading-relaxed">
              MILP (Mixed Integer Linear Programming) used for every movement to minimize cost, time, and spoilage risk.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-6">🛡️</div>
            <h4 className="text-xl font-bold mb-4">Audit & Traceability</h4>
            <p className="text-gray-500 leading-relaxed">
              QR-Code Digital Passports fetch origin, cold-chain logs, freshness scores, and reputation impact from the blockchain.
            </p>
          </div>
        </div>
      </div>

      {/* Role Management Modal */}
      {showModal && selectedRole && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[40px] p-10 overflow-hidden">
            {/* Modal Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

            <div className="text-center">
              <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${selectedRole.gradient} rounded-3xl flex items-center justify-center text-5xl mb-8 border border-white/5`}>
                {selectedRole.icon}
              </div>
              <h3 className="text-3xl font-black mb-4">Module: {selectedRole.name}</h3>
              <p className="text-gray-400 mb-10 leading-relaxed">
                {selectedRole.description}
              </p>

              {!account ? (
                <button
                  onClick={connectWallet}
                  className="w-full py-5 bg-white text-black rounded-2xl font-bold hover:bg-gray-200 transition-all mb-4"
                >
                  Connect MetaMask Terminal
                </button>
              ) : (
                <div className="space-y-4">
                  {(userRole === 'None' || !userRole) ? (
                    <button
                      onClick={handleRegister}
                      className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      Initialize {selectedRole.name} Credentials <span>⚡</span>
                    </button>
                  ) : userRole === selectedRole.name ? (
                    <button
                      onClick={handleLogin}
                      className="w-full py-5 bg-white text-black rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Enter Operating Dashboard
                    </button>
                  ) : (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                      <p className="text-red-400 font-bold mb-4">Module Conflict Detected</p>
                      <p className="text-sm text-red-400/70 mb-6">
                        Your wallet is currently provisioned for the <strong>{userRole}</strong> module.
                        Multi-role accounts are restricted for system integrity.
                      </p>
                      <button
                        onClick={() => router.push(`/dashboard/${userRole.toLowerCase()}`)}
                        className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm"
                      >
                        Launch {userRole} Dashboard
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="mt-6 text-sm font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="relative py-12 px-6 border-t border-white/5 text-center">
        <p className="text-sm text-gray-60 w-full text-gray-600 font-mono">
          FloraChain Enterprise OS v2.4.0 • Deterministic Finality Enabled
        </p>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  )
}
