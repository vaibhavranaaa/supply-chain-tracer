# ⛓ ChainVault — Blockchain Supply Chain Tracer

A full-stack decentralized application (dApp) that tracks products across their entire supply chain journey using the Ethereum blockchain. Every checkpoint is permanently recorded, tamper-proof, and publicly verifiable.
--

## 🚀 Live Demo

> Contract deployed on Sepolia Testnet  
> **Contract Address:** `0x8e1034e1CD228DB6a028c3f9F4dA7ba015a67835`  
> 🔍 [View on Etherscan](https://sepolia.etherscan.io/address/0x8e1034e1CD228DB6a028c3f9F4dA7ba015a67835)
> LIVE DEMO: https://supply-chain-tracer.vercel.app

---

## ✨ Features

- 📦 **Register Products** — Add any product to the blockchain with a unique ID, name, and origin
- ➕ **Add Stages** — Log supply chain checkpoints (Harvest → Export → Customs → Retail)
- 🔍 **Trace Products** — View the complete journey of any product by ID
- 🔒 **Role-Based Access** — Email users can only trace; MetaMask admins can register and manage
- 🦊 **MetaMask Integration** — Connect wallet to sign blockchain transactions
- 🔐 **Firebase Authentication** — Email/password login for viewers
- ✅ **On-chain Verification** — Every stage is cryptographically verified and immutable

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.24 |
| Blockchain Network | Ethereum Sepolia Testnet |
| Dev Framework | Hardhat 2.22 |
| Frontend | React + Vite |
| Blockchain Connection | ethers.js |
| Authentication | Firebase Auth |
| Wallet | MetaMask |
| Contract Library | OpenZeppelin |

---

## 📁 Project Structure

```
BlockChain/
├── BlockChainProject/          # Smart contract
│   ├── contracts/
│   │   └── SupplyChain.sol     # Main smart contract
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   ├── hardhat.config.js       # Hardhat configuration
│   └── .env                    # 🔴 Never commit this!
│
└── frontend/                   # React frontend
    ├── src/
    │   ├── App.jsx             # Main app with UI
    │   ├── AuthPage.jsx        # Login/signup page
    │   ├── Root.jsx            # Auth wrapper
    │   ├── firebase.js         # Firebase config
    │   └── contractConfig.js   # Contract ABI & address
    └── vite.config.js
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Alchemy account (free)
- Firebase account (free)

### 1. Clone the repo

```bash
git clone https://github.com/vaibhavranaaa/supply-chain-tracer.git
cd supply-chain-tracer
```

### 2. Set up Smart Contract

```bash
cd BlockChainProject
npm install
```

Create a `.env` file:
```
ALCHEMY_URL=your_sepolia_alchemy_url
PRIVATE_KEY=your_metamask_private_key
```

Compile and deploy:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Set up Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Update `src/contractConfig.js` with your deployed contract address.

---

## 📜 Smart Contract

The `SupplyChain.sol` contract provides:

```solidity
// Register a new product
function registerProduct(string productId, string name, string origin) public

// Add a supply chain stage
function addStage(string productId, string stageName, string actor, string location, string notes) public

// Get product details
function getProduct(string productId) public view returns (...)

// Get stage count
function getStageCount(string productId) public view returns (uint256)

// Get specific stage
function getStage(string productId, uint256 index) public view returns (...)
```

---

## 🔐 Authentication & Roles

| Role | Login Method | Permissions |
|---|---|---|
| Viewer | Email + Password (Firebase) | Trace products only |
| Admin | MetaMask Wallet | Register products, add stages, trace |

---

## 🧪 How to Test

1. Connect MetaMask (Sepolia network)
2. Register a product: `COFFEE001` / `Organic Coffee` / `Ethiopia`
3. Add stages: `HARVEST`, `EXPORT`, `RETAIL`
4. Switch to Trace tab → enter `COFFEE001` → see full journey!

---

## 🔒 Security Notes

- Never commit your `.env` file
- Never share your MetaMask private key
- This project is on **testnet** — do not use real ETH

---

## 🗺️ Roadmap

- [ ] QR code generation per product
- [ ] IPFS document storage (certificates, invoices)
- [ ] Role-based smart contract access (OpenZeppelin AccessControl)
- [ ] Deploy to Polygon mainnet (lower gas fees)
- [ ] Mobile app

---

## 👨‍💻 Author

**Vaibhav Rana**  
Built with ❤️ using Ethereum, React & Firebase

---

## 📄 License

MIT License — feel free to use and modify!
