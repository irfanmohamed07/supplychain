# Supply Chain Blockchain Project Report

## 1. Executive Summary: The Concept

**What is this project?**
This project automates the medical supply chain using **Blockchain technology**. It tracks medicines from the moment they are ordered until they reach the customer's hands.

**The Problem:**
In traditional supply chains, paper records can be lost or faked. It is difficult to prove the origin of a medicine, leading to issues with **counterfeit drugs** and lack of accountability.

**The Solution:**
We use the **Ethereum Blockchain** as a public, tamper-proof digital ledger.
*   **Immutable Records:** Once a transaction is saved on the blockchain, no one can delete or change it.
*   **Transparency:** Everyone sees the same history.
*   **Trust:** A consumer can scan a **QR Code** on the medicine and see its entire history instantly.

### Real-World Concept
Imagine a "digital notebook" that is shared by the manufacturer, distributor, and pharmacy.
1.  **Manufacturer** writes: "I made 100 pills." -> *Notebook is locked.*
2.  **Distributor** writes: "I picked up the 100 pills." -> *Notebook is locked.*
3.  **Pharmacy** writes: "I received the 100 pills." -> *Notebook is locked.*

Because the "notebook" (Blockchain) is shared and locked cryptographically, the pharmacy knows for sure the pills came from the Manufacturer, not a fake source.

---

## 2. System Architecture

### Technology Stack
*   **Blockchain:** Ethereum (simulated using Hardhat/Ganche)
*   **Smart Contract Language:** Solidity
*   **Frontend:** Next.js (React Framework)
*   **Blockchain Interaction:** Web3.js & MetaMask

### Code Structure
The project is divided into two main folders:

1.  **`backend/`**
    *   Contains the **Smart Contract** code (`SupplyChain.sol`).
    *   Handles the logic: Who can sell? Who can buy? What are the supply chain steps?
2.  **`client/`**
    *   Contains the **Website** code.
    *   Screens for the Supplier, Manufacturer, and Customer.
    *   Generates the QR Code.

---

## 3. Technical Detail: The Smart Contract

The heart of the system is the file `SupplyChain.sol`. It acts as the "Referee" of the system.

**The 5 Main Roles:**
1.  **Owner:** The super-admin who approves other companies to join.
2.  **Raw Material Supplier (RMS):** Provides ingredients.
3.  **Manufacturer:** Makes the medicine.
4.  **Distributor:** Logisitics/Shipping.
5.  **Retailer:** Pharmacy/Shop.

**The Workflow (States):**
The smart contract forces a strict order. You cannot skip a step.
1.  **Stage 0: Ordered** (Owner creates order)
2.  **Stage 1: Raw Material Supply** (Supplier action)
3.  **Stage 2: Manufacturing** (Manufacturer action)
4.  **Stage 3: Distribution** (Distributor action)
5.  **Stage 4: Retail** (Retailer receives goods)
6.  **Stage 5: Sold** (Customer buys product)

---

## 4. User Manual: How to Run the Project

Follow these steps to run the project on your Windows computer.

### Prerequisites
*   Node.js installed.
*   MetaMask Extension installed in your browser.

### Step 1: Install Dependencies
Open **Windows PowerShell** and run:

```powershell
# 1. Install Backend libraries
cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain\backend
npm install

# 2. Install Frontend libraries
cd ../client
npm install
```

### Step 2: Start the Local Blockchain
You need a terminal window running the blockchain constantly.
**Open Terminal 1:**
```powershell
cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain\backend
npm run node
```
*   *Do not close this window.* It acts as your local Ethereum network.

### Step 3: Deploy the Smart Contract
You need to upload your code to the blockchain network you just started.
**Open Terminal 2:**
```powershell
cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain\backend
npm run deploy:local
```

### Step 4: Run the Website
**Open Terminal 3:**
```powershell
cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain\client
npm run dev
```

### Step 5: Connect MetaMask
1.  Open your browser to `http://localhost:3000`.
2.  Open **MetaMask**.
3.  Add a **Custom Network**:
    *   **RPC URL:** `http://127.0.0.1:8545`
    *   **Chain ID:** `1337`
    *   **Currency Symbol:** `ETH`
4.  **Import Accounts:** Use the private keys shown in "Terminal 1" to log in as the Owner, Supplier, etc.

---

## 5. How to Use the App (Demo Flow)

1.  **Login as Owner:** Register new users (1 Supplier, 1 Manufacturer, etc.) using their wallet addresses.
2.  **Order Medicine:** Go to "Order Medicine" and creates a new batch (e.g., "Paracetamol").
3.  **Switch Account:** In MetaMask, switch to the **Supplier's** account.
4.  **Supply:** Go to the Supply dashboard and click "Supply" on the order.
5.  **Repeat:** Switch accounts for Manufacturer, Distributor, and Retailer, moving the product forward each time.
6.  **Verify:** Finally, use the **Track** page to see the complete history or scan the QR code.
