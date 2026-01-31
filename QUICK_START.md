# 🌸 FloraChain - Quick Start Guide

## 🚀 Method 1: Using Docker (EASIEST - Recommended)

### Prerequisites
- **Docker Desktop** installed and running
  - Download: https://www.docker.com/products/docker-desktop/
  - Make sure Docker Desktop is running (whale icon in system tray)

### Steps

1. **Open Terminal/PowerShell**
   ```bash
   cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain
   ```

2. **Start Everything**
   ```bash
   docker-compose up
   ```
   
   Wait for these messages:
   - ✅ "Compiled X Solidity files"
   - ✅ "SupplyChain deployed to: 0x..."
   - ✅ "Ready on http://localhost:3000"

3. **Open Browser**
   - Go to: **http://localhost:3000**

4. **Configure MetaMask**
   - Open MetaMask extension
   - Click network dropdown → "Add Network" → "Add a network manually"
   - Enter:
     - **Network Name:** `Hardhat Local`
     - **RPC URL:** `http://localhost:8545`
     - **Chain ID:** `1337`
     - **Currency Symbol:** `ETH`
   - Click "Save"
   
   - **Import Test Account:**
     - In MetaMask: Click account icon → "Import Account"
     - Use this private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
     - This account has 10,000 ETH for testing

5. **Done!** You can now use the app.

---

## 🔧 Method 2: Manual Setup (Without Docker)

### Prerequisites
- **Node.js 18+** installed
- **MetaMask** browser extension

### Steps

#### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd client
npm install
cd ..
```

#### Step 2: Start Hardhat Blockchain Node

Open a **new terminal** and run:
```bash
cd backend
npm run node
```

**Keep this terminal running!** You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

#### Step 3: Deploy Contracts

Open a **new terminal** and run:
```bash
cd backend
npm run compile
npm run deploy:local
```

You should see:
```
SupplyChain deployed to: 0x...
Deployment info saved to client/src/deployments.json
```

#### Step 4: Start Frontend

Open a **new terminal** and run:
```bash
cd client
npm run dev
```

You should see:
```
Ready on http://localhost:3000
```

#### Step 5: Configure MetaMask

Same as Method 1, Step 4 above.

---

## 📖 How to Use the App

### 1. Register Roles (Owner Only)
- Go to **"Register Roles"** page
- Only the account that deployed the contract can register roles
- Register at least one of each:
  - Raw Material Supplier (RMS)
  - Manufacturer
  - Distributor
  - Retailer

### 2. Create Flower Batch Order (Owner Only)
- Go to **"Order Flower Batches"** page
- Enter flower batch name (e.g., "Red Roses")
- Enter description
- Click "Create Order"

### 3. Progress Through Supply Chain
- Go to **"Supply Chain Flow"** page
- Each role can move the batch forward:
  - **RMS:** Supply raw materials (enter batch ID)
  - **Manufacturer:** Process the batch
  - **Distributor:** Distribute the batch
  - **Retailer:** Receive and sell the batch

### 4. Track Flower Batches
- Go to **"Track"** page
- Enter batch ID to see full journey

---

## 🛠 Troubleshooting

### Problem: "Cannot connect to network"
**Solution:**
- Make sure Hardhat node is running (`npm run node` in backend)
- Check MetaMask is connected to "Hardhat Local" network
- Verify RPC URL is `http://localhost:8545`

### Problem: "Transaction failed"
**Solution:**
- Make sure you're using the correct account
- Check you have enough ETH (should have 10,000 ETH in test account)
- Verify the contract is deployed (check `client/src/deployments.json`)

### Problem: "Only owner can perform this action"
**Solution:**
- You need to use the account that deployed the contract
- In MetaMask, switch to Account #0 (the deployer account)

### Problem: Docker won't start
**Solution:**
- Make sure Docker Desktop is running
- Check ports 3000 and 8545 are not in use
- Try: `docker-compose down` then `docker-compose up --build`

### Problem: "Module not found"
**Solution:**
- Run `npm install` in both `backend` and `client` directories
- If using Docker: `docker-compose up --build`

---

## 🎯 Quick Commands Reference

### Docker Method
```bash
# Start everything
docker-compose up

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build
```

### Manual Method
```bash
# Terminal 1: Start blockchain
cd backend && npm run node

# Terminal 2: Deploy contracts
cd backend && npm run deploy:local

# Terminal 3: Start frontend
cd client && npm run dev
```

---

## ✅ Checklist

Before using the app, make sure:
- [ ] Docker is running (if using Docker method)
- [ ] OR Hardhat node is running (if using manual method)
- [ ] Contracts are deployed
- [ ] Frontend is running on http://localhost:3000
- [ ] MetaMask is configured with Hardhat Local network
- [ ] Test account is imported in MetaMask
- [ ] You're connected to the correct network in MetaMask

---

## 🎉 You're Ready!

Once everything is running:
1. Open http://localhost:3000
2. Connect MetaMask
3. Start registering roles and creating flower batches!

**Need more help?** Check `DOCKER_SETUP.md` or `HOW_TO_RUN.md` for detailed instructions.

