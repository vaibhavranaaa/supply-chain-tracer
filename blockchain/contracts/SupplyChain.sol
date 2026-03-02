// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SupplyChain {

    // ─── Data Structures ───────────────────────────────────────────────

    struct Stage {
        string stageName;     // e.g. "HARVEST", "EXPORT"
        string actor;         // who performed this stage
        string location;      // where it happened
        string notes;         // any extra info
        uint256 timestamp;    // when it happened (auto)
    }

    struct Product {
        string name;          // product name
        string origin;        // where it was made/grown
        address registeredBy; // wallet that registered it
        bool exists;          // to check if product exists
    }

    // ─── Storage ───────────────────────────────────────────────────────

    mapping(string => Product) public products;       // productId => Product
    mapping(string => Stage[]) public productStages;  // productId => all stages

    // ─── Events ────────────────────────────────────────────────────────

    event ProductRegistered(string productId, string name, string origin);
    event StageAdded(string productId, string stageName, string actor, string location);

    // ─── Functions ─────────────────────────────────────────────────────

    // 1. Register a new product on the blockchain
    function registerProduct(
        string memory productId,
        string memory name,
        string memory origin
    ) public {
        require(!products[productId].exists, "Product already exists!");

        products[productId] = Product({
            name: name,
            origin: origin,
            registeredBy: msg.sender,
            exists: true
        });

        emit ProductRegistered(productId, name, origin);
    }

    // 2. Add a new supply chain stage to a product
    function addStage(
        string memory productId,
        string memory stageName,
        string memory actor,
        string memory location,
        string memory notes
    ) public {
        require(products[productId].exists, "Product does not exist!");

        productStages[productId].push(Stage({
            stageName: stageName,
            actor: actor,
            location: location,
            notes: notes,
            timestamp: block.timestamp
        }));

        emit StageAdded(productId, stageName, actor, location);
    }

    // 3. Get total number of stages for a product
    function getStageCount(string memory productId) 
        public view returns (uint256) {
        return productStages[productId].length;
    }

    // 4. Get a specific stage by index
    function getStage(string memory productId, uint256 index)
        public view returns (
            string memory stageName,
            string memory actor,
            string memory location,
            string memory notes,
            uint256 timestamp
        )
    {
        require(index < productStages[productId].length, "Stage does not exist!");
        Stage memory s = productStages[productId][index];
        return (s.stageName, s.actor, s.location, s.notes, s.timestamp);
    }

    // 5. Get product details
    function getProduct(string memory productId)
        public view returns (
            string memory name,
            string memory origin,
            address registeredBy
        )
    {
        require(products[productId].exists, "Product does not exist!");
        Product memory p = products[productId];
        return (p.name, p.origin, p.registeredBy);
    }
}