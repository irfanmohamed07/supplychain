# 🧠 MILP Supply Chain Optimization - Architecture & Documentation

This document provides comprehensive documentation for the MILP (Mixed Integer Linear Programming) optimization module added to the Blockchain-Based Medicine Supply Chain Tracking System.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MILP-OPTIMIZED SUPPLY CHAIN SYSTEM                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐       │
│   │   Admin Portal    │    │   MILP Optimizer  │    │    Blockchain     │       │
│   │   (Next.js)       │◄──►│   (Python/Flask)  │    │   (Ethereum)      │       │
│   └─────────┬─────────┘    └─────────┬─────────┘    └─────────┬─────────┘       │
│             │                        │                        │                  │
│             │    ┌───────────────────┴───────────────────┐    │                  │
│             │    │           OPTIMIZATION ENGINE          │    │                  │
│             │    │  ┌─────────────────────────────────┐  │    │                  │
│             │    │  │    PuLP MILP Solver (CBC)       │  │    │                  │
│             │    │  │  ┌─────────┐  ┌─────────────┐   │  │    │                  │
│             │    │  │  │ Cost    │  │ Constraints │   │  │    │                  │
│             │    │  │  │ Function│  │   Matrix    │   │  │    │                  │
│             │    │  │  └─────────┘  └─────────────┘   │  │    │                  │
│             │    │  └─────────────────────────────────┘  │    │                  │
│             │    └───────────────────────────────────────┘    │                  │
│             ▼                                                  ▼                  │
│   ┌─────────────────────────────────────────────────────────────────────┐       │
│   │                      SUPPLY CHAIN ENTITIES                          │       │
│   │  ┌─────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────┐ │       │
│   │  │ Supplier│───►│ Manufacturer │───►│ Distributor │───►│ Retailer│ │       │
│   │  │  (RMS)  │    │    (MAN)     │    │    (DIS)    │    │  (RET)  │ │       │
│   │  └─────────┘    └──────────────┘    └─────────────┘    └─────────┘ │       │
│   └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔁 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            OPTIMIZATION WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   START     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────────────────────────────┐
    │  1. Admin configures order:         │
    │     • Medicine name                 │
    │     • Quantity                      │
    │     • Priority (cost/time/quality)  │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  2. Fetch blockchain entities       │
    │     • Load registered suppliers     │
    │     • Load manufacturers            │
    │     • Load distributors             │
    │     • Load retailers                │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  3. MILP Optimization runs          │
    │     • Build mathematical model      │
    │     • Define decision variables     │
    │     • Set constraints               │
    │     • Solve using CBC solver        │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  4. Optimal plan generated          │
    │     • Best supplier selected        │
    │     • Best manufacturer selected    │
    │     • Best distributor selected     │
    │     • Best route calculated         │
    │     • Cost & time estimated         │
    └──────────────────┬──────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────┐
    │  5. Admin reviews & approves plan   │
    │     • View route visualization      │
    │     • Check cost breakdown          │
    │     • Verify quality metrics        │
    └──────────────────┬──────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
    ┌─────────────────┐ ┌─────────────────┐
    │   Reject Plan   │ │   Approve Plan  │
    │   (Re-optimize) │ │                 │
    └────────┬────────┘ └────────┬────────┘
             │                   │
             │                   ▼
             │         ┌─────────────────────────────────────┐
             │         │  6. Store plan on blockchain        │
             │         │     • Save OptimalPlan struct       │
             │         │     • Emit OptimalPlanCreated event │
             │         └──────────────────┬──────────────────┘
             │                            │
             │                            ▼
             │         ┌─────────────────────────────────────┐
             │         │  7. Create medicine order           │
             │         │     • Add to MedicineStock          │
             │         │     • Initialize tracking stage     │
             │         └──────────────────┬──────────────────┘
             │                            │
             │                            ▼
             │         ┌─────────────────────────────────────┐
             │         │  8. Blockchain tracking starts      │
             │         │     • RawMaterialSupply stage       │
             │         │     • Manufacturing stage           │
             │         │     • Distribution stage            │
             │         │     • Retail stage                  │
             │         │     • Sold (complete)               │
             │         └──────────────────┬──────────────────┘
             │                            │
             └────────────────┬───────────┘
                              ▼
                       ┌─────────────┐
                       │    END      │
                       └─────────────┘
```

---

## 🧮 Mathematical Model

### Objective Function

```
Minimize: Z = w₁ × (Cost) + w₂ × (Time) + w₃ × (1 - Quality)

Where:
  Cost = Σᵢⱼ cₛᵢ × xₛᵢ + Σⱼₖ cₘⱼ × xₘⱼ + Σₖₗ cᴅₖ × xᴅₖ + Transport Costs
  Time = Σᵢ tₛᵢ × xₛᵢ + Σⱼ tₘⱼ × xₘⱼ + Σₖ tᴅₖ × xᴅₖ
  Quality = (Σᵢ qₛᵢ × xₛᵢ + Σⱼ qₘⱼ × xₘⱼ) / 2
```

### Decision Variables

| Variable | Type | Description |
|----------|------|-------------|
| xₛᵢ | Binary (0,1) | 1 if supplier i is selected |
| xₘⱼ | Binary (0,1) | 1 if manufacturer j is selected |
| xᴅₖ | Binary (0,1) | 1 if distributor k is selected |
| xᵣₗ | Binary (0,1) | 1 if retailer l is selected |
| qᵢⱼ | Integer ≥ 0 | Quantity flowing between entities |

### Constraints

1. **Selection Constraints** (Must select exactly one of each type):
   ```
   Σᵢ xₛᵢ = 1  (one supplier)
   Σⱼ xₘⱼ = 1  (one manufacturer)
   Σₖ xᴅₖ = 1  (one distributor)
   Σₗ xᵣₗ = 1  (one retailer)
   ```

2. **Flow Conservation**:
   ```
   Σᵢⱼ qᵢⱼ = Q  (total quantity equals demand)
   ```

3. **Capacity Constraints**:
   ```
   qᵢ ≤ Capᵢ × xᵢ  (flow limited by capacity if selected)
   ```

---

## 🏗️ Component Structure

### Backend (Blockchain)
```
backend/
├── contracts/
│   └── SupplyChain.sol           # Enhanced with OptimalPlan struct
├── hardhat.config.ts
└── package.json
```

### MILP Service (Python)
```
milp-service/
├── app.py                        # Flask API + MILP solver
├── requirements.txt              # Python dependencies
└── README.md                     # Service documentation
```

### Frontend (Next.js)
```
client/src/app/
├── page.tsx                      # Homepage (updated with Optimize link)
├── optimize/
│   └── page.tsx                  # MILP optimization UI
├── addmed/
│   └── page.tsx                  # Order materials
├── roles/
│   └── page.tsx                  # Register roles
├── supply/
│   └── page.tsx                  # Supply materials
└── track/
    └── page.tsx                  # Track materials
```

---

## 📡 API Specification

### MILP Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/optimize` | Run MILP optimization |
| GET | `/optimize/demo` | Demo with sample data |
| GET | `/entities` | Get available entities |

### Smart Contract Functions (New)

| Function | Description |
|----------|-------------|
| `addOptimalPlan()` | Store optimization result on blockchain |
| `approveOptimalPlan()` | Approve a generated plan |
| `executeOptimalPlan()` | Create medicine order from plan |
| `getOptimalPlan()` | Retrieve plan details |
| `getOptimalPlanEntities()` | Get selected entities for plan |

---

## 🎯 Priority Weights

| Priority | Cost Weight (w₁) | Time Weight (w₂) | Quality Weight (w₃) |
|----------|------------------|------------------|---------------------|
| Balanced | 0.40 | 0.30 | 0.30 |
| Cost | 0.70 | 0.20 | 0.10 |
| Time | 0.20 | 0.70 | 0.10 |
| Quality | 0.20 | 0.10 | 0.70 |

---

## 📈 Sample Output

```json
{
  "success": true,
  "status": "Optimal",
  "medicine_name": "Paracetamol 500mg",
  "quantity": 10000,
  "selected_supplier": {
    "id": "S2",
    "name": "BioMaterials Inc",
    "place": "Delhi"
  },
  "selected_manufacturer": {
    "id": "M1",
    "name": "MediPharma Industries",
    "place": "Hyderabad"
  },
  "selected_distributor": {
    "id": "D3",
    "name": "HealthChain Express",
    "place": "Chennai"
  },
  "route": "S2 (Delhi) → M1 (Hyderabad) → D3 (Chennai) → R1 (Mumbai)",
  "cost_breakdown": {
    "total_cost_per_unit": 37,
    "total_cost": 370000,
    "currency": "INR"
  },
  "time_breakdown": {
    "total_lead_time_days": 9
  },
  "quality_metrics": {
    "average_quality": 0.935
  }
}
```

---

## 🚀 Running the System

### 1. Start MILP Service
```bash
cd milp-service
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

### 2. Start Blockchain
```bash
cd backend
npm install
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

### 3. Start Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- MILP API: http://localhost:5000
- Blockchain: http://localhost:8545

---

## 📚 References

1. PuLP Documentation: https://coin-or.github.io/pulp/
2. MILP for Supply Chain: https://www.sciencedirect.com/topics/engineering/supply-chain-optimization
3. Blockchain in Supply Chain: https://www.ibm.com/topics/supply-chain-management
