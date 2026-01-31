# Supply‑Chain‑Blockchain Project Overview

## Brief Explanation of Concept
- **Goal**: Provide a tamper‑proof, end‑to‑end traceability system for medicines using a public blockchain (Ethereum).  Every participant (raw‑material supplier, manufacturer, distributor, retailer) can only advance a product to the next stage, and the whole history is stored permanently.
- **Why it matters**: Prevents counterfeit drugs, builds trust without a central authority, and gives regulators an immutable audit trail.

## Code Structure Overview
```
Supply-Chain-Blockchain/
│
├─ backend/                     # Solidity smart contract and Hardhat tooling
│   ├─ contracts/
│   │   ├─ SupplyChain.sol      # Core contract (roles, stages, functions)
│   │   └─ Migrations.sol      # Deployment helper (standard Hardhat file)
│   ├─ hardhat.config.ts       # Network & compiler configuration
│   ├─ package.json            # npm scripts: node, deploy, test, etc.
│   └─ scripts/                # deployment scripts (e.g., deploy.ts)
│
├─ client/                      # Next.js frontend (React + Web3.js)
│   ├─ pages/                  # UI pages for each role and QR‑code scanner
│   ├─ src/                    # React components, Web3 provider, utils
│   ├─ public/                 # static assets (logo, favicon)
│   └─ package.json            # npm scripts: dev, build, start
│
├─ docker-compose.yml          # Docker services (blockchain node + frontend)
├─ HOW_TO_RUN.md               # Quick‑start guide (already in repo)
└─ Explanation.md              # This documentation file
```

### Key Files
- **SupplyChain.sol** – defines `Owner`, role structs, `enum STAGE`, mappings, and all functions (`addRMS`, `RMSsupply`, `Manufacturing`, `Distribute`, `Retail`, `sold`, `showStage`).
- **hardhat.config.ts** – configures the local Hardhat network (or Ganache) used for development.
- **client/pages/** – contains pages like `index.tsx`, `supplier.tsx`, `manufacturer.tsx`, etc., each with a button that calls the corresponding contract method via Web3.js.
- **client/src/web3.ts** – sets up the Web3 provider, loads the contract ABI, and exposes helper functions.

## Detailed Run Instructions (Windows PowerShell)
1. **Prerequisites**
   - Install **Node.js 18+** (https://nodejs.org/)
   - Install **Git** (optional, for cloning)
   - Install **Docker Desktop** (optional, for the one‑click setup)
   - Install the **MetaMask** browser extension and create a wallet.

2. **Clone the repository** (if not already present)
   ```powershell
   cd D:\finalyearproject\supplychain
   git clone https://github.com/faizack619/Supply-Chain-Blockchain.git
   cd Supply-Chain-Blockchain
   ```

3. **Install npm dependencies**
   ```powershell
   # Backend (Solidity)
   cd backend
   npm install
   # Frontend (Next.js)
   cd ..\client
   npm install
   ```

4. **Start a local blockchain node**
   ```powershell
   cd ..\backend
   npm run node   # launches Hardhat/Ganache on http://127.0.0.1:8545
   ```
   - Keep this terminal open; it will keep the blockchain running.

5. **Deploy the smart contract**
   ```powershell
   npm run deploy:local   # compiles SupplyChain.sol and deploys it to the local node
   ```
   - The script prints the contract address; the frontend reads this from `client/src/deployments.json`.

6. **Run the frontend UI**
   ```powershell
   cd ..\client
   npm run dev   # starts Next.js dev server at http://localhost:3000
   ```
   - Open the URL in Chrome/Edge.

7. **Configure MetaMask**
   - Open MetaMask → Settings → Networks → Add Network.
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Save.  Import one of the accounts shown in the Hardhat console (they are displayed when the node starts) to use as a participant.

8. **Interact with the app**
   1. As **Owner** (first account), register participants via the UI (Add Supplier, Manufacturer, Distributor, Retailer).
   2. Add a new medicine (Owner only).
   3. Switch MetaMask to the Supplier account and click **Supply Raw Material**.
   4. Switch to Manufacturer, click **Manufacture**, and so on until **Sell**.
   5. After the medicine is created, a QR‑code appears; scanning it shows the full lifecycle fetched from the blockchain.

9. **Optional Docker One‑Click**
   If you prefer not to run each step manually, you can use Docker:
   ```powershell
   cd D:\finalyearproject\supplychain\Supply-Chain-Blockchain
   docker-compose up   # builds images and runs node + frontend automatically
   ```
   The UI will be reachable at `http://localhost:3000` and the blockchain at `http://127.0.0.1:8545`.

---
*Created on 2026‑01‑06. Feel free to ask for further details, a PDF export, or a visual diagram.*
