# How to Run Supply Chain Blockchain DApp

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Using the Application](#using-the-application)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **Git** - [Download from git-scm.com](https://git-scm.com/downloads)
- **MetaMask Browser Extension** - [Chrome Extension](https://chrome.google.com/webstore/detail/metamask) | [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/)
- **A modern web browser** (Chrome, Edge, Brave, or Firefox)

---

## Installation

### Step 1: Clone or Navigate to the Project

```bash
cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain
```

### Step 2: Install Backend Dependencies

Open **PowerShell** or **Command Prompt** and run:

```bash
cd backend
npm install
```

This will install all Hardhat and smart contract dependencies.

### Step 3: Install Frontend Dependencies

Open a **new** PowerShell/Command Prompt window and run:

```bash
cd client
npm install
```

This will install all Next.js and frontend dependencies.

---

## Running the Application

You need to run **3 separate processes** simultaneously. Open **3 terminal windows**.

### Terminal 1: Start Local Blockchain Node

**Purpose:** This runs a local Ethereum blockchain for development.

```bash
cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain\backend
npm run node
```

**What you'll see:**
- Server starts at `http://127.0.0.1:8545`
- A list of 20 test accounts with private keys
- Each account has 10,000 ETH for testing

**Keep this terminal running!** Do not close it.

### Terminal 2: Deploy Smart Contracts

**Purpose:** Deploy the SupplyChain smart contract to your local blockchain.

```bash
cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain\backend
npm run deploy:local
```

**What you'll see:**
- Contract deployment transaction
- Contract address (e.g., `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`)
- Message: "Deployment info saved to client/src/deployments.json"

**Note:** You only need to run this once per session, or whenever you restart Terminal 1.

### Terminal 3: Start Frontend Development Server

**Purpose:** Start the Next.js web application.

```bash
cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain\client
npm run dev
```

**What you'll see:**
- Server starts at `http://localhost:3000`
- Message: "Ready in X.Xs"

**Keep this terminal running!**

### Step 4: Open the Application

1. Open your web browser (Chrome, Edge, Brave, or Firefox)
2. Navigate to: **http://localhost:3000**
3. You should see the Supply Chain Manager homepage

---

## Configure MetaMask

### Step 1: Install MetaMask

If you haven't already, install the MetaMask browser extension from:
- Chrome: https://chrome.google.com/webstore/detail/metamask
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/

### Step 2: Create or Import a Wallet

- Create a new wallet, or import an existing one
- **Important:** For development, you can use a test wallet (don't use your main wallet)

### Step 3: Add Hardhat Local Network

1. Click the **network dropdown** at the top of MetaMask (usually shows "Ethereum Mainnet")
2. Click **"Add Network"** → **"Add a network manually"**
3. Enter the following details:
   - **Network Name:** `Hardhat Local`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** `ETH`
4. Click **"Save"**

### Step 4: Import a Test Account

1. Go back to **Terminal 1** (where `npm run node` is running)
2. Copy one of the **Private Keys** (the long string starting with `0x`)
3. In MetaMask, click the **account icon** (circle at top right)
4. Click **"Import Account"**
5. Paste the private key and click **"Import"**
6. You should now see the account with **10,000 ETH**

**Note:** You can import multiple accounts to simulate different roles (Owner, RMS, Manufacturer, etc.)

### Step 5: Connect MetaMask to the App

1. Make sure MetaMask is on the **"Hardhat Local"** network
2. Refresh the browser page at `http://localhost:3000`
3. The app should now detect MetaMask
4. Click **"Connect Wallet"** if prompted

---

## Using the Application

### Overview

The application has **4 main pages**:

1. **Register Roles** - Assign roles to participants (Owner only)
2. **Order Materials** - Create new medicine orders (Owner only)
3. **Supply Materials** - Manage supply chain flow (Role-specific)
4. **Track Materials** - Track medicine journey with QR codes

### Step-by-Step Workflow

#### Step 1: Register Roles (Owner Only)

**Who can do this:** Only the account that deployed the contract (Owner)

1. Go to **"Register Roles"** page
2. Make sure MetaMask is using the **Owner account** (the one that deployed the contract)
3. For each role type, fill in:
   - **Role Type:** Select from dropdown (RMS, Manufacturer, Distributor, Retailer)
   - **Ethereum Address:** Use a different Hardhat account address (from Terminal 1)
   - **Name:** e.g., "ABC Suppliers"
   - **Location:** e.g., "New York, USA"
4. Click **"Register"** → Confirm transaction in MetaMask
5. Repeat until you have at least **1 of each role type**

**Required roles:**
- ✅ At least 1 Raw Material Supplier (RMS)
- ✅ At least 1 Manufacturer
- ✅ At least 1 Distributor
- ✅ At least 1 Retailer

#### Step 2: Create a Medicine Order (Owner Only)

**Who can do this:** Only the Owner account

1. Go to **"Order Materials"** page
2. Make sure MetaMask is using the **Owner account**
3. Fill in the form:
   - **Material Name:** e.g., "Paracetamol 500mg"
   - **Material Description:** e.g., "Pain relief medicine"
4. Click **"Create Order"** → Confirm transaction in MetaMask
5. The medicine is created at **Stage 0: Ordered**

**Note:** You must have registered at least one role of each type before creating orders.

#### Step 3: Progress Through Supply Chain Stages

**Important:** You need to **switch MetaMask accounts** for each stage to simulate different real-world actors.

##### Stage 1: Raw Material Supplier

1. **Switch MetaMask** to the Raw Material Supplier account (the one you registered)
2. Go to **"Supply Materials"** page
3. Scroll to **"Step 1: Supply Raw Materials"**
4. Enter the **Medicine ID** (e.g., `1`)
5. Click **"Supply"** → Confirm transaction in MetaMask
6. Medicine moves to **Stage 1: Raw Material Supplied**

##### Stage 2: Manufacturer

1. **Switch MetaMask** to the Manufacturer account
2. On the same **"Supply Materials"** page
3. Scroll to **"Step 2: Manufacture"**
4. Enter the same **Medicine ID**
5. Click **"Manufacture"** → Confirm transaction in MetaMask
6. Medicine moves to **Stage 2: Manufacturing**

##### Stage 3: Distributor

1. **Switch MetaMask** to the Distributor account
2. Scroll to **"Step 3: Distribute"**
3. Enter the same **Medicine ID**
4. Click **"Distribute"** → Confirm transaction in MetaMask
5. Medicine moves to **Stage 3: Distribution**

##### Stage 4: Retailer

1. **Switch MetaMask** to the Retailer account
2. Scroll to **"Step 4: Retail"**
3. Enter the same **Medicine ID**
4. Click **"Retail"** → Confirm transaction in MetaMask
5. Medicine moves to **Stage 4: Retail**

##### Stage 5: Mark as Sold

1. **Still using** the Retailer account
2. Scroll to **"Step 5: Mark as Sold"**
3. Enter the same **Medicine ID**
4. Click **"Mark as Sold"** → Confirm transaction in MetaMask
5. Medicine moves to **Stage 5: Sold**

#### Step 4: Track a Medicine

1. Go to **"Track Materials"** page
2. Enter the **Medicine ID** (e.g., `1`)
3. Click **"Track"** or click on a row in the table
4. You'll see:
   - **Current Stage** of the medicine
   - **Complete Journey Timeline** showing each role that handled it
   - **Role Details** (ID, Name, Location, Ethereum Address)
   - **QR Code** - Scan to verify product information

---

## Quick Demo Flow (For Presentation)

Follow these steps in order for a complete demonstration:

1. **Register Roles** (Owner account)
   - Add 1 Raw Material Supplier
   - Add 1 Manufacturer
   - Add 1 Distributor
   - Add 1 Retailer

2. **Create Medicine** (Owner account)
   - Name: "Paracetamol 500mg"
   - Description: "Pain relief medicine"

3. **Progress Through Stages** (Switch accounts for each)
   - RMS account → Supply (ID: 1)
   - Manufacturer account → Manufacture (ID: 1)
   - Distributor account → Distribute (ID: 1)
   - Retailer account → Retail (ID: 1)
   - Retailer account → Mark as Sold (ID: 1)

4. **Track Medicine** (Any account)
   - Go to Track page
   - Enter ID: 1
   - Show complete journey + QR code

---

## Troubleshooting

### Problem: "Non-Ethereum browser detected"

**Solution:**
- Make sure you're using Chrome, Edge, Brave, or Firefox (not Internet Explorer)
- Install MetaMask extension
- Refresh the page
- Make sure MetaMask is enabled for the site

### Problem: "RPC endpoint returned too many errors"

**Solution:**
- Make sure Terminal 1 (`npm run node`) is still running
- In MetaMask, switch to **"Hardhat Local"** network (not Mainnet or Testnet)
- Refresh the browser page

### Problem: "Only the contract owner can..."

**Solution:**
- Make sure you're using the **Owner account** in MetaMask
- The Owner is the account that deployed the contract (usually Account #0 from Terminal 1)

### Problem: "Your account is not registered for this role"

**Solution:**
- Make sure you registered your account in the "Register Roles" page first
- Make sure you're using the correct MetaMask account for that role

### Problem: "Invalid stage transition"

**Solution:**
- Make sure you're following the correct order:
  1. Order → 2. Supply → 3. Manufacture → 4. Distribute → 5. Retail → 6. Sold
- Check the current stage of the medicine before proceeding

### Problem: Frontend shows errors or won't load

**Solution:**
- Make sure Terminal 3 (`npm run dev`) is running
- Make sure Terminal 1 (`npm run node`) is running
- Check that you deployed contracts (Terminal 2)
- Try refreshing the browser page

### Problem: Contract not found

**Solution:**
- Run `npm run deploy:local` again (Terminal 2)
- Make sure MetaMask is on the "Hardhat Local" network
- Refresh the browser page

---

## Important Notes

- **Never commit private keys or mnemonics** to GitHub
- **Never use real ETH** - This is a development environment only
- **The local blockchain resets** when you stop Terminal 1 - all data is lost
- **Import multiple accounts** into MetaMask to easily switch between roles
- **Keep all 3 terminals running** while using the application

---

## Stopping the Application

To stop the application:

1. **Terminal 3** (Frontend): Press `Ctrl + C` → Type `Y` → Press Enter
2. **Terminal 1** (Blockchain): Press `Ctrl + C` → Type `Y` → Press Enter
3. **Terminal 2** (Deploy): Already stopped (one-time command)

---

## Next Steps

- Read the `README.md` for more detailed documentation
- Explore the smart contract code in `backend/contracts/SupplyChain.sol`
- Customize the frontend in `client/src/app/`
- Add more features to the supply chain flow

---

**Last Updated:** December 2024
**Project:** Supply Chain Blockchain DApp
**Version:** 1.0.0





