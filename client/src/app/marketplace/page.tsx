'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'

interface Shop {
    id: number
    name: string
    address: string
    distance: string
    rating: number
    reviews: number
    image: string
    hasColdStorage: boolean
}

interface Flower {
    id: number
    name: string
    price: number
    rating: number
    shopName: string
    distance: string
    image: string
    freshnessScore: number
    quantity: number
    harvesterAddress?: string
    harvesterId?: number
}

const categories = ['All', 'Roses', 'Lilies', 'Marigolds', 'Orchids', 'Sunflowers', 'Bouquets', 'Garlands']

export default function Marketplace() {
    const router = useRouter()
    const [account, setAccount] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [sortBy, setSortBy] = useState('freshness')
    const [view, setView] = useState<'flowers' | 'shops'>('flowers')
    const [cart, setCart] = useState<{ flower: Flower, quantity: number }[]>([])
    const [showCart, setShowCart] = useState(false)
    const [flowers, setFlowers] = useState<Flower[]>([])
    const [shops, setShops] = useState<Shop[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setIsLoading(true)
        await checkConnection()
        await loadData()
        setIsLoading(false)
    }

    const checkConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                }
            } catch (error) {
                console.error('Connection check failed:', error)
            }
        }
    }

    const loadData = async () => {
        try {
            await loadWeb3()
            const { contract } = await getContract()

            // Load batches
            const batchCount = await contract.methods.batchCtr().call()
            const availableFlowers: Flower[] = []

            for (let i = 1; i <= parseInt(batchCount); i++) {
                try {
                    const batch = await contract.methods.batches(i).call()
                    if (batch.isAvailable) {
                        const freshnessScore = await contract.methods.calculateFreshnessScore(i).call()
                        const harvester = await contract.methods.harvesters(batch.harvesterId).call()

                        const priceInEth = parseFloat(batch.pricePerUnit) / 1e18

                        availableFlowers.push({
                            id: parseInt(batch.batchId),
                            name: batch.flowerName,
                            price: priceInEth,
                            rating: 4.8,
                            shopName: harvester.farmName || 'Elite Farm',
                            distance: (Math.random() * 5 + 1).toFixed(1) + ' km',
                            image: getFlowerEmoji(batch.flowerName),
                            freshnessScore: parseInt(freshnessScore),
                            quantity: parseInt(batch.quantity),
                            harvesterAddress: harvester.addr,
                            harvesterId: parseInt(batch.harvesterId)
                        })
                    }
                } catch (e) {
                    console.error('Error loading batch:', i, e)
                }
            }
            setFlowers(availableFlowers)

            // Load shops from harvester list
            const harvesterCount = await contract.methods.harvesterCtr().call()
            const availableShops: Shop[] = []
            for (let i = 1; i <= parseInt(harvesterCount); i++) {
                try {
                    const harvester = await contract.methods.harvesters(i).call()
                    if (harvester.isActive) {
                        availableShops.push({
                            id: parseInt(harvester.id),
                            name: harvester.farmName,
                            address: harvester.geoLocation,
                            distance: (Math.random() * 5 + 1).toFixed(1) + ' km',
                            rating: 4.5 + Math.random() * 0.5,
                            reviews: Math.floor(Math.random() * 200) + 50,
                            image: '🌿',
                            hasColdStorage: true
                        })
                    }
                } catch (e) { }
            }
            setShops(availableShops)
        } catch (error) {
            console.error('Data load failed:', error)
        }
    }

    const getFlowerEmoji = (name: string) => {
        const n = name.toLowerCase()
        if (n.includes('rose')) return '🌹'
        if (n.includes('lily')) return '🌷'
        if (n.includes('marigold')) return '🌻'
        if (n.includes('orchid')) return '💜'
        if (n.includes('sunflower')) return '🌻'
        if (n.includes('bouquet')) return '💐'
        return '🌸'
    }

    const addToCart = (flower: Flower) => {
        const existing = cart.find(item => item.flower.id === flower.id)
        if (existing) {
            setCart(cart.map(item =>
                item.flower.id === flower.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setCart([...cart, { flower, quantity: 1 }])
        }
        setShowCart(true)
    }

    const handleCheckout = async () => {
        if (!account) {
            alert('Please connect your wallet first.')
            return
        }

        setIsCheckingOut(true)
        try {
            await loadWeb3()
            const { contract, account, web3 } = await getContract()

            // Assuming setIsProcessing is defined elsewhere, if not, this line will cause an error.
            // For the purpose of this edit, it's added as per instruction.
            // setIsProcessing(true)

            // Process each item in cart as an order
            for (const item of cart) {
                const totalPriceWei = web3.utils.toWei((item.flower.price * item.quantity).toString(), 'ether')

                // createOrder(uint256 _batchId, address _seller, uint256 _quantity, uint256 _transporterId)
                await contract.methods.createOrder(
                    item.flower.id,
                    item.flower.harvesterAddress,
                    item.quantity,
                    0 // No transporter selected yet
                ).send({ from: account, value: totalPriceWei })
            }

            alert('✅ Orders created successfully! Flowers are reserved in escrow.')
            setCart([])
            setShowCart(false)
            router.push('/')
        } catch (error: any) {
            console.error('Checkout failed:', error)
            alert(error?.message || 'Transaction failed. Please check your wallet.')
        } finally {
            setIsCheckingOut(false)
        }
    }

    const cartTotal = cart.reduce((sum, item) => sum + (item.flower.price * item.quantity), 0)

    const filteredFlowers = flowers.filter(flower => {
        const matchesSearch = flower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            flower.shopName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCat = selectedCategory === 'all' || flower.name.toLowerCase().includes(selectedCategory.toLowerCase())
        return matchesSearch && matchesCat
    }).sort((a, b) => {
        if (sortBy === 'freshness') return b.freshnessScore - a.freshnessScore
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        return 0
    })

    return (
        <main className="min-h-screen bg-black text-white selection:bg-pink-500/30">
            {/* Nav */}
            <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-md px-12 py-6 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                        🌸
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">FloraChain</h1>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest leading-none">Marketplace Terminal</p>
                    </div>
                </Link>

                <div className="flex items-center gap-8">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        <button
                            onClick={() => setView('flowers')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'flowers' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            FLOWERS
                        </button>
                        <button
                            onClick={() => setView('shops')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'shops' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            SHOPS
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCart(true)}
                        className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all border-b-2"
                    >
                        <span className="text-xl">🛒</span>
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full text-[10px] flex items-center justify-center font-black animate-bounce shadow-lg">
                                {cart.length}
                            </span>
                        )}
                    </button>

                    {account ? (
                        <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 px-6 py-2.5 rounded-2xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="font-mono text-sm text-emerald-400 font-bold">{account.slice(0, 6)}...{account.slice(-4)}</span>
                        </div>
                    ) : (
                        <button onClick={init} className="bg-white text-black px-8 py-3 rounded-2xl font-black hover:bg-gray-200 transition-all shadow-xl">
                            LINK WALLET
                        </button>
                    )}
                </div>
            </nav>

            {/* Filter Bar */}
            <section className="px-12 py-10">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center text-gray-500 group-focus-within:text-pink-500 transition-colors">
                                🔍
                            </div>
                            <input
                                type="text"
                                placeholder="Search by species, origin, or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[32px] pl-16 pr-8 py-6 text-lg outline-none focus:border-pink-500/50 focus:bg-white/[0.07] transition-all"
                            />
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-black border border-white/10 rounded-[32px] px-10 py-6 font-bold uppercase tracking-widest text-xs outline-none focus:border-pink-500/50 appearance-none cursor-pointer text-white"
                        >
                            <option value="freshness">Freshest First</option>
                            <option value="price-low">Lowest Capital</option>
                            <option value="price-high">Premium Price</option>
                        </select>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat.toLowerCase())}
                                className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${selectedCategory === cat.toLowerCase()
                                    ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30 hover:text-white'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="px-12 pb-32">
                <div className="max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <div className="w-16 h-16 border-4 border-white/10 border-t-pink-500 rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest animate-pulse">Syncing Marketplace Liquidity...</p>
                        </div>
                    ) : view === 'flowers' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredFlowers.map(flower => (
                                <div key={flower.id} className="group relative">
                                    <div className="aspect-square bg-white/5 border border-white/10 rounded-[40px] p-8 flex items-center justify-center text-8xl mb-6 relative overflow-hidden transition-all group-hover:border-pink-500/30 group-hover:bg-white/[0.07]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <span className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">{flower.image}</span>

                                        <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${flower.freshnessScore > 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                            {flower.freshnessScore}% Fresh
                                        </div>
                                    </div>

                                    <div className="space-y-2 px-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-black">{flower.name}</h3>
                                            <span className="text-sm font-bold text-gray-500">⭐ 4.8</span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">Origin: {flower.shopName} · {flower.distance}</p>

                                        <div className="pt-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Chain Price</p>
                                                <p className="text-2xl font-black">Ξ {flower.price.toFixed(4)}</p>
                                            </div>
                                            <button
                                                onClick={() => addToCart(flower)}
                                                className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center text-xl hover:bg-pink-500 hover:text-white transition-all shadow-xl group-hover:scale-105 active:scale-95"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredFlowers.length === 0 && (
                                <div className="col-span-full py-40 text-center space-y-6">
                                    <div className="text-6xl grayscale opacity-30">🥀</div>
                                    <p className="text-gray-500 text-xl font-bold">No assets found in current ledger sector.</p>
                                    <button onClick={() => setSelectedCategory('all')} className="text-pink-500 font-bold uppercase tracking-widest text-xs hover:underline">Reset Filters</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {shops.map(shop => (
                                <div key={shop.id} className="bg-white/5 border border-white/10 rounded-[48px] p-10 group hover:border-pink-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-20 h-20 rounded-[24px] bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                                            {shop.image}
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 text-yellow-400 font-bold justify-end">
                                                <span>⭐</span>
                                                <span>{shop.rating.toFixed(1)}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">
                                                {shop.reviews} ENDORSEMENTS
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black mb-2">{shop.name}</h3>
                                    <p className="text-gray-500 text-sm mb-8">
                                        📍 {shop.address} <br />
                                        <span className="font-mono text-[10px] text-gray-600 mt-2 block">{shop.distance} from transit hub</span>
                                    </p>

                                    <div className="flex gap-3 mb-8">
                                        <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                            ❄️ Cold Vault Verified
                                        </span>
                                        <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            Active Direct
                                        </span>
                                    </div>

                                    <button className="w-full py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-sm uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all">
                                        Enter Terminal
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Cart Sidebar */}
            {showCart && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
                    <div className="relative w-full max-w-xl h-screen bg-[#050505] border-l border-white/10 flex flex-col">
                        <div className="p-12 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black tracking-tighter">Your Payload</h3>
                                <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-1">SECURE BLOCKCHAIN ESCROW</p>
                            </div>
                            <button onClick={() => setShowCart(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl hover:bg-white/10 transition-colors">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="text-7xl grayscale opacity-20">🛒</div>
                                    <p className="text-gray-600 font-bold text-lg uppercase tracking-widest">No assets in cart</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.flower.id} className="flex gap-8 group">
                                        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl group-hover:bg-white/[0.08] transition-colors">
                                            {item.flower.image}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between">
                                                <h4 className="text-lg font-black">{item.flower.name}</h4>
                                                <p className="font-mono font-bold text-pink-500">Ξ {(item.flower.price * item.quantity).toFixed(4)}</p>
                                            </div>
                                            <p className="text-gray-500 text-sm">{item.flower.shopName}</p>
                                            <div className="flex items-center gap-4 mt-4">
                                                <div className="flex items-center bg-white/5 rounded-xl border border-white/10">
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity > 1) {
                                                                setCart(cart.map(c => c.flower.id === item.flower.id ? { ...c, quantity: c.quantity - 1 } : c))
                                                            } else {
                                                                setCart(cart.filter(c => c.flower.id !== item.flower.id))
                                                            }
                                                        }}
                                                        className="px-4 py-1.5 hover:text-pink-500"
                                                    >-</button>
                                                    <span className="font-mono text-sm font-bold min-w-[30px] text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => setCart(cart.map(c => c.flower.id === item.flower.id ? { ...c, quantity: c.quantity + 1 } : c))}
                                                        className="px-4 py-1.5 hover:text-pink-500"
                                                    >+</button>
                                                </div>
                                                <button
                                                    onClick={() => setCart(cart.filter(c => c.flower.id !== item.flower.id))}
                                                    className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-red-500"
                                                >
                                                    Discard
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-12 border-t border-white/5 space-y-8">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">AGGREGATE CAPITAL</p>
                                        <p className="text-sm text-gray-400">Escrow deposit required</p>
                                    </div>
                                    <p className="text-4xl font-black tracking-tighter">Ξ {cartTotal.toFixed(4)}</p>
                                </div>

                                <div className="bg-pink-500/5 border border-pink-500/10 rounded-[32px] p-8 flex gap-6 items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-2xl">🔐</div>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Funds will be held in a <span className="text-pink-500">Secure Escrow Vault</span>. Liquidity only releases to the seller upon cryptographically signed delivery confirmation.</p>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full py-7 bg-white text-black rounded-[28px] font-black text-xl hover:bg-gray-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                                            <span>TRANSACTING...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>EXECUTE ORDER SEQUENCE</span>
                                            <span>⚡</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </main>
    )
}
