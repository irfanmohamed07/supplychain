# 🌸 FloraChain Enterprise - User Guide

## Welcome to the Future of Floral Logistics!
FloraChain is a blockchain-powered, rule-based, optimized, and auditable fresh-cut flower supply chain operating system. It ensures transparency, quality, and fair payments through cryptographic proof and deterministic logic.

---

## 🚀 Quick Start: System Status

Your development environment is fully operational with three integrated services:

1.  **Blockchain Ledger** (Hardhat Node): `http://127.0.0.1:8545` ✅
2.  **Enterprise Portal** (Next.js): `http://localhost:3000` ✅
3.  **MILP Optimizer** (Python Service): `http://localhost:5000` ✅

**Current Deployment**: `FloraChain.sol` is actively managing state on the local network.

---

## 🎭 The supply Chain Journey

FloraChain maps the entire lifecycle of a flower across 8 specialized modules:

| Role | Responsibility | Actionable Feature |
| :--- | :--- | :--- |
| 🌱 **Harvester** | Product Generation | Batch Creation & Ledger Entry |
| 🚛 **Transporter** | Cold-Chain Logistics | IoT T-PING & Route Optimization |
| 📦 **Distributor** | B2B Hub Management | Storage Audit & Inbound Hub |
| 🏪 **Wholesaler** | Bulk Trading | Market Liquidity |
| 💐 **Retailer** | Consumer Operations | Inventory Intelligence |
| 🛒 **Consumer** | End Market | Marketplace & Traceability |
| 🎨 **Decorator** | Sustainability | Circular Economy/Recycling |
| 🛡️ **Authority** | Compliance | System Audit & Quality Assurance |

---

## 📋 Standard Operating Procedure (Workflow)

### 1. MetaMask Configuration
To interact with the blockchain, configure your MetaMask:
*   **Network Name**: `FloraChain Local`
*   **RPC URL**: `http://127.0.0.1:8545`
*   **Chain ID**: `1337` (or `31337` depending on Hardhat config)
*   **Currency**: `ETH`

> **Note**: Import the first few private keys from your Hardhat terminal to have accounts with test ETH (10,000 ETH each).

### 2. The Harvest Cycle (A Step-by-Step Demo)

#### Step A: Initialize as a Farmer
1.  Navigate to [http://localhost:3000/register/harvester](http://localhost:3000/register/harvester).
2.  Fill in your Farm details and click **Initialize Module**. Confirm the MetaMask transaction.
3.  Proceed to the **Harvester Dashboard**.

#### Step B: Create a Cryptographic Batch
1.  In the Harvester Dashboard, click **Initiate Harvest Batch**.
2.  Enter details (e.g., "Arctic White Lilies", Qty: 500, Price: 0.0025 ETH).
3.  Click **Deploy to Ledger**. This creates a permanent record of the harvest time and origin.

#### Step C: The Marketplace Transaction
1.  Switch MetaMask to a **Consumer** account (or stay as is for testing).
2.  Go to the [Marketplace](http://localhost:3000/marketplace).
3.  Find your freshly created Lilies, add them to the cart, and click **Process Order**.
4.  The system calculates the total and initiates an **Escrow Deposit** via the smart contract.

#### Step D: Monitor the Cold-Chain
1.  Access the [Transporter Dashboard](http://localhost:3000/dashboard/transporter).
2.  Locate the active manifest for your lilies.
3.  Use the **T-PING** button to simulate an IoT sensor recording temperature. This updates the ledger with thermal compliance data.

#### Step E: Verify Traceability
1.  Go to the [Track Page](http://localhost:3000/track).
2.  Enter your **Batch ID** (e.g., `1`).
3.  Behold the **Provenance Record**: See the exact minute it was harvested, the transit history, and the IoT temperature logs.

---

## 🧠 Core Technologies (No AI/ML)

*   **Ethereum Smart Contracts**: All business logic (Escrow, Role Management, Quality Penalties) is calculated on-chain.
*   **Deterministic Freshness**: The `calculateFreshnessScore` function in the contract uses time-decay formulas to provide a real-time health score.
*   **MILP (Mixed Integer Linear Programming)**: Used for route selection to minimize fuel and maximize flower longevity without guessing.
*   **IPFS (Planed)**: Used for immutable image storage of batches.

---

## 🎨 Design Language
FloraChain uses a **Premium Midnight Enterprise** aesthetic:
*   **Glow Accents**: Color-coded by role (Emerald for Farmers, Blue for Logstics).
*   **Glassmorphism**: High-blur backdrops for data-heavy terminals.
*   **Micro-Animations**: Real-time pulses indicating blockchain sync states.

---

## 🔧 Maintenance & Debugging

*   **"Contract not found"**: Ensure your Hardhat node is running and you have run `npx hardhat run scripts/deploy.ts --network localhost`.
*   **Transaction Reverted**: Check if you are trying to register a role that is already assigned to your address. The system enforces "One Role Per Wallet" for integrity.
*   **Resetting the System**: Restart the Hardhat node and redeploy. Clear MetaMask activity for that account (`Settings > Advanced > Clear Activity Tab Data`).

---

**FloraChain Enterprise OS** | *Deterministic Finality Enabled* 🌸
