"""
FloraChain MILP Optimization Service
=====================================
A Flask-based API for Mixed Integer Linear Programming optimization
of the fresh-cut flower supply chain.

Features:
- Route optimization for ANY role -> ANY role movement
- Cost, time, and quality-based multi-objective optimization
- Cold-chain constraint handling
- Freshness decay modeling
- Risk assessment

No AI/ML - Pure mathematical optimization using PuLP (CBC solver)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pulp import *
import json
import math
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ============================================
# CONFIGURATION
# ============================================

# Priority weights for optimization objectives
PRIORITY_WEIGHTS = {
    'balanced':  {'cost': 0.40, 'time': 0.30, 'quality': 0.30},
    'cost':      {'cost': 0.70, 'time': 0.20, 'quality': 0.10},
    'time':      {'cost': 0.20, 'time': 0.70, 'quality': 0.10},
    'quality':   {'cost': 0.20, 'time': 0.10, 'quality': 0.70},
    'freshness': {'cost': 0.15, 'time': 0.15, 'quality': 0.70}
}

# Temperature thresholds for flowers (Celsius)
TEMP_MIN = 2
TEMP_MAX = 8
TEMP_OPTIMAL = 5

# Freshness decay rate per hour (percentage)
FRESHNESS_DECAY_RATE = 1.5  # 1.5% per hour base decay

# ============================================
# SAMPLE DATA (Would come from blockchain in production)
# ============================================

HARVESTERS = [
    {'id': 1, 'name': 'Green Valley Farms', 'location': 'Pune', 'lat': 18.5204, 'lon': 73.8567, 'capacity': 5000, 'quality': 0.95, 'cost_per_unit': 10},
    {'id': 2, 'name': 'Sunrise Flowers', 'location': 'Nashik', 'lat': 19.9975, 'lon': 73.7898, 'capacity': 8000, 'quality': 0.92, 'cost_per_unit': 8},
    {'id': 3, 'name': 'Blossom Gardens', 'location': 'Bangalore', 'lat': 12.9716, 'lon': 77.5946, 'capacity': 6000, 'quality': 0.98, 'cost_per_unit': 12}
]

TRANSPORTERS = [
    {'id': 1, 'name': 'ColdChain Express', 'vehicle': 'Refrigerated Truck', 'cold_chain': True, 'capacity': 2000, 'cost_per_km': 15, 'speed_kmph': 50, 'quality': 0.95},
    {'id': 2, 'name': 'FastFlora Logistics', 'vehicle': 'Van', 'cold_chain': False, 'capacity': 1000, 'cost_per_km': 8, 'speed_kmph': 60, 'quality': 0.80},
    {'id': 3, 'name': 'Premium Florals Transport', 'vehicle': 'Climate-Controlled Van', 'cold_chain': True, 'capacity': 1500, 'cost_per_km': 12, 'speed_kmph': 55, 'quality': 0.92}
]

DISTRIBUTORS = [
    {'id': 1, 'name': 'Metro Flower Hub', 'location': 'Mumbai', 'lat': 19.0760, 'lon': 72.8777, 'capacity': 10000, 'cold_storage': True, 'cost_per_unit': 5, 'quality': 0.90},
    {'id': 2, 'name': 'Central Florals Dist', 'location': 'Delhi', 'lat': 28.7041, 'lon': 77.1025, 'capacity': 15000, 'cold_storage': True, 'cost_per_unit': 4, 'quality': 0.88}
]

WHOLESALERS = [
    {'id': 1, 'name': 'Dadar Flower Market', 'location': 'Mumbai', 'lat': 19.0178, 'lon': 72.8478, 'capacity': 20000, 'cold_storage': False, 'cost_per_unit': 3, 'quality': 0.85},
    {'id': 2, 'name': 'Ghazipur Mandi', 'location': 'Delhi', 'lat': 28.6253, 'lon': 77.3212, 'capacity': 25000, 'cold_storage': False, 'cost_per_unit': 2, 'quality': 0.82}
]

RETAILERS = [
    {'id': 1, 'name': 'Rose Garden Florist', 'location': 'Bandra, Mumbai', 'lat': 19.0596, 'lon': 72.8295, 'capacity': 500, 'cold_storage': True, 'cost_per_unit': 8, 'quality': 0.95},
    {'id': 2, 'name': 'Bloom & Petals', 'location': 'Connaught Place, Delhi', 'lat': 28.6315, 'lon': 77.2167, 'capacity': 400, 'cold_storage': True, 'cost_per_unit': 10, 'quality': 0.93},
    {'id': 3, 'name': 'Fresh Flowers Hub', 'location': 'Koramangala, Bangalore', 'lat': 12.9352, 'lon': 77.6245, 'capacity': 600, 'cold_storage': False, 'cost_per_unit': 6, 'quality': 0.88}
]

# ============================================
# HELPER FUNCTIONS
# ============================================

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def calculate_freshness_score(initial_score, hours_elapsed, has_cold_chain):
    """
    Calculate freshness score based on time elapsed and cold chain status
    
    Formula: F(t) = F_0 * e^(-λ * t)
    Where:
    - F_0 = initial freshness (100)
    - λ = decay rate (adjusted for cold chain)
    - t = time in hours
    """
    decay_rate = FRESHNESS_DECAY_RATE / 100
    if has_cold_chain:
        decay_rate *= 0.3  # 70% reduction in decay with cold chain
    
    freshness = initial_score * math.exp(-decay_rate * hours_elapsed)
    return max(0, min(100, freshness))

def calculate_risk_level(distance, has_cold_chain, freshness_life_hours, transit_hours):
    """
    Calculate risk level (0-100) based on multiple factors
    
    Risk factors:
    - Distance (longer = higher risk)
    - Cold chain availability
    - Remaining freshness life
    """
    # Distance risk (0-40)
    distance_risk = min(40, (distance / 500) * 40)
    
    # Cold chain risk (0-30)
    cold_chain_risk = 0 if has_cold_chain else 30
    
    # Freshness risk (0-30)
    remaining_life = freshness_life_hours - transit_hours
    if remaining_life <= 0:
        freshness_risk = 30
    else:
        freshness_risk = max(0, 30 - (remaining_life / freshness_life_hours) * 30)
    
    return min(100, distance_risk + cold_chain_risk + freshness_risk)

def get_entity_coords(entity_type, entity_id):
    """Get coordinates for an entity"""
    entities = {
        'harvester': HARVESTERS,
        'transporter': TRANSPORTERS,
        'distributor': DISTRIBUTORS,
        'wholesaler': WHOLESALERS,
        'retailer': RETAILERS
    }
    
    entity_list = entities.get(entity_type, [])
    for e in entity_list:
        if e['id'] == entity_id:
            return e.get('lat', 0), e.get('lon', 0)
    return 0, 0

# ============================================
# MILP OPTIMIZATION ENGINE
# ============================================

def optimize_route(
    source_type: str,
    source_id: int,
    destination_type: str,
    destination_id: int,
    quantity: int,
    freshness_life_hours: int,
    priority: str = 'balanced',
    require_cold_chain: bool = False
):
    """
    Main MILP optimization function
    
    Minimizes: w1*Cost + w2*Time + w3*(1-Quality)
    
    Subject to:
    - Capacity constraints
    - Cold chain requirements
    - Freshness life constraints
    - Single transporter selection
    """
    
    weights = PRIORITY_WEIGHTS.get(priority, PRIORITY_WEIGHTS['balanced'])
    
    # Get source and destination coordinates
    source_lat, source_lon = get_entity_coords(source_type, source_id)
    dest_lat, dest_lon = get_entity_coords(destination_type, destination_id)
    
    # Create the MILP problem
    prob = LpProblem("FloraChain_Route_Optimization", LpMinimize)
    
    # Decision variables: binary selection for each transporter
    x = LpVariable.dicts("transporter", [t['id'] for t in TRANSPORTERS], cat='Binary')
    
    # Calculate metrics for each transporter
    transporter_metrics = {}
    for t in TRANSPORTERS:
        distance = haversine_distance(source_lat, source_lon, dest_lat, dest_lon)
        
        # Add some variation based on transporter (different routes)
        distance *= (1 + (t['id'] - 2) * 0.05)
        
        transit_time = distance / t['speed_kmph']
        transport_cost = distance * t['cost_per_km']
        
        # Calculate expected freshness on arrival
        arrival_freshness = calculate_freshness_score(100, transit_time, t['cold_chain'])
        
        # Calculate risk
        risk = calculate_risk_level(distance, t['cold_chain'], freshness_life_hours, transit_time)
        
        transporter_metrics[t['id']] = {
            'distance': distance,
            'transit_time': transit_time,
            'transport_cost': transport_cost,
            'arrival_freshness': arrival_freshness,
            'quality': t['quality'],
            'risk': risk,
            'cold_chain': t['cold_chain'],
            'name': t['name'],
            'capacity': t['capacity']
        }
    
    # Normalize metrics for objective function
    max_cost = max(m['transport_cost'] for m in transporter_metrics.values())
    max_time = max(m['transit_time'] for m in transporter_metrics.values())
    
    # Objective function: minimize weighted sum
    prob += lpSum([
        weights['cost'] * (transporter_metrics[t['id']]['transport_cost'] / max_cost) * x[t['id']] +
        weights['time'] * (transporter_metrics[t['id']]['transit_time'] / max_time) * x[t['id']] +
        weights['quality'] * (1 - transporter_metrics[t['id']]['quality']) * x[t['id']]
        for t in TRANSPORTERS
    ]), "Total_Weighted_Objective"
    
    # Constraint: Select exactly one transporter
    prob += lpSum([x[t['id']] for t in TRANSPORTERS]) == 1, "Select_One_Transporter"
    
    # Constraint: Selected transporter must have sufficient capacity
    for t in TRANSPORTERS:
        if t['capacity'] < quantity:
            prob += x[t['id']] == 0, f"Capacity_Constraint_{t['id']}"
    
    # Constraint: Cold chain requirement
    if require_cold_chain:
        for t in TRANSPORTERS:
            if not t['cold_chain']:
                prob += x[t['id']] == 0, f"ColdChain_Constraint_{t['id']}"
    
    # Constraint: Freshness life must be sufficient
    for t in TRANSPORTERS:
        metrics = transporter_metrics[t['id']]
        if metrics['transit_time'] > freshness_life_hours * 0.7:  # Leave 30% buffer
            prob += x[t['id']] == 0, f"Freshness_Constraint_{t['id']}"
    
    # Solve the problem
    prob.solve(PULP_CBC_CMD(msg=0))
    
    # Get results
    if LpStatus[prob.status] != 'Optimal':
        return {
            'success': False,
            'status': LpStatus[prob.status],
            'message': 'No feasible solution found'
        }
    
    # Find selected transporter
    selected_id = None
    for t in TRANSPORTERS:
        if value(x[t['id']]) == 1:
            selected_id = t['id']
            break
    
    if selected_id is None:
        return {
            'success': False,
            'status': 'Error',
            'message': 'No transporter selected'
        }
    
    selected_metrics = transporter_metrics[selected_id]
    selected_transporter = next(t for t in TRANSPORTERS if t['id'] == selected_id)
    
    # Build result
    result = {
        'success': True,
        'status': 'Optimal',
        'optimization_timestamp': datetime.now().isoformat(),
        
        'route': {
            'source': {
                'type': source_type,
                'id': source_id
            },
            'destination': {
                'type': destination_type,
                'id': destination_id
            },
            'distance_km': round(selected_metrics['distance'], 2)
        },
        
        'selected_transporter': {
            'id': selected_id,
            'name': selected_transporter['name'],
            'vehicle': selected_transporter['vehicle'],
            'cold_chain': selected_transporter['cold_chain'],
            'capacity': selected_transporter['capacity']
        },
        
        'cost_breakdown': {
            'transport_cost': round(selected_metrics['transport_cost'], 2),
            'cost_per_km': selected_transporter['cost_per_km'],
            'currency': 'INR'
        },
        
        'time_breakdown': {
            'transit_time_hours': round(selected_metrics['transit_time'], 2),
            'estimated_speed_kmph': selected_transporter['speed_kmph']
        },
        
        'quality_metrics': {
            'transporter_quality': selected_metrics['quality'],
            'expected_freshness_on_arrival': round(selected_metrics['arrival_freshness'], 1),
            'risk_level': round(selected_metrics['risk'], 1)
        },
        
        'constraints_satisfied': {
            'cold_chain_required': require_cold_chain,
            'cold_chain_provided': selected_transporter['cold_chain'],
            'capacity_sufficient': selected_transporter['capacity'] >= quantity,
            'freshness_preserved': selected_metrics['transit_time'] <= freshness_life_hours * 0.7
        },
        
        'priority_used': priority,
        'weights_applied': weights,
        
        'comparison': {
            'all_options': [
                {
                    'transporter_id': t['id'],
                    'name': transporter_metrics[t['id']]['name'],
                    'cost': round(transporter_metrics[t['id']]['transport_cost'], 2),
                    'time_hours': round(transporter_metrics[t['id']]['transit_time'], 2),
                    'freshness': round(transporter_metrics[t['id']]['arrival_freshness'], 1),
                    'risk': round(transporter_metrics[t['id']]['risk'], 1),
                    'selected': t['id'] == selected_id
                }
                for t in TRANSPORTERS
            ]
        }
    }
    
    return result

# ============================================
# API ENDPOINTS
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'FloraChain MILP Optimization Service',
        'version': '2.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/optimize', methods=['POST'])
def optimize():
    """
    Main optimization endpoint
    
    Request body:
    {
        "source_type": "harvester",
        "source_id": 1,
        "destination_type": "distributor", 
        "destination_id": 1,
        "quantity": 1000,
        "freshness_life_hours": 72,
        "priority": "balanced",
        "require_cold_chain": false
    }
    """
    try:
        data = request.get_json()
        
        result = optimize_route(
            source_type=data.get('source_type', 'harvester'),
            source_id=data.get('source_id', 1),
            destination_type=data.get('destination_type', 'distributor'),
            destination_id=data.get('destination_id', 1),
            quantity=data.get('quantity', 1000),
            freshness_life_hours=data.get('freshness_life_hours', 72),
            priority=data.get('priority', 'balanced'),
            require_cold_chain=data.get('require_cold_chain', False)
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'Error',
            'message': str(e)
        }), 500

@app.route('/optimize/demo', methods=['GET'])
def optimize_demo():
    """Demo endpoint with sample optimization"""
    result = optimize_route(
        source_type='harvester',
        source_id=1,
        destination_type='retailer',
        destination_id=1,
        quantity=500,
        freshness_life_hours=72,
        priority='balanced',
        require_cold_chain=True
    )
    return jsonify(result)

@app.route('/entities', methods=['GET'])
def get_entities():
    """Get all available entities for frontend dropdowns"""
    return jsonify({
        'harvesters': HARVESTERS,
        'transporters': TRANSPORTERS,
        'distributors': DISTRIBUTORS,
        'wholesalers': WHOLESALERS,
        'retailers': RETAILERS
    })

@app.route('/freshness/calculate', methods=['POST'])
def calculate_freshness():
    """
    Calculate freshness score endpoint
    
    Request body:
    {
        "initial_score": 100,
        "hours_elapsed": 24,
        "has_cold_chain": true
    }
    """
    try:
        data = request.get_json()
        score = calculate_freshness_score(
            initial_score=data.get('initial_score', 100),
            hours_elapsed=data.get('hours_elapsed', 0),
            has_cold_chain=data.get('has_cold_chain', False)
        )
        return jsonify({
            'freshness_score': round(score, 2),
            'decay_rate': FRESHNESS_DECAY_RATE if not data.get('has_cold_chain', False) else FRESHNESS_DECAY_RATE * 0.3
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/risk/calculate', methods=['POST'])
def calculate_risk_endpoint():
    """
    Calculate risk level endpoint
    
    Request body:
    {
        "distance_km": 150,
        "has_cold_chain": true,
        "freshness_life_hours": 72,
        "transit_hours": 3
    }
    """
    try:
        data = request.get_json()
        risk = calculate_risk_level(
            distance=data.get('distance_km', 0),
            has_cold_chain=data.get('has_cold_chain', False),
            freshness_life_hours=data.get('freshness_life_hours', 72),
            transit_hours=data.get('transit_hours', 0)
        )
        return jsonify({
            'risk_level': round(risk, 2),
            'risk_category': 'Low' if risk < 30 else ('Medium' if risk < 60 else 'High')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/simulate', methods=['POST'])
def simulate_comparison():
    """
    Simulate multiple orders and compare MILP vs simple routing
    
    Request body:
    {
        "num_orders": 100
    }
    """
    try:
        data = request.get_json()
        num_orders = data.get('num_orders', 50)
        
        import random
        
        milp_results = {'total_cost': 0, 'total_time': 0, 'avg_freshness': 0}
        simple_results = {'total_cost': 0, 'total_time': 0, 'avg_freshness': 0}
        
        for _ in range(num_orders):
            # Random order parameters
            quantity = random.randint(100, 2000)
            freshness_life = random.randint(48, 96)
            
            source_id = random.choice([1, 2, 3])
            dest_id = random.choice([1, 2, 3])
            
            # MILP optimization
            milp_result = optimize_route(
                source_type='harvester',
                source_id=source_id,
                destination_type='retailer',
                destination_id=dest_id,
                quantity=quantity,
                freshness_life_hours=freshness_life,
                priority='balanced',
                require_cold_chain=False
            )
            
            if milp_result['success']:
                milp_results['total_cost'] += milp_result['cost_breakdown']['transport_cost']
                milp_results['total_time'] += milp_result['time_breakdown']['transit_time_hours']
                milp_results['avg_freshness'] += milp_result['quality_metrics']['expected_freshness_on_arrival']
            
            # Simple routing (always pick first transporter)
            simple_transport = TRANSPORTERS[0]
            source_lat, source_lon = get_entity_coords('harvester', source_id)
            dest_lat, dest_lon = get_entity_coords('retailer', dest_id)
            distance = haversine_distance(source_lat, source_lon, dest_lat, dest_lon)
            
            simple_cost = distance * simple_transport['cost_per_km']
            simple_time = distance / simple_transport['speed_kmph']
            simple_freshness = calculate_freshness_score(100, simple_time, simple_transport['cold_chain'])
            
            simple_results['total_cost'] += simple_cost
            simple_results['total_time'] += simple_time
            simple_results['avg_freshness'] += simple_freshness
        
        milp_results['avg_freshness'] /= num_orders
        simple_results['avg_freshness'] /= num_orders
        
        savings = {
            'cost_savings_percent': round((1 - milp_results['total_cost'] / simple_results['total_cost']) * 100, 2),
            'time_savings_percent': round((1 - milp_results['total_time'] / simple_results['total_time']) * 100, 2),
            'freshness_improvement_percent': round((milp_results['avg_freshness'] - simple_results['avg_freshness']), 2)
        }
        
        return jsonify({
            'num_orders_simulated': num_orders,
            'milp_results': {
                'total_cost': round(milp_results['total_cost'], 2),
                'total_time_hours': round(milp_results['total_time'], 2),
                'avg_freshness': round(milp_results['avg_freshness'], 2)
            },
            'simple_routing_results': {
                'total_cost': round(simple_results['total_cost'], 2),
                'total_time_hours': round(simple_results['total_time'], 2),
                'avg_freshness': round(simple_results['avg_freshness'], 2)
            },
            'savings': savings,
            'conclusion': f"MILP optimization saves {savings['cost_savings_percent']}% cost, {savings['time_savings_percent']}% time, and improves freshness by {savings['freshness_improvement_percent']}%"
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("🌸 FloraChain MILP Optimization Service")
    print("=" * 50)
    print("Endpoints:")
    print("  GET  /health           - Health check")
    print("  POST /optimize         - Run MILP optimization")
    print("  GET  /optimize/demo    - Demo with sample data")
    print("  GET  /entities         - Get all entities")
    print("  POST /freshness/calculate - Calculate freshness score")
    print("  POST /risk/calculate   - Calculate risk level")
    print("  POST /simulate         - Simulate MILP vs simple routing")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
