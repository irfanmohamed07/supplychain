// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FloraChain - Fresh-Cut Flower Supply Chain Operating System
 * @notice A blockchain-powered, rule-based, optimized, auditable flower supply chain
 * @dev No AI/ML - Uses blockchain, MILP optimization, mathematical formulas, and rules engines
 */
contract FloraChain {
    // ============================================
    // OWNER & ACCESS CONTROL
    // ============================================
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // ============================================
    // ROLE DEFINITIONS
    // ============================================
    enum Role {
        None,
        Harvester,      // Farmer
        Transporter,    // Logistics
        Distributor,    // Distribution center
        Wholesaler,     // Wholesale market
        Retailer,       // Flower shop
        Consumer,       // End buyer
        Decorator,      // Recycler/Craftsperson
        Authority       // Admin/Auditor
    }

    // ============================================
    // HARVESTER (FARMER) STRUCT
    // ============================================
    struct Harvester {
        address addr;
        uint256 id;
        string farmerName;
        string farmName;
        string geoLocation;      // Latitude,Longitude
        string flowerTypes;      // Comma-separated flower types
        uint256 dailyCapacity;   // Units per day
        string seasonalFlowers;  // Flowers available by season
        string contact;
        uint256 reputationScore; // 0-100
        bool isActive;
        uint256 registeredAt;
    }

    // ============================================
    // TRANSPORTER STRUCT
    // ============================================
    struct Transporter {
        address addr;
        uint256 id;
        string vehicleType;
        bool coldChainSupport;
        uint256 capacity;        // Units
        string serviceRegion;
        string availability;     // Days/hours available
        string contact;
        uint256 reputationScore;
        bool isActive;
        uint256 registeredAt;
    }

    // ============================================
    // DISTRIBUTOR STRUCT
    // ============================================
    struct Distributor {
        address addr;
        uint256 id;
        string shopName;
        string shopAddress;
        string geoLocation;
        string storageType;
        bool hasColdStorage;
        string contact;
        uint256 reputationScore;
        bool isActive;
        uint256 registeredAt;
    }

    // ============================================
    // WHOLESALER STRUCT
    // ============================================
    struct Wholesaler {
        address addr;
        uint256 id;
        string shopName;
        string shopAddress;
        string geoLocation;
        string storageType;
        bool hasColdStorage;
        string contact;
        uint256 reputationScore;
        bool isActive;
        uint256 registeredAt;
    }

    // ============================================
    // RETAILER STRUCT
    // ============================================
    struct Retailer {
        address addr;
        uint256 id;
        string shopName;
        string shopPhotos;       // IPFS hash or URLs
        string shopAddress;
        string geoLocation;
        string storageType;
        bool hasColdStorage;
        string inventory;        // Current flower inventory
        string seasonalAvailable;
        string contact;
        uint256 reputationScore;
        bool isActive;
        uint256 registeredAt;
    }

    // ============================================
    // CONSUMER STRUCT
    // ============================================
    struct Consumer {
        address addr;
        uint256 id;
        string name;
        string deliveryAddress;
        string geoLocation;
        string contact;
        uint256 registeredAt;
    }

    // ============================================
    // DECORATOR (RECYCLER) STRUCT
    // ============================================
    struct Decorator {
        address addr;
        uint256 id;
        string workshopName;
        string craftType;
        string contact;
        uint256 reputationScore;
        bool isActive;
        uint256 registeredAt;
    }

    // ============================================
    // FLOWER BATCH STRUCT (Core Data)
    // ============================================
    struct FlowerBatch {
        uint256 batchId;
        string flowerName;
        string description;
        uint256 quantity;
        uint256 cutTime;         // Timestamp when flowers were cut
        uint256 freshnessLife;   // Hours of freshness from cut time
        string season;
        string imageHash;        // IPFS hash
        uint256 pricePerUnit;    // In wei
        uint256 harvesterId;
        BatchStage stage;
        uint256 freshnessScore;  // 0-100, decreases over time
        uint256 createdAt;
        bool isAvailable;
    }

    enum BatchStage {
        Harvested,           // 0 - Farmer harvested
        InTransitToDistributor, // 1
        AtDistributor,       // 2
        InTransitToWholesaler,  // 3
        AtWholesaler,        // 4
        InTransitToRetailer, // 5
        AtRetailer,          // 6
        InTransitToConsumer, // 7
        Delivered,           // 8
        Sold,                // 9
        Recycled             // 10 - Sent to decorator
    }

    // ============================================
    // ORDER STRUCT
    // ============================================
    struct Order {
        uint256 orderId;
        uint256 batchId;
        address buyer;
        address seller;
        uint256 quantity;
        uint256 totalPrice;
        uint256 transporterId;
        OrderStatus status;
        uint256 createdAt;
        uint256 deliveredAt;
        uint256 escrowAmount;
        bool escrowReleased;
    }

    enum OrderStatus {
        Pending,
        Confirmed,
        InTransit,
        Delivered,
        Completed,
        Disputed,
        Cancelled,
        Refunded
    }

    // ============================================
    // MILP OPTIMIZATION PLAN STRUCT
    // ============================================
    struct OptimalRoute {
        uint256 planId;
        uint256 batchId;
        uint256 sourceId;
        Role sourceRole;
        uint256 destinationId;
        Role destinationRole;
        uint256 transporterId;
        uint256 estimatedCost;
        uint256 estimatedTime;   // In hours
        uint256 riskLevel;       // 0-100
        string routeDetails;
        bool isApproved;
        bool isExecuted;
        uint256 createdAt;
    }

    // ============================================
    // TEMPERATURE LOG STRUCT (Cold Chain)
    // ============================================
    struct TemperatureLog {
        uint256 batchId;
        uint256 timestamp;
        int256 temperature;      // In Celsius * 100 (e.g., 450 = 4.5°C)
        bool isBreach;
        string location;
    }

    // ============================================
    // PENALTY STRUCT
    // ============================================
    struct Penalty {
        uint256 penaltyId;
        uint256 orderId;
        address penalizedParty;
        string reason;
        uint256 amount;
        uint256 reputationDeduction;
        uint256 timestamp;
    }

    // ============================================
    // COUNTERS
    // ============================================
    uint256 public harvesterCtr;
    uint256 public transporterCtr;
    uint256 public distributorCtr;
    uint256 public wholesalerCtr;
    uint256 public retailerCtr;
    uint256 public consumerCtr;
    uint256 public decoratorCtr;
    uint256 public batchCtr;
    uint256 public orderCtr;
    uint256 public routePlanCtr;
    uint256 public tempLogCtr;
    uint256 public penaltyCtr;

    // ============================================
    // MAPPINGS
    // ============================================
    mapping(uint256 => Harvester) public harvesters;
    mapping(uint256 => Transporter) public transporters;
    mapping(uint256 => Distributor) public distributors;
    mapping(uint256 => Wholesaler) public wholesalers;
    mapping(uint256 => Retailer) public retailers;
    mapping(uint256 => Consumer) public consumers;
    mapping(uint256 => Decorator) public decorators;
    mapping(uint256 => FlowerBatch) public batches;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => OptimalRoute) public routes;
    mapping(uint256 => TemperatureLog[]) public temperatureLogs;
    mapping(uint256 => Penalty) public penalties;

    // Address to role mapping
    mapping(address => Role) public addressToRole;
    mapping(address => uint256) public addressToRoleId;

    // ============================================
    // EVENTS
    // ============================================
    event RoleRegistered(address indexed user, Role role, uint256 roleId, uint256 timestamp);
    event BatchCreated(uint256 indexed batchId, uint256 harvesterId, string flowerName, uint256 quantity, uint256 timestamp);
    event BatchStageUpdated(uint256 indexed batchId, BatchStage fromStage, BatchStage toStage, uint256 timestamp);
    event OrderCreated(uint256 indexed orderId, uint256 batchId, address buyer, address seller, uint256 amount, uint256 timestamp);
    event OrderStatusUpdated(uint256 indexed orderId, OrderStatus status, uint256 timestamp);
    event RouteOptimized(uint256 indexed planId, uint256 batchId, uint256 estimatedCost, uint256 estimatedTime, uint256 timestamp);
    event RouteApproved(uint256 indexed planId, uint256 timestamp);
    event RouteExecuted(uint256 indexed planId, uint256 orderId, uint256 timestamp);
    event TemperatureRecorded(uint256 indexed batchId, int256 temperature, bool isBreach, uint256 timestamp);
    event PenaltyIssued(uint256 indexed penaltyId, uint256 orderId, address penalizedParty, uint256 amount, uint256 timestamp);
    event ReputationUpdated(address indexed user, Role role, uint256 newScore, uint256 timestamp);
    event EscrowDeposited(uint256 indexed orderId, uint256 amount, uint256 timestamp);
    event EscrowReleased(uint256 indexed orderId, uint256 amount, address recipient, uint256 timestamp);
    event FreshnessScoreUpdated(uint256 indexed batchId, uint256 newScore, uint256 timestamp);

    // ============================================
    // CONSTRUCTOR
    // ============================================
    constructor() {
        owner = msg.sender;
    }

    // ============================================
    // ROLE REGISTRATION FUNCTIONS
    // ============================================

    // Self-registration function (user registers themselves)
    function registerHarvesterSelf(
        string memory _farmerName,
        string memory _farmName,
        string memory _geoLocation,
        string memory _flowerTypes,
        uint256 _dailyCapacity,
        string memory _seasonalFlowers,
        string memory _contact
    ) public {
        require(addressToRole[msg.sender] == Role.None, "Already registered with a role");
        
        harvesterCtr++;
        harvesters[harvesterCtr] = Harvester({
            addr: msg.sender,
            id: harvesterCtr,
            farmerName: _farmerName,
            farmName: _farmName,
            geoLocation: _geoLocation,
            flowerTypes: _flowerTypes,
            dailyCapacity: _dailyCapacity,
            seasonalFlowers: _seasonalFlowers,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[msg.sender] = Role.Harvester;
        addressToRoleId[msg.sender] = harvesterCtr;
        
        emit RoleRegistered(msg.sender, Role.Harvester, harvesterCtr, block.timestamp);
    }

    // Owner registration function (for admin registration)
    function registerHarvester(
        address _userAddress,
        string memory _farmerName,
        string memory _farmName,
        string memory _geoLocation,
        string memory _flowerTypes,
        uint256 _dailyCapacity,
        string memory _seasonalFlowers,
        string memory _contact
    ) public onlyOwner {
        require(addressToRole[_userAddress] == Role.None, "Already registered with a role");
        
        harvesterCtr++;
        harvesters[harvesterCtr] = Harvester({
            addr: _userAddress,
            id: harvesterCtr,
            farmerName: _farmerName,
            farmName: _farmName,
            geoLocation: _geoLocation,
            flowerTypes: _flowerTypes,
            dailyCapacity: _dailyCapacity,
            seasonalFlowers: _seasonalFlowers,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[_userAddress] = Role.Harvester;
        addressToRoleId[_userAddress] = harvesterCtr;
        
        emit RoleRegistered(_userAddress, Role.Harvester, harvesterCtr, block.timestamp);
    }

    function registerTransporterSelf(
        string memory _vehicleType,
        bool _coldChainSupport,
        uint256 _capacity,
        string memory _serviceRegion,
        string memory _availability,
        string memory _contact
    ) public {
        require(addressToRole[msg.sender] == Role.None, "Already registered with a role");
        
        transporterCtr++;
        transporters[transporterCtr] = Transporter({
            addr: msg.sender,
            id: transporterCtr,
            vehicleType: _vehicleType,
            coldChainSupport: _coldChainSupport,
            capacity: _capacity,
            serviceRegion: _serviceRegion,
            availability: _availability,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[msg.sender] = Role.Transporter;
        addressToRoleId[msg.sender] = transporterCtr;
        
        emit RoleRegistered(msg.sender, Role.Transporter, transporterCtr, block.timestamp);
    }

    function registerTransporter(
        address _userAddress,
        string memory _vehicleType,
        bool _coldChainSupport,
        uint256 _capacity,
        string memory _serviceRegion,
        string memory _availability,
        string memory _contact
    ) public onlyOwner {
        require(addressToRole[_userAddress] == Role.None, "Already registered with a role");
        
        transporterCtr++;
        transporters[transporterCtr] = Transporter({
            addr: _userAddress,
            id: transporterCtr,
            vehicleType: _vehicleType,
            coldChainSupport: _coldChainSupport,
            capacity: _capacity,
            serviceRegion: _serviceRegion,
            availability: _availability,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[_userAddress] = Role.Transporter;
        addressToRoleId[_userAddress] = transporterCtr;
        
        emit RoleRegistered(_userAddress, Role.Transporter, transporterCtr, block.timestamp);
    }

    function registerDistributorSelf(
        string memory _shopName,
        string memory _shopAddress,
        string memory _geoLocation,
        string memory _storageType,
        bool _hasColdStorage,
        string memory _contact
    ) public {
        require(addressToRole[msg.sender] == Role.None, "Already registered with a role");
        
        distributorCtr++;
        distributors[distributorCtr] = Distributor({
            addr: msg.sender,
            id: distributorCtr,
            shopName: _shopName,
            shopAddress: _shopAddress,
            geoLocation: _geoLocation,
            storageType: _storageType,
            hasColdStorage: _hasColdStorage,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[msg.sender] = Role.Distributor;
        addressToRoleId[msg.sender] = distributorCtr;
        
        emit RoleRegistered(msg.sender, Role.Distributor, distributorCtr, block.timestamp);
    }

    function registerDistributor(
        address _userAddress,
        string memory _shopName,
        string memory _shopAddress,
        string memory _geoLocation,
        string memory _storageType,
        bool _hasColdStorage,
        string memory _contact
    ) public onlyOwner {
        require(addressToRole[_userAddress] == Role.None, "Already registered with a role");
        
        distributorCtr++;
        distributors[distributorCtr] = Distributor({
            addr: _userAddress,
            id: distributorCtr,
            shopName: _shopName,
            shopAddress: _shopAddress,
            geoLocation: _geoLocation,
            storageType: _storageType,
            hasColdStorage: _hasColdStorage,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[_userAddress] = Role.Distributor;
        addressToRoleId[_userAddress] = distributorCtr;
        
        emit RoleRegistered(_userAddress, Role.Distributor, distributorCtr, block.timestamp);
    }

    function registerWholesalerSelf(
        string memory _shopName,
        string memory _shopAddress,
        string memory _geoLocation,
        string memory _storageType,
        bool _hasColdStorage,
        string memory _contact
    ) public {
        require(addressToRole[msg.sender] == Role.None, "Already registered with a role");
        
        wholesalerCtr++;
        wholesalers[wholesalerCtr] = Wholesaler({
            addr: msg.sender,
            id: wholesalerCtr,
            shopName: _shopName,
            shopAddress: _shopAddress,
            geoLocation: _geoLocation,
            storageType: _storageType,
            hasColdStorage: _hasColdStorage,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[msg.sender] = Role.Wholesaler;
        addressToRoleId[msg.sender] = wholesalerCtr;
        
        emit RoleRegistered(msg.sender, Role.Wholesaler, wholesalerCtr, block.timestamp);
    }

    function registerWholesaler(
        address _userAddress,
        string memory _shopName,
        string memory _shopAddress,
        string memory _geoLocation,
        string memory _storageType,
        bool _hasColdStorage,
        string memory _contact
    ) public onlyOwner {
        require(addressToRole[_userAddress] == Role.None, "Already registered with a role");
        
        wholesalerCtr++;
        wholesalers[wholesalerCtr] = Wholesaler({
            addr: _userAddress,
            id: wholesalerCtr,
            shopName: _shopName,
            shopAddress: _shopAddress,
            geoLocation: _geoLocation,
            storageType: _storageType,
            hasColdStorage: _hasColdStorage,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[_userAddress] = Role.Wholesaler;
        addressToRoleId[_userAddress] = wholesalerCtr;
        
        emit RoleRegistered(_userAddress, Role.Wholesaler, wholesalerCtr, block.timestamp);
    }

    function registerRetailerSelf(
        string memory _shopName,
        string memory _shopPhotos,
        string memory _shopAddress,
        string memory _geoLocation,
        string memory _storageType,
        bool _hasColdStorage,
        string memory _inventory,
        string memory _seasonalAvailable,
        string memory _contact
    ) public {
        require(addressToRole[msg.sender] == Role.None, "Already registered with a role");
        
        retailerCtr++;
        retailers[retailerCtr] = Retailer({
            addr: msg.sender,
            id: retailerCtr,
            shopName: _shopName,
            shopPhotos: _shopPhotos,
            shopAddress: _shopAddress,
            geoLocation: _geoLocation,
            storageType: _storageType,
            hasColdStorage: _hasColdStorage,
            inventory: _inventory,
            seasonalAvailable: _seasonalAvailable,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[msg.sender] = Role.Retailer;
        addressToRoleId[msg.sender] = retailerCtr;
        
        emit RoleRegistered(msg.sender, Role.Retailer, retailerCtr, block.timestamp);
    }

    function registerRetailer(
        address _userAddress,
        string memory _shopName,
        string memory _shopPhotos,
        string memory _shopAddress,
        string memory _geoLocation,
        string memory _storageType,
        bool _hasColdStorage,
        string memory _inventory,
        string memory _seasonalAvailable,
        string memory _contact
    ) public onlyOwner {
        require(addressToRole[_userAddress] == Role.None, "Already registered with a role");
        
        retailerCtr++;
        retailers[retailerCtr] = Retailer({
            addr: _userAddress,
            id: retailerCtr,
            shopName: _shopName,
            shopPhotos: _shopPhotos,
            shopAddress: _shopAddress,
            geoLocation: _geoLocation,
            storageType: _storageType,
            hasColdStorage: _hasColdStorage,
            inventory: _inventory,
            seasonalAvailable: _seasonalAvailable,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[_userAddress] = Role.Retailer;
        addressToRoleId[_userAddress] = retailerCtr;
        
        emit RoleRegistered(_userAddress, Role.Retailer, retailerCtr, block.timestamp);
    }

    function registerConsumerSelf(
        string memory _name,
        string memory _deliveryAddress,
        string memory _geoLocation,
        string memory _contact
    ) public {
        require(addressToRole[msg.sender] == Role.None, "Already registered with a role");
        
        consumerCtr++;
        consumers[consumerCtr] = Consumer({
            addr: msg.sender,
            id: consumerCtr,
            name: _name,
            deliveryAddress: _deliveryAddress,
            geoLocation: _geoLocation,
            contact: _contact,
            registeredAt: block.timestamp
        });
        
        addressToRole[msg.sender] = Role.Consumer;
        addressToRoleId[msg.sender] = consumerCtr;
        
        emit RoleRegistered(msg.sender, Role.Consumer, consumerCtr, block.timestamp);
    }

    function registerConsumer(
        address _userAddress,
        string memory _name,
        string memory _deliveryAddress,
        string memory _geoLocation,
        string memory _contact
    ) public onlyOwner {
        require(addressToRole[_userAddress] == Role.None, "Already registered with a role");
        
        consumerCtr++;
        consumers[consumerCtr] = Consumer({
            addr: _userAddress,
            id: consumerCtr,
            name: _name,
            deliveryAddress: _deliveryAddress,
            geoLocation: _geoLocation,
            contact: _contact,
            registeredAt: block.timestamp
        });
        
        addressToRole[_userAddress] = Role.Consumer;
        addressToRoleId[_userAddress] = consumerCtr;
        
        emit RoleRegistered(_userAddress, Role.Consumer, consumerCtr, block.timestamp);
    }

    function registerDecoratorSelf(
        string memory _workshopName,
        string memory _craftType,
        string memory _contact
    ) public {
        require(addressToRole[msg.sender] == Role.None, "Already registered with a role");
        
        decoratorCtr++;
        decorators[decoratorCtr] = Decorator({
            addr: msg.sender,
            id: decoratorCtr,
            workshopName: _workshopName,
            craftType: _craftType,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[msg.sender] = Role.Decorator;
        addressToRoleId[msg.sender] = decoratorCtr;
        
        emit RoleRegistered(msg.sender, Role.Decorator, decoratorCtr, block.timestamp);
    }

    function registerDecorator(
        address _userAddress,
        string memory _workshopName,
        string memory _craftType,
        string memory _contact
    ) public onlyOwner {
        require(addressToRole[_userAddress] == Role.None, "Already registered with a role");
        
        decoratorCtr++;
        decorators[decoratorCtr] = Decorator({
            addr: _userAddress,
            id: decoratorCtr,
            workshopName: _workshopName,
            craftType: _craftType,
            contact: _contact,
            reputationScore: 100,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[_userAddress] = Role.Decorator;
        addressToRoleId[_userAddress] = decoratorCtr;
        
        emit RoleRegistered(_userAddress, Role.Decorator, decoratorCtr, block.timestamp);
    }

    // ============================================
    // AUTHORITY ROLE REGISTRATION
    // ============================================
    
    struct Authority {
        address addr;
        uint256 id;
        string name;
        string organization;
        string contact;
        bool isActive;
        uint256 registeredAt;
    }
    
    uint256 public authorityCtr;
    mapping(uint256 => Authority) public authorities;
    
    function registerAuthoritySelf(
        string memory _name,
        string memory _organization,
        string memory _contact
    ) public onlyOwner {
        require(addressToRole[msg.sender] == Role.None, "Already registered with a role");
        
        authorityCtr++;
        authorities[authorityCtr] = Authority({
            addr: msg.sender,
            id: authorityCtr,
            name: _name,
            organization: _organization,
            contact: _contact,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        addressToRole[msg.sender] = Role.Authority;
        addressToRoleId[msg.sender] = authorityCtr;
        
        emit RoleRegistered(msg.sender, Role.Authority, authorityCtr, block.timestamp);
    }

    // ============================================
    // BATCH MANAGEMENT (FARMER ERP)
    // ============================================

    function createBatch(
        string memory _flowerName,
        string memory _description,
        uint256 _quantity,
        uint256 _freshnessLife,
        string memory _season,
        string memory _imageHash,
        uint256 _pricePerUnit
    ) public {
        require(addressToRole[msg.sender] == Role.Harvester, "Only harvesters can create batches");
        uint256 harvesterId = addressToRoleId[msg.sender];
        
        batchCtr++;
        batches[batchCtr] = FlowerBatch({
            batchId: batchCtr,
            flowerName: _flowerName,
            description: _description,
            quantity: _quantity,
            cutTime: block.timestamp,
            freshnessLife: _freshnessLife,
            season: _season,
            imageHash: _imageHash,
            pricePerUnit: _pricePerUnit,
            harvesterId: harvesterId,
            stage: BatchStage.Harvested,
            freshnessScore: 100,
            createdAt: block.timestamp,
            isAvailable: true
        });
        
        emit BatchCreated(batchCtr, harvesterId, _flowerName, _quantity, block.timestamp);
    }

    function updateBatchStage(uint256 _batchId, BatchStage _newStage) public {
        require(_batchId > 0 && _batchId <= batchCtr, "Invalid batch ID");
        BatchStage oldStage = batches[_batchId].stage;
        batches[_batchId].stage = _newStage;
        
        emit BatchStageUpdated(_batchId, oldStage, _newStage, block.timestamp);
    }

    // ============================================
    // MILP OPTIMIZATION ROUTE STORAGE
    // ============================================

    function storeOptimalRoute(
        uint256 _batchId,
        uint256 _sourceId,
        Role _sourceRole,
        uint256 _destinationId,
        Role _destinationRole,
        uint256 _transporterId,
        uint256 _estimatedCost,
        uint256 _estimatedTime,
        uint256 _riskLevel,
        string memory _routeDetails
    ) public returns (uint256) {
        routePlanCtr++;
        routes[routePlanCtr] = OptimalRoute({
            planId: routePlanCtr,
            batchId: _batchId,
            sourceId: _sourceId,
            sourceRole: _sourceRole,
            destinationId: _destinationId,
            destinationRole: _destinationRole,
            transporterId: _transporterId,
            estimatedCost: _estimatedCost,
            estimatedTime: _estimatedTime,
            riskLevel: _riskLevel,
            routeDetails: _routeDetails,
            isApproved: false,
            isExecuted: false,
            createdAt: block.timestamp
        });
        
        emit RouteOptimized(routePlanCtr, _batchId, _estimatedCost, _estimatedTime, block.timestamp);
        return routePlanCtr;
    }

    function approveRoute(uint256 _planId) public {
        require(_planId > 0 && _planId <= routePlanCtr, "Invalid plan ID");
        require(!routes[_planId].isApproved, "Route already approved");
        
        routes[_planId].isApproved = true;
        emit RouteApproved(_planId, block.timestamp);
    }

    // ============================================
    // ORDER MANAGEMENT WITH ESCROW
    // ============================================

    function createOrder(
        uint256 _batchId,
        address _seller,
        uint256 _quantity,
        uint256 _transporterId
    ) public payable {
        require(_batchId > 0 && _batchId <= batchCtr, "Invalid batch ID");
        require(batches[_batchId].isAvailable, "Batch not available");
        require(_quantity <= batches[_batchId].quantity, "Insufficient quantity");
        
        uint256 totalPrice = _quantity * batches[_batchId].pricePerUnit;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        orderCtr++;
        orders[orderCtr] = Order({
            orderId: orderCtr,
            batchId: _batchId,
            buyer: msg.sender,
            seller: _seller,
            quantity: _quantity,
            totalPrice: totalPrice,
            transporterId: _transporterId,
            status: OrderStatus.Pending,
            createdAt: block.timestamp,
            deliveredAt: 0,
            escrowAmount: msg.value,
            escrowReleased: false
        });
        
        emit OrderCreated(orderCtr, _batchId, msg.sender, _seller, totalPrice, block.timestamp);
        emit EscrowDeposited(orderCtr, msg.value, block.timestamp);
    }

    function updateOrderStatus(uint256 _orderId, OrderStatus _status) public {
        require(_orderId > 0 && _orderId <= orderCtr, "Invalid order ID");
        orders[_orderId].status = _status;
        
        if (_status == OrderStatus.Delivered) {
            orders[_orderId].deliveredAt = block.timestamp;
        }
        
        emit OrderStatusUpdated(_orderId, _status, block.timestamp);
    }

    // ============================================
    // TEMPERATURE MONITORING (COLD CHAIN)
    // ============================================

    function recordTemperature(
        uint256 _batchId,
        int256 _temperature,
        string memory _location
    ) public {
        require(_batchId > 0 && _batchId <= batchCtr, "Invalid batch ID");
        
        // Check for breach (flowers should be 2-8°C = 200-800 in our scale)
        bool isBreach = _temperature < 200 || _temperature > 800;
        
        tempLogCtr++;
        temperatureLogs[_batchId].push(TemperatureLog({
            batchId: _batchId,
            timestamp: block.timestamp,
            temperature: _temperature,
            isBreach: isBreach,
            location: _location
        }));
        
        // If breach, reduce freshness score
        if (isBreach) {
            uint256 currentScore = batches[_batchId].freshnessScore;
            if (currentScore >= 10) {
                batches[_batchId].freshnessScore = currentScore - 10;
            }
            emit FreshnessScoreUpdated(_batchId, batches[_batchId].freshnessScore, block.timestamp);
        }
        
        emit TemperatureRecorded(_batchId, _temperature, isBreach, block.timestamp);
    }

    // ============================================
    // ESCROW RELEASE WITH PENALTY LOGIC
    // ============================================

    function releaseEscrow(uint256 _orderId) public {
        require(_orderId > 0 && _orderId <= orderCtr, "Invalid order ID");
        Order storage order = orders[_orderId];
        require(!order.escrowReleased, "Escrow already released");
        require(order.status == OrderStatus.Delivered || order.status == OrderStatus.Completed, "Order not delivered");
        
        uint256 batchId = order.batchId;
        uint256 freshnessScore = batches[batchId].freshnessScore;
        
        uint256 paymentAmount = order.escrowAmount;
        uint256 penaltyAmount = 0;
        
        // Apply penalty if freshness score is below threshold
        if (freshnessScore < 70) {
            penaltyAmount = (order.escrowAmount * (100 - freshnessScore)) / 100;
            paymentAmount = order.escrowAmount - penaltyAmount;
            
            // Record penalty
            penaltyCtr++;
            penalties[penaltyCtr] = Penalty({
                penaltyId: penaltyCtr,
                orderId: _orderId,
                penalizedParty: order.seller,
                reason: "Low freshness score",
                amount: penaltyAmount,
                reputationDeduction: (100 - freshnessScore) / 10,
                timestamp: block.timestamp
            });
            
            emit PenaltyIssued(penaltyCtr, _orderId, order.seller, penaltyAmount, block.timestamp);
        }
        
        order.escrowReleased = true;
        order.status = OrderStatus.Completed;
        
        // Transfer payment to seller
        payable(order.seller).transfer(paymentAmount);
        
        // Refund penalty amount to buyer
        if (penaltyAmount > 0) {
            payable(order.buyer).transfer(penaltyAmount);
        }
        
        emit EscrowReleased(_orderId, paymentAmount, order.seller, block.timestamp);
    }

    // ============================================
    // REPUTATION MANAGEMENT
    // ============================================

    function updateReputation(address _user, int256 _change) public onlyOwner {
        Role role = addressToRole[_user];
        uint256 roleId = addressToRoleId[_user];
        uint256 newScore;
        
        if (role == Role.Harvester) {
            int256 current = int256(harvesters[roleId].reputationScore);
            int256 updated = current + _change;
            newScore = updated < 0 ? 0 : (updated > 100 ? 100 : uint256(updated));
            harvesters[roleId].reputationScore = newScore;
        } else if (role == Role.Transporter) {
            int256 current = int256(transporters[roleId].reputationScore);
            int256 updated = current + _change;
            newScore = updated < 0 ? 0 : (updated > 100 ? 100 : uint256(updated));
            transporters[roleId].reputationScore = newScore;
        } else if (role == Role.Distributor) {
            int256 current = int256(distributors[roleId].reputationScore);
            int256 updated = current + _change;
            newScore = updated < 0 ? 0 : (updated > 100 ? 100 : uint256(updated));
            distributors[roleId].reputationScore = newScore;
        } else if (role == Role.Wholesaler) {
            int256 current = int256(wholesalers[roleId].reputationScore);
            int256 updated = current + _change;
            newScore = updated < 0 ? 0 : (updated > 100 ? 100 : uint256(updated));
            wholesalers[roleId].reputationScore = newScore;
        } else if (role == Role.Retailer) {
            int256 current = int256(retailers[roleId].reputationScore);
            int256 updated = current + _change;
            newScore = updated < 0 ? 0 : (updated > 100 ? 100 : uint256(updated));
            retailers[roleId].reputationScore = newScore;
        }
        
        emit ReputationUpdated(_user, role, newScore, block.timestamp);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    function getBatchStage(uint256 _batchId) public view returns (string memory) {
        require(_batchId > 0 && _batchId <= batchCtr, "Invalid batch ID");
        BatchStage stage = batches[_batchId].stage;
        
        if (stage == BatchStage.Harvested) return "Harvested";
        if (stage == BatchStage.InTransitToDistributor) return "In Transit to Distributor";
        if (stage == BatchStage.AtDistributor) return "At Distributor";
        if (stage == BatchStage.InTransitToWholesaler) return "In Transit to Wholesaler";
        if (stage == BatchStage.AtWholesaler) return "At Wholesaler";
        if (stage == BatchStage.InTransitToRetailer) return "In Transit to Retailer";
        if (stage == BatchStage.AtRetailer) return "At Retailer";
        if (stage == BatchStage.InTransitToConsumer) return "In Transit to Consumer";
        if (stage == BatchStage.Delivered) return "Delivered";
        if (stage == BatchStage.Sold) return "Sold";
        if (stage == BatchStage.Recycled) return "Recycled";
        return "Unknown";
    }

    function getUserRole(address _user) public view returns (Role, uint256) {
        return (addressToRole[_user], addressToRoleId[_user]);
    }

    function getTemperatureLogs(uint256 _batchId) public view returns (TemperatureLog[] memory) {
        return temperatureLogs[_batchId];
    }

    function calculateFreshnessScore(uint256 _batchId) public view returns (uint256) {
        require(_batchId > 0 && _batchId <= batchCtr, "Invalid batch ID");
        
        FlowerBatch storage batch = batches[_batchId];
        uint256 elapsedHours = (block.timestamp - batch.cutTime) / 3600;
        
        // Freshness decays linearly over freshness life
        if (elapsedHours >= batch.freshnessLife) {
            return 0;
        }
        
        uint256 decayPerHour = 100 / batch.freshnessLife;
        uint256 decay = decayPerHour * elapsedHours;
        
        // Also account for temperature breaches
        uint256 storedScore = batch.freshnessScore;
        uint256 timeBasedScore = decay > 100 ? 0 : 100 - decay;
        
        // Return the lower of the two scores
        return storedScore < timeBasedScore ? storedScore : timeBasedScore;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    function freezeAccount(address _user) public onlyOwner {
        Role role = addressToRole[_user];
        uint256 roleId = addressToRoleId[_user];
        
        if (role == Role.Harvester) {
            harvesters[roleId].isActive = false;
        } else if (role == Role.Transporter) {
            transporters[roleId].isActive = false;
        } else if (role == Role.Distributor) {
            distributors[roleId].isActive = false;
        } else if (role == Role.Wholesaler) {
            wholesalers[roleId].isActive = false;
        } else if (role == Role.Retailer) {
            retailers[roleId].isActive = false;
        } else if (role == Role.Decorator) {
            decorators[roleId].isActive = false;
        }
    }

    function unfreezeAccount(address _user) public onlyOwner {
        Role role = addressToRole[_user];
        uint256 roleId = addressToRoleId[_user];
        
        if (role == Role.Harvester) {
            harvesters[roleId].isActive = true;
        } else if (role == Role.Transporter) {
            transporters[roleId].isActive = true;
        } else if (role == Role.Distributor) {
            distributors[roleId].isActive = true;
        } else if (role == Role.Wholesaler) {
            wholesalers[roleId].isActive = true;
        } else if (role == Role.Retailer) {
            retailers[roleId].isActive = true;
        } else if (role == Role.Decorator) {
            decorators[roleId].isActive = true;
        }
    }

    // ============================================
    // FALLBACK & RECEIVE
    // ============================================
    
    receive() external payable {}
    fallback() external payable {}
}
