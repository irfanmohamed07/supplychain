// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    //Smart Contract owner will be the person who deploys the contract only he can authorize various roles like retailer, Manufacturer,etc
    address public Owner;

    //note this constructor will be called when smart contract will be deployed on blockchain
    constructor() {
        Owner = msg.sender;
    }

    //Roles (flow of flower supply chain)
    // RawMaterialSupplier; //This is where Manufacturer will get raw materials to process flowers
    // Manufacturer;  //Processes and prepares flower batches
    // Distributor; //This guy distributes the flower batches to retailers
    // Retailer; //Normal customer buys from the retailer

    //modifier to make sure only the owner is using the function
    modifier onlyByOwner() {
        require(msg.sender == Owner);
        _;
    }

    //stages of a flower batch in supply chain
    enum STAGE {
        Init,
        RawMaterialSupply,
        Manufacture,
        Distribution,
        Retail,
        sold
    }
    //using this we are going to track every single flower batch the owner orders

    //Flower batch count
    uint256 public medicineCtr = 0; // Keep variable name for compatibility, but represents flower batches
    //Raw material supplier count
    uint256 public rmsCtr = 0;
    //Manufacturer count
    uint256 public manCtr = 0;
    //distributor count
    uint256 public disCtr = 0;
    //retailer count
    uint256 public retCtr = 0;

    //To store information about the flower batch
    struct medicine {
        uint256 id; //unique flower batch id
        string name; //name of the flower batch (e.g., "Red Roses")
        string description; //about flower batch
        uint256 RMSid; //id of the Raw Material supplier for this particular flower batch
        uint256 MANid; //id of the Manufacturer for this particular flower batch
        uint256 DISid; //id of the distributor for this particular flower batch
        uint256 RETid; //id of the retailer for this particular flower batch
        STAGE stage; //current flower batch stage
    }

    //To store all the flower batches on the blockchain
    mapping(uint256 => medicine) public MedicineStock;

    //To show status to client applications
    function showStage(uint256 _medicineID)
        public
        view
        returns (string memory)
    {
        require(medicineCtr > 0);
        if (MedicineStock[_medicineID].stage == STAGE.Init)
            return "Flower Batch Ordered";
        else if (MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply)
            return "Raw Material Supply Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Manufacture)
            return "Manufacturing Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Distribution)
            return "Distribution Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Retail)
            return "Retail Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.sold)
            return "Flower Batch Sold";
    }

    //To store information about raw material supplier
    struct rawMaterialSupplier {
        address addr;
        uint256 id; //supplier id
        string name; //Name of the raw material supplier
        string place; //Place the raw material supplier is based in
    }

    //To store all the raw material suppliers on the blockchain
    mapping(uint256 => rawMaterialSupplier) public RMS;

    //To store information about manufacturer
    struct manufacturer {
        address addr;
        uint256 id; //manufacturer id
        string name; //Name of the manufacturer
        string place; //Place the manufacturer is based in
    }

    //To store all the manufacturers on the blockchain
    mapping(uint256 => manufacturer) public MAN;

    //To store information about distributor
    struct distributor {
        address addr;
        uint256 id; //distributor id
        string name; //Name of the distributor
        string place; //Place the distributor is based in
    }

    //To store all the distributors on the blockchain
    mapping(uint256 => distributor) public DIS;

    //To store information about retailer
    struct retailer {
        address addr;
        uint256 id; //retailer id
        string name; //Name of the retailer
        string place; //Place the retailer is based in
    }

    //To store all the retailers on the blockchain
    mapping(uint256 => retailer) public RET;

    //To add raw material suppliers. Only contract owner can add a new raw material supplier
    function addRMS(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner() {
        rmsCtr++;
        RMS[rmsCtr] = rawMaterialSupplier(_address, rmsCtr, _name, _place);
    }

    //To add manufacturer. Only contract owner can add a new manufacturer
    function addManufacturer(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner() {
        manCtr++;
        MAN[manCtr] = manufacturer(_address, manCtr, _name, _place);
    }

    //To add distributor. Only contract owner can add a new distributor
    function addDistributor(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner() {
        disCtr++;
        DIS[disCtr] = distributor(_address, disCtr, _name, _place);
    }

    //To add retailer. Only contract owner can add a new retailer
    function addRetailer(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner() {
        retCtr++;
        RET[retCtr] = retailer(_address, retCtr, _name, _place);
    }

    //To supply raw materials from RMS supplier to the manufacturer
    function RMSsupply(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid flower batch ID");
        uint256 _id = findRMS(msg.sender);
        require(_id > 0, "RMS not found");
        require(MedicineStock[_medicineID].stage == STAGE.Init, "Flower batch not in correct stage");
        MedicineStock[_medicineID].RMSid = _id;
        MedicineStock[_medicineID].stage = STAGE.RawMaterialSupply;
    }

    //To check if RMS is available in the blockchain
    function findRMS(address _address) private view returns (uint256) {
        require(rmsCtr > 0);
        for (uint256 i = 1; i <= rmsCtr; i++) {
            if (RMS[i].addr == _address) return RMS[i].id;
        }
        return 0;
    }

    //To manufacture flower batch
    function Manufacturing(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid flower batch ID");
        uint256 _id = findMAN(msg.sender);
        require(_id > 0, "Manufacturer not found");
        require(MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply, "Flower batch not in correct stage");
        MedicineStock[_medicineID].MANid = _id;
        MedicineStock[_medicineID].stage = STAGE.Manufacture;
    }

    //To check if Manufacturer is available in the blockchain
    function findMAN(address _address) private view returns (uint256) {
        require(manCtr > 0);
        for (uint256 i = 1; i <= manCtr; i++) {
            if (MAN[i].addr == _address) return MAN[i].id;
        }
        return 0;
    }

    //To supply flower batches from Manufacturer to distributor
    function Distribute(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid flower batch ID");
        uint256 _id = findDIS(msg.sender);
        require(_id > 0, "Distributor not found");
        require(MedicineStock[_medicineID].stage == STAGE.Manufacture, "Flower batch not in correct stage");
        MedicineStock[_medicineID].DISid = _id;
        MedicineStock[_medicineID].stage = STAGE.Distribution;
    }

    //To check if distributor is available in the blockchain
    function findDIS(address _address) private view returns (uint256) {
        require(disCtr > 0);
        for (uint256 i = 1; i <= disCtr; i++) {
            if (DIS[i].addr == _address) return DIS[i].id;
        }
        return 0;
    }

    //To supply flower batches from distributor to retailer
    function Retail(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid flower batch ID");
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Retailer not found");
        require(MedicineStock[_medicineID].stage == STAGE.Distribution, "Flower batch not in correct stage");
        MedicineStock[_medicineID].RETid = _id;
        MedicineStock[_medicineID].stage = STAGE.Retail;
    }

    //To check if retailer is available in the blockchain
    function findRET(address _address) private view returns (uint256) {
        require(retCtr > 0);
        for (uint256 i = 1; i <= retCtr; i++) {
            if (RET[i].addr == _address) return RET[i].id;
        }
        return 0;
    }

    //To sell flower batches from retailer to consumer
    function sold(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Invalid flower batch ID");
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Retailer not found");
        require(_id == MedicineStock[_medicineID].RETid, "Only correct retailer can mark flower batch as sold");
        require(MedicineStock[_medicineID].stage == STAGE.Retail, "Flower batch not in retail stage");
        MedicineStock[_medicineID].stage = STAGE.sold;
    }

    // To add new flower batches to the stock
    function addMedicine(string memory _name, string memory _description)
        public
        onlyByOwner()
    {
        require((rmsCtr > 0) && (manCtr > 0) && (disCtr > 0) && (retCtr > 0), "All roles must be registered");
        medicineCtr++;
        MedicineStock[medicineCtr] = medicine(
            medicineCtr,
            _name,
            _description,
            0,
            0,
            0,
            0,
            STAGE.Init
        );
    }

    // ============================================
    // MILP OPTIMIZATION PLAN STORAGE
    // ============================================

    // Counter for optimal plans
    uint256 public optimalPlanCtr = 0;

    // Struct to store MILP optimization results
    struct OptimalPlan {
        uint256 id;                    // Unique plan ID
        uint256 medicineId;            // Associated flower batch ID
        string medicineName;           // Flower batch name
        uint256 quantity;              // Order quantity
        uint256 supplierId;            // Selected supplier ID
        uint256 manufacturerId;        // Selected manufacturer ID
        uint256 distributorId;         // Selected distributor ID
        uint256 retailerId;            // Selected retailer ID
        string route;                  // Route string (e.g., "S1 → M2 → D1 → R3")
        uint256 totalCost;             // Total estimated cost
        uint256 expectedDays;          // Expected delivery days
        uint256 qualityScore;          // Quality score (0-100)
        string priority;               // Optimization priority used
        uint256 timestamp;             // When the plan was created
        bool isApproved;               // Whether the plan is approved
        bool isExecuted;               // Whether tracking has started
    }

    // Mapping to store all optimal plans
    mapping(uint256 => OptimalPlan) public OptimalPlans;

    // Event emitted when a new optimal plan is stored
    event OptimalPlanCreated(
        uint256 indexed planId,
        uint256 indexed medicineId,
        string medicineName,
        uint256 quantity,
        string route,
        uint256 totalCost,
        uint256 expectedDays
    );

    // Event emitted when a plan is approved
    event OptimalPlanApproved(uint256 indexed planId, uint256 timestamp);

    // Event emitted when a plan execution starts
    event OptimalPlanExecuted(uint256 indexed planId, uint256 indexed medicineId, uint256 timestamp);

    // Store a new optimal plan from MILP service
    function addOptimalPlan(
        uint256 _medicineId,
        string memory _medicineName,
        uint256 _quantity,
        uint256 _supplierId,
        uint256 _manufacturerId,
        uint256 _distributorId,
        uint256 _retailerId,
        string memory _route,
        uint256 _totalCost,
        uint256 _expectedDays,
        uint256 _qualityScore,
        string memory _priority
    ) public onlyByOwner() returns (uint256) {
        optimalPlanCtr++;
        
        OptimalPlans[optimalPlanCtr] = OptimalPlan(
            optimalPlanCtr,
            _medicineId,
            _medicineName,
            _quantity,
            _supplierId,
            _manufacturerId,
            _distributorId,
            _retailerId,
            _route,
            _totalCost,
            _expectedDays,
            _qualityScore,
            _priority,
            block.timestamp,
            false,
            false
        );

        emit OptimalPlanCreated(
            optimalPlanCtr,
            _medicineId,
            _medicineName,
            _quantity,
            _route,
            _totalCost,
            _expectedDays
        );

        return optimalPlanCtr;
    }

    // Approve an optimal plan
    function approveOptimalPlan(uint256 _planId) public onlyByOwner() {
        require(_planId > 0 && _planId <= optimalPlanCtr, "Invalid plan ID");
        require(!OptimalPlans[_planId].isApproved, "Plan already approved");
        
        OptimalPlans[_planId].isApproved = true;
        emit OptimalPlanApproved(_planId, block.timestamp);
    }

    // Execute an approved plan (creates medicine order and starts tracking)
    function executeOptimalPlan(uint256 _planId) public onlyByOwner() {
        require(_planId > 0 && _planId <= optimalPlanCtr, "Invalid plan ID");
        require(OptimalPlans[_planId].isApproved, "Plan not approved");
        require(!OptimalPlans[_planId].isExecuted, "Plan already executed");
        
        OptimalPlan storage plan = OptimalPlans[_planId];
        
        // Create the flower batch order
        medicineCtr++;
        MedicineStock[medicineCtr] = medicine(
            medicineCtr,
            plan.medicineName,
            string(abi.encodePacked("MILP Optimized Order - Plan #", uint2str(_planId))),
            0,
            0,
            0,
            0,
            STAGE.Init
        );
        
        // Link the plan to the flower batch
        plan.medicineId = medicineCtr;
        plan.isExecuted = true;
        
        emit OptimalPlanExecuted(_planId, medicineCtr, block.timestamp);
    }

    // Get optimal plan details
    function getOptimalPlan(uint256 _planId) public view returns (
        uint256 id,
        uint256 medicineId,
        string memory medicineName,
        uint256 quantity,
        string memory route,
        uint256 totalCost,
        uint256 expectedDays,
        uint256 qualityScore,
        bool isApproved,
        bool isExecuted
    ) {
        require(_planId > 0 && _planId <= optimalPlanCtr, "Invalid plan ID");
        OptimalPlan storage plan = OptimalPlans[_planId];
        
        return (
            plan.id,
            plan.medicineId,
            plan.medicineName,
            plan.quantity,
            plan.route,
            plan.totalCost,
            plan.expectedDays,
            plan.qualityScore,
            plan.isApproved,
            plan.isExecuted
        );
    }

    // Get the selected entities for a plan
    function getOptimalPlanEntities(uint256 _planId) public view returns (
        uint256 supplierId,
        uint256 manufacturerId,
        uint256 distributorId,
        uint256 retailerId
    ) {
        require(_planId > 0 && _planId <= optimalPlanCtr, "Invalid plan ID");
        OptimalPlan storage plan = OptimalPlans[_planId];
        
        return (
            plan.supplierId,
            plan.manufacturerId,
            plan.distributorId,
            plan.retailerId
        );
    }

    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
