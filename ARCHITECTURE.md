# 🌸 FloraChain Enterprise - System Architecture

## Overview

FloraChain Enterprise is a blockchain-powered, rule-based, optimized, auditable fresh-cut flower supply chain operating system. It functions as an ERP, Marketplace, Logistics Optimizer, Quality Control System, and Audit & Compliance System.

## Core Principles

- **NO AI/ML** - All logic is deterministic, rule-based, and mathematical
- **Blockchain-First** - Smart contracts handle all critical business logic
- **MILP Optimization** - Mathematical optimization for all routing decisions
- **Transparency** - All transactions and data are on-chain or verifiably hashed
- **Auditability** - Complete audit trail for compliance

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Next.js │  │  React   │  │  Web3.js │  │ MetaMask│   │
│  │  Portal  │  │  UI/UX   │  │  Client  │  │  Wallet │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 BLOCKCHAIN LAYER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         FloraChain.sol Smart Contract                 │  │
│  │  - Role Management                                    │  │
│  │  - Batch Tracking                                    │  │
│  │  - Order Management                                  │  │
│  │  - Payment Escrow                                   │  │
│  │  - Reputation System                                │  │
│  │  - Penalty Engine                                   │  │
│  │  - Freshness Scoring                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              OPTIMIZATION LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         MILP Service (Python/Flask)                   │  │
│  │  - Route Optimization                                │  │
│  │  - Cost Minimization                                 │  │
│  │  - Time Optimization                                 │  │
│  │  - Freshness Constraints                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ On-Chain │  │ IPFS     │  │ Local    │                │
│  │ Storage  │  │ (Images) │  │ Cache    │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Smart Contract (FloraChain.sol)

**Responsibilities:**
- Role registration and management
- Batch creation and tracking
- Order lifecycle management
- Payment escrow and release
- Reputation scoring
- Penalty calculation
- Freshness score computation
- Temperature breach logging
- Audit trail

**Key Data Structures:**
- `Harvester`, `Transporter`, `Distributor`, `Wholesaler`, `Retailer`, `Consumer`, `Decorator`, `Authority`
- `FlowerBatch` - Core product data
- `Order` - Transaction data
- `TemperatureLog` - Cold chain monitoring
- `Penalty` - Rule-based penalties
- `OptimalRoute` - MILP optimization results

### 2. Frontend Components

**Role-Based Portal:**
- Landing page with 8 role cards
- MetaMask authentication (no passwords)
- Role-specific registration forms
- Role-specific dashboards

**Farmer ERP:**
- Daily harvest dataset entry
- Real-time market data display
- Inventory management
- Analytics dashboard

**Marketplace:**
- Consumer marketplace (B2C)
- Business marketplace (B2B)
- Search and filtering
- Shop pages with ratings
- Map integration

**Tracking System:**
- Real-time location tracking
- QR code scanning
- Digital passport display
- Weather alerts
- ETA calculation

**Analytics Dashboards:**
- Sales analytics
- Inventory analytics
- Wastage tracking
- Reputation trends
- Freshness trends
- Temperature breach reports

### 3. MILP Optimization Service

**Technology:** Python with PuLP library

**Optimization Variables:**
- Source and destination
- Available transporters
- Distance matrix
- Time constraints
- Cost constraints
- Freshness constraints
- Capacity constraints

**Output:**
- Optimal route
- Selected transporter
- Estimated time
- Estimated cost
- Risk level

### 4. Rule-Based Systems

**Demand & Stock Intelligence:**
- Daily/weekly/monthly sales tracking
- Wastage calculation
- Rule-based alerts:
  - If demand ↑ 3 days → Suggest stock ↑
  - If wastage > X% → Suggest stock ↓

**Penalty Engine:**
- Delivery time violations
- Freshness score violations
- Temperature breach violations
- Automatic penalty calculation
- Reputation impact

**Freshness Score Engine:**
```
FreshnessScore = f(time, temperature, distance, handling)
- Starts at 100
- Decreases over time
- Penalties for temperature breaches
- Distance-based degradation
```

### 5. Payment & Escrow System

**Smart Contract Escrow:**
- Money locked on order placement
- Release conditions:
  - Delivered within time limit
  - Freshness score > threshold
  - No critical temperature breaches
- Automatic refund/partial payment
- Automatic penalty deduction

### 6. Reputation System

**On-Chain Reputation:**
- Increases: On-time delivery, good freshness, positive reviews
- Decreases: Delays, spoilage, breaches, complaints
- Stored per role per address
- Affects pricing and trust

### 7. Chat System

**Human Chat:**
- Role-to-role messaging
- Multilingual support
- Voice-to-text / Text-to-voice

**Rule-Based Chatbot:**
- Form filling assistance
- Feature explanations
- Navigation help
- No AI - pure rule-based responses

## Data Flow

### Order Creation Flow:
```
1. Consumer/Retailer browses marketplace
2. Selects flower batch
3. System runs MILP optimization
4. Shows optimal route preview
5. User confirms → Order created on blockchain
6. Payment locked in escrow
7. QR code generated
8. Tracking begins
```

### Batch Movement Flow:
```
1. Harvester creates batch → On-chain
2. Order placed → MILP optimization
3. Transporter assigned → Route optimized
4. Temperature logs recorded → On-chain
5. Freshness score updated → Mathematical formula
6. Delivery → Escrow release conditions checked
7. Payment released/penalized → Automatic
8. Reputation updated → On-chain
```

## Security Model

- **Authentication:** MetaMask wallet signatures (no passwords)
- **Authorization:** Role-based access control (on-chain)
- **Data Integrity:** Blockchain immutability
- **Audit Trail:** All transactions on-chain
- **Penalty Enforcement:** Smart contract automation

## Scalability Considerations

- **On-Chain:** Critical business logic, payments, reputation
- **Off-Chain:** Images (IPFS), analytics cache, chat messages
- **Optimization:** Batch processing for analytics
- **Caching:** Local cache for frequently accessed data

## Technology Stack

**Blockchain:**
- Solidity ^0.8.19
- Hardhat
- Web3.js

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- MetaMask Integration

**Backend Services:**
- Python Flask (MILP service)
- PuLP (Optimization library)
- IPFS (Image storage)

**Infrastructure:**
- Docker
- Local blockchain (Hardhat/Ganache)
- Production: Ethereum/Polygon

## Research Metrics

**Key Performance Indicators:**
- Cost savings vs traditional routing
- Time savings
- Spoilage reduction
- Freshness score improvement
- Reputation system effectiveness
- Penalty system fairness
- User adoption rates

**Simulation Mode:**
- Generate 100s of orders
- Compare MILP vs simple routing
- Measure improvements
- Generate research reports

