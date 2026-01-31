# Docker Setup Guide - Supply Chain Blockchain DApp

This guide will help you run the entire application using Docker with just one command!

## Prerequisites

- **Docker Desktop** installed on your computer
  - Windows: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
  - Mac: [Download Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
  - Linux: [Install Docker Engine](https://docs.docker.com/engine/install/)

## Quick Start

### Step 1: Install Docker Desktop

1. Download Docker Desktop from the links above
2. Install and restart your computer if prompted
3. Open Docker Desktop and wait for it to start (you'll see a whale icon in your system tray)

### Step 2: Navigate to Project Directory

Open PowerShell or Terminal and navigate to your project:

```bash
cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain
```

### Step 3: Start Everything with Docker

Run this single command:

```bash
docker-compose up
```

That's it! Docker will:
- ✅ Install all dependencies automatically
- ✅ Start the Hardhat blockchain node
- ✅ Compile smart contracts
- ✅ Deploy contracts
- ✅ Start the frontend

### Step 4: Access the Application

Once you see "Ready" messages, open your browser:
- **Frontend:** http://localhost:3000
- **Blockchain Node:** http://localhost:8545

## What Docker Does Automatically

1. **Builds Backend Container**
   - Installs Node.js and all backend dependencies
   - Sets up Hardhat environment

2. **Starts Blockchain Node**
   - Runs Hardhat node on port 8545
   - Provides 20 test accounts with 10,000 ETH each

3. **Compiles & Deploys Contracts**
   - Compiles Solidity contracts
   - Deploys to local blockchain
   - Saves contract address to `deployments.json`

4. **Starts Frontend**
   - Installs Next.js dependencies
   - Starts development server on port 3000

## Configure MetaMask

After Docker starts, configure MetaMask:

1. **Add Network:**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. **Import Test Account:**
   - Check Docker logs for private keys
   - Or use: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (Account #0)
   - Import in MetaMask

## Useful Docker Commands

### Start in Background (Detached Mode)
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Everything
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

### View Running Containers
```bash
docker ps
```

### Access Container Shell
```bash
# Backend container
docker exec -it supplychain-hardhat-node sh

# Frontend container
docker exec -it supplychain-frontend sh
```

## Troubleshooting

### Problem: "Docker daemon is not running"
**Solution:**
- Open Docker Desktop application
- Wait for it to fully start (whale icon should be steady)
- Try again

### Problem: "Port already in use"
**Solution:**
- Stop any existing Node.js processes
- Or change ports in `docker-compose.yml`:
  ```yaml
  ports:
    - "8546:8545"  # Change 8545 to 8546
    - "3001:3000"   # Change 3000 to 3001
  ```

### Problem: "Cannot connect to network"
**Solution:**
- Make sure `hardhat-node` service is running
- Check logs: `docker-compose logs hardhat-node`
- Wait a few seconds for the node to fully start

### Problem: "Module not found" errors
**Solution:**
- Rebuild containers: `docker-compose up --build`
- Make sure all files are in the correct directories

### Problem: Frontend shows errors
**Solution:**
- Check that `deploy` service completed successfully
- View logs: `docker-compose logs deploy`
- Restart: `docker-compose restart frontend`

## Development Workflow

### Making Code Changes

1. **Edit your code** in your favorite editor
2. **Frontend changes** - Automatically hot-reloads
3. **Backend/Contract changes** - Restart services:
   ```bash
   docker-compose restart deploy frontend
   ```

### Rebuilding After Major Changes

If you add new dependencies or change Dockerfiles:

```bash
docker-compose down
docker-compose up --build
```

## Clean Up

### Remove Everything (Fresh Start)
```bash
docker-compose down -v
docker system prune -a
```

### Remove Only This Project
```bash
docker-compose down -v --rmi all
```

## Advantages of Docker

✅ **No Manual Setup** - Everything is automated  
✅ **Consistent Environment** - Works the same on all computers  
✅ **Easy Sharing** - Your friend just needs Docker  
✅ **Isolated** - Doesn't affect your system  
✅ **One Command** - `docker-compose up` does everything  

## Manual Setup vs Docker

| Task | Manual Setup | Docker |
|------|-------------|--------|
| Install Node.js | ✅ Required | ❌ Not needed |
| Install dependencies | ✅ Manual (2x) | ✅ Automatic |
| Start blockchain | ✅ Manual terminal | ✅ Automatic |
| Compile contracts | ✅ Manual | ✅ Automatic |
| Deploy contracts | ✅ Manual | ✅ Automatic |
| Start frontend | ✅ Manual terminal | ✅ Automatic |
| **Total Commands** | **~10+ commands** | **1 command** |

## Next Steps

1. Run `docker-compose up`
2. Wait for all services to start
3. Open http://localhost:3000
4. Configure MetaMask
5. Start using the app!

---

**Need Help?** Check the logs with `docker-compose logs` or refer to the main `HOW_TO_RUN.md` guide.




