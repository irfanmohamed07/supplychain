# 🧠 MILP Supply Chain Optimization Service

A Python-based microservice that uses **Mixed Integer Linear Programming (MILP)** to optimize pharmaceutical supply chain decisions.

## 📋 Overview

This service computes the optimal supply chain path by selecting the best:
- **Supplier** (Raw Material Supplier)
- **Manufacturer** 
- **Distributor**
- **Retailer**

The optimization considers:
- **Cost minimization** (procurement + manufacturing + distribution + transport)
- **Time minimization** (lead times across all stages)
- **Quality maximization** (quality scores of entities)

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation

```bash
# Navigate to the MILP service directory
cd milp-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Service

```bash
python app.py
```

The service will start on `http://localhost:5000`

## 📡 API Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "MILP Supply Chain Optimizer",
  "version": "1.0.0"
}
```

### 2. Run Optimization
```http
POST /optimize
Content-Type: application/json
```

**Request Body:**
```json
{
  "medicine_name": "Paracetamol 500mg",
  "quantity": 10000,
  "priority": "balanced",
  "min_quality": 0.85,
  "max_time": 20
}
```

**Priority Options:**
- `balanced` - Equal weight to cost, time, quality
- `cost` - Minimize cost (70% weight)
- `time` - Minimize delivery time (70% weight)
- `quality` - Maximize quality (70% weight)

**Response:**
```json
{
  "success": true,
  "status": "Optimal",
  "medicine_name": "Paracetamol 500mg",
  "quantity": 10000,
  "selected_supplier": {...},
  "selected_manufacturer": {...},
  "selected_distributor": {...},
  "selected_retailer": {...},
  "route": "S2 (Delhi) → M1 (Hyderabad) → D3 (Chennai) → R1 (Mumbai)",
  "cost_breakdown": {
    "total_cost": 370000,
    "total_cost_per_unit": 37,
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

### 3. Demo Optimization
```http
GET /optimize/demo
```

Runs optimization with sample data for testing.

### 4. Get Entities
```http
GET /entities
```

Returns all available supply chain entities (suppliers, manufacturers, distributors, retailers).

## 🧮 Mathematical Model

### Decision Variables
- `x_s[i]` ∈ {0,1} - Binary: 1 if supplier i is selected
- `x_m[j]` ∈ {0,1} - Binary: 1 if manufacturer j is selected
- `x_d[k]` ∈ {0,1} - Binary: 1 if distributor k is selected
- `x_r[l]` ∈ {0,1} - Binary: 1 if retailer l is selected
- `q_sm[i,j]` ≥ 0 - Quantity flowing from supplier i to manufacturer j

### Objective Function
```
Minimize: 
  w_cost × (Supplier Cost + Manufacturing Cost + Distribution Cost + Transport Cost)
  + w_time × (Total Lead Time)
  + w_quality × (Quality Penalty)
```

### Constraints
1. **Selection Constraints**: Exactly one entity selected per stage
2. **Flow Conservation**: Total flow in = Total flow out at each stage
3. **Capacity Constraints**: Flow ≤ Capacity × Selection variable
4. **Linking Constraints**: No flow through unselected entities

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────┐
│   Next.js App    │────►│   MILP Service   │
│   (Frontend)     │     │   (Python/Flask) │
└──────────────────┘     └──────────────────┘
         │                        │
         ▼                        ▼
┌──────────────────┐     ┌──────────────────┐
│   Smart Contract │     │   PuLP/CBC       │
│   (Blockchain)   │     │   MILP Solver    │
└──────────────────┘     └──────────────────┘
```

## 📁 File Structure

```
milp-service/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## 🔧 Configuration

### Adding Custom Entities

Edit the sample data dictionaries in `app.py`:

```python
SUPPLIERS = {
    "S1": {
        "name": "Your Supplier Name",
        "place": "City",
        "cost_per_unit": 10,
        "capacity": 50000,
        "quality_score": 0.95,
        "lead_time": 2
    },
    # Add more suppliers...
}
```

### Integrating with Blockchain Data

The `/optimize` endpoint accepts blockchain data in the request body:

```json
{
  "suppliers": {"S1": {...}, "S2": {...}},
  "manufacturers": {"M1": {...}},
  "distributors": {"D1": {...}},
  "retailers": {"R1": {...}}
}
```

## 🐳 Docker Support

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
EXPOSE 5000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t milp-service .
docker run -p 5000:5000 milp-service
```

## 📊 Performance

- Typical optimization time: < 1 second
- Supports up to 100+ entities per category
- Uses CBC (COIN-OR Branch and Cut) solver

## 🤝 Integration with Main Project

1. Start the MILP service: `python app.py`
2. Navigate to `/optimize` in the Next.js app
3. Configure optimization parameters
4. Click "Generate Optimal Supply Plan"
5. Review and approve the optimal path
6. Create blockchain order based on the plan

## 📚 References

- [PuLP Documentation](https://coin-or.github.io/pulp/)
- [MILP Theory](https://en.wikipedia.org/wiki/Integer_programming)
- [Supply Chain Optimization](https://www.sciencedirect.com/topics/engineering/supply-chain-optimization)
