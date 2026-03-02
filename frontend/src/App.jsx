import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";

const STAGE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#3b82f6", "#f59e0b"];

const STAGE_ICONS = {
  HARVEST: "🌿", PROCESSING: "⚙️", EXPORT: "🚢", CUSTOMS: "🛃",
  WAREHOUSE: "🏭", RETAIL: "🏪", IMPORT: "📥", TRANSPORT: "🚛",
  MANUFACTURE: "🔧", QUALITY: "✅", PACKAGING: "📦", DEFAULT: "📍"
};

const getIcon = (name) => STAGE_ICONS[name?.toUpperCase()] || STAGE_ICONS.DEFAULT;

const TABS = [
  { id: "trace",    icon: "🔍", label: "Trace Product", adminOnly: false },
  { id: "register", icon: "📦", label: "Register",      adminOnly: true  },
  { id: "stage",    icon: "➕", label: "Add Stage",     adminOnly: true  },
];

export default function App({ user, onLogout }) {
  const isAdmin = user?.email === "admin";

  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [activeTab, setActiveTab] = useState("trace");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const [regId, setRegId] = useState("");
  const [regName, setRegName] = useState("");
  const [regOrigin, setRegOrigin] = useState("");

  const [stageId, setStageId] = useState("");
  const [stageName, setStageName] = useState("");
  const [stageActor, setStageActor] = useState("");
  const [stageLocation, setStageLocation] = useState("");
  const [stageNotes, setStageNotes] = useState("");

  const [traceId, setTraceId] = useState("");
  const [traceResult, setTraceResult] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return showToast("MetaMask not found! Please install it.", "error");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const ct = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setAccount(addr);
      setContract(ct);
      showToast("Wallet connected successfully! 🎉");
    } catch (e) {
      showToast(e.message.slice(0, 80), "error");
    }
  };

  const registerProduct = async () => {
    if (!contract) return showToast("Please connect your wallet first!", "error");
    if (!regId || !regName || !regOrigin) return showToast("Please fill in all fields", "error");
    try {
      setLoading(true);
      showToast("Sending transaction...", "loading");
      const tx = await contract.registerProduct(regId, regName, regOrigin);
      await tx.wait();
      showToast(`"${regName}" registered on blockchain! 🎉`);
      setRegId(""); setRegName(""); setRegOrigin("");
    } catch (e) {
      showToast(e.message.slice(0, 100), "error");
    }
    setLoading(false);
  };

  const addStage = async () => {
    if (!contract) return showToast("Please connect your wallet first!", "error");
    if (!stageId || !stageName) return showToast("Product ID and Stage Name are required", "error");
    try {
      setLoading(true);
      showToast("Adding stage to blockchain...", "loading");
      const tx = await contract.addStage(stageId, stageName, stageActor, stageLocation, stageNotes);
      await tx.wait();
      showToast(`Stage "${stageName}" added successfully! ✅`);
      setStageId(""); setStageName(""); setStageActor(""); setStageLocation(""); setStageNotes("");
    } catch (e) {
      showToast(e.message.slice(0, 100), "error");
    }
    setLoading(false);
  };

  const traceProduct = async () => {
    if (!contract) return showToast("Please connect your wallet first!", "error");
    if (!traceId) return showToast("Please enter a Product ID", "error");
    try {
      setLoading(true);
      setTraceResult(null);
      const product = await contract.getProduct(traceId);
      const count = await contract.getStageCount(traceId);
      const stages = [];
      for (let i = 0; i < count; i++) {
        const s = await contract.getStage(traceId, i);
        stages.push({
          stageName: s[0], actor: s[1], location: s[2], notes: s[3],
          timestamp: new Date(Number(s[4]) * 1000).toLocaleString()
        });
      }
      setTraceResult({ name: product[0], origin: product[1], registeredBy: product[2], stages });
      showToast(`Found ${stages.length} checkpoint${stages.length !== 1 ? "s" : ""} 🔍`);
    } catch (e) {
      showToast("Product not found. Check the ID and try again.", "error");
      setTraceResult(null);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f4ff; color: #1e293b; min-height: 100vh; }
        .app { min-height: 100vh; width: 100%; background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%); }
        .nav { width: 100%; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid #e2e8f0; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; height: 64px; position: sticky; top: 0; z-index: 100; }
        .nav-brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; color: #1e293b; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-badge { font-size: 11px; font-weight: 600; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 3px 10px; border-radius: 20px; }
        .nav-user { font-size: 13px; color: #64748b; font-weight: 500; }
        .nav-signout { padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; font-size: 13px; font-weight: 600; color: #64748b; font-family: inherit; transition: all 0.2s; }
        .nav-signout:hover { border-color: #ef4444; color: #ef4444; }
        .wallet-btn { display: flex; align-items: center; gap: 8px; padding: 9px 20px; border-radius: 10px; background: #6366f1; color: #fff; border: none; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 14px #6366f133; }
        .wallet-btn:hover { background: #4f46e5; transform: translateY(-1px); }
        .wallet-connected { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; font-size: 13px; font-weight: 600; color: #16a34a; }
        .green-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hero { width: 100%; text-align: center; padding: 56px 24px 36px; }
        .hero-inner { max-width: 680px; margin: 0 auto; }
        .hero-pill { display: inline-flex; align-items: center; gap: 6px; background: #ede9fe; color: #7c3aed; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .hero h1 { font-size: clamp(26px, 5vw, 42px); font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 16px; }
        .hero h1 span { background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 16px; color: #64748b; max-width: 480px; margin: 0 auto 32px; line-height: 1.7; }
        .stats { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; margin-bottom: 44px; }
        .stat-num { font-size: 22px; font-weight: 800; color: #1e293b; }
        .stat-label { font-size: 12px; color: #94a3b8; margin-top: 2px; }
        .main-card { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 20px; box-shadow: 0 20px 60px #6366f115, 0 4px 20px #0000000a; overflow: hidden; margin-bottom: 40px; }
        .tab-bar { display: flex; border-bottom: 1px solid #f1f5f9; padding: 0 8px; }
        .tab-item { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 18px 12px; cursor: pointer; font-size: 14px; font-weight: 600; color: #94a3b8; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; }
        .tab-item:hover { color: #6366f1; }
        .tab-item.active { color: #6366f1; border-bottom-color: #6366f1; }
        .tab-item.locked { opacity: 0.45; cursor: not-allowed; }
        .tab-item.locked:hover { color: #94a3b8; }
        .lock-badge { font-size: 10px; background: #fef3c7; color: #d97706; border: 1px solid #fde68a; padding: 1px 6px; border-radius: 20px; }
        .form-area { padding: 32px; }
        .form-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .form-desc { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
        .admin-only-msg { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; text-align: center; }
        .admin-only-msg h3 { font-size: 16px; font-weight: 700; color: #c2410c; margin-bottom: 6px; }
        .admin-only-msg p { font-size: 13px; color: #9a3412; }
        .field { margin-bottom: 18px; }
        .field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 7px; }
        .req { color: #ef4444; margin-left: 2px; }
        .input { width: 100%; padding: 12px 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; color: #1e293b; font-family: inherit; font-size: 14px; transition: all 0.2s; outline: none; }
        .input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px #6366f115; }
        .input::placeholder { color: #cbd5e1; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .submit-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 12px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: all 0.2s; box-shadow: 0 4px 14px #6366f133; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px #6366f144; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .divider { height: 1px; background: #f1f5f9; margin: 28px 0; }
        .product-banner { background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 14px; padding: 24px; color: #fff; margin-bottom: 24px; position: relative; overflow: hidden; }
        .product-banner::after { content: '⛓'; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); font-size: 60px; opacity: 0.15; }
        .product-banner-label { font-size: 11px; font-weight: 600; opacity: 0.7; letter-spacing: 2px; margin-bottom: 6px; }
        .product-banner-name { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
        .product-banner-meta { display: flex; gap: 20px; flex-wrap: wrap; font-size: 13px; opacity: 0.85; }
        .timeline-header { font-size: 13px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
        .timeline-item { display: flex; gap: 16px; margin-bottom: 4px; animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .timeline-left { display: flex; flex-direction: column; align-items: center; width: 44px; flex-shrink: 0; }
        .timeline-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .timeline-connector { flex: 1; width: 2px; background: #f1f5f9; min-height: 16px; margin: 4px 0; }
        .timeline-body { flex: 1; padding-bottom: 20px; }
        .timeline-card { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; transition: all 0.2s; }
        .timeline-card:hover { border-color: #e0e7ff; box-shadow: 0 4px 16px #6366f10a; }
        .timeline-stage-name { font-size: 15px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .verified-badge { font-size: 10px; font-weight: 700; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 20px; }
        .timeline-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 4px; font-size: 13px; color: #64748b; }
        .timeline-notes { font-size: 13px; color: #475569; font-style: italic; margin-top: 6px; }
        .timeline-time { font-size: 11px; color: #94a3b8; margin-top: 8px; }
        .features { max-width: 680px; margin: 0 auto; padding: 0 24px 40px; }
        .features-title { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 8px; text-align: center; }
        .features-sub { font-size: 14px; color: #64748b; text-align: center; margin-bottom: 24px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; }
        .feature-card { background: #fff; border-radius: 16px; padding: 22px 20px; box-shadow: 0 4px 20px #0000000a; border: 1px solid #f1f5f9; transition: all 0.2s; }
        .feature-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 14px; }
        .feature-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .feature-desc { font-size: 13px; color: #64748b; line-height: 1.6; }
        .footer { text-align: center; padding: 24px; border-top: 1px solid #e2e8f0; background: rgba(255,255,255,0.5); font-size: 13px; color: #94a3b8; }
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 32px #0000001a; animation: slideUp 0.3s ease; z-index: 1000; max-width: 360px; background: #fff; }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .toast-success { border-left: 4px solid #22c55e; color: #15803d; }
        .toast-error { border-left: 4px solid #ef4444; color: #b91c1c; }
        .toast-loading { border-left: 4px solid #6366f1; color: #4338ca; }
        @media (max-width: 600px) { .field-row { grid-template-columns: 1fr; } .stats { gap: 20px; } .form-area { padding: 20px; } .hero { padding: 36px 16px 20px; } .nav { padding: 0 16px; } }
      `}</style>

      <div className="app">

        {/* Navbar */}
        <nav className="nav">
          <div className="nav-brand">⛓ ChainVault</div>
          <div className="nav-right">
            {!isAdmin && user?.email && (
              <div className="nav-user">👤 {user.email}</div>
            )}
            {isAdmin && (
              !account ? (
                <button className="wallet-btn" onClick={connectWallet}>🦊 Connect Wallet</button>
              ) : (
                <div className="wallet-connected">
                  <div className="green-dot" />
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              )
            )}
            <div className="nav-badge">● Sepolia</div>
            <button className="nav-signout" onClick={onLogout}>Sign Out</button>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-pill">⛓ Powered by Ethereum</div>
            <h1>Track Every Step of Your<br /><span>Supply Chain</span></h1>
            <p>Register products, log checkpoints, and trace the complete journey — all stored permanently on the blockchain.</p>
            <div className="stats">
              <div><div className="stat-num">100%</div><div className="stat-label">Tamper-proof</div></div>
              <div><div className="stat-num">Real-time</div><div className="stat-label">On-chain updates</div></div>
              <div><div className="stat-num">∞</div><div className="stat-label">Permanent records</div></div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div style={{ padding: "0 24px" }}>
          <div className="main-card">

            {/* Tab Bar */}
            <div className="tab-bar">
              {TABS.map(t => {
                const locked = t.adminOnly && !isAdmin;
                return (
                  <div key={t.id}
                    className={`tab-item ${activeTab === t.id ? "active" : ""} ${locked ? "locked" : ""}`}
                    onClick={() => {
                      if (locked) {
                        showToast("🔒 Admin only! Sign in with MetaMask to access this.", "error");
                        return;
                      }
                      setActiveTab(t.id);
                      setTraceResult(null);
                    }}>
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                    {locked && <span className="lock-badge">Admin</span>}
                  </div>
                );
              })}
            </div>

            <div className="form-area">

              {/* TRACE */}
              {activeTab === "trace" && (
                <>
                  <div className="form-title">🔍 Trace a Product</div>
                  <div className="form-desc">Enter a product ID to view its complete blockchain journey from origin to destination.</div>
                  <div className="field">
                    <label className="field-label">Product ID <span className="req">*</span></label>
                    <input className="input" placeholder="e.g. PROD001" value={traceId}
                      onChange={e => setTraceId(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && traceProduct()} />
                  </div>
                  <button className="submit-btn" onClick={traceProduct} disabled={loading}>
                    {loading ? "⏳ Searching blockchain..." : "🔍 Trace Product"}
                  </button>

                  {traceResult && (
                    <div style={{ marginTop: 28 }}>
                      <div className="divider" />
                      <div className="product-banner">
                        <div className="product-banner-label">PRODUCT VERIFIED ✓</div>
                        <div className="product-banner-name">{traceResult.name}</div>
                        <div className="product-banner-meta">
                          <span>📍 <strong>{traceResult.origin}</strong></span>
                          <span>🔗 <strong>{traceResult.stages.length} checkpoints</strong></span>
                          <span>👛 {traceResult.registeredBy.slice(0, 10)}...</span>
                        </div>
                      </div>
                      <div className="timeline-header">Supply Chain Journey</div>
                      {traceResult.stages.map((s, i) => (
                        <div className="timeline-item" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                          <div className="timeline-left">
                            <div className="timeline-icon" style={{ background: STAGE_COLORS[i % STAGE_COLORS.length] + "18" }}>
                              {getIcon(s.stageName)}
                            </div>
                            {i < traceResult.stages.length - 1 && <div className="timeline-connector" />}
                          </div>
                          <div className="timeline-body">
                            <div className="timeline-card">
                              <div className="timeline-stage-name">
                                {s.stageName}
                                <span className="verified-badge">✓ Verified</span>
                              </div>
                              <div className="timeline-meta">
                                {s.actor && <span>👤 {s.actor}</span>}
                                {s.location && <span>📍 {s.location}</span>}
                              </div>
                              {s.notes && <div className="timeline-notes">"{s.notes}"</div>}
                              <div className="timeline-time">🕐 {s.timestamp}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* REGISTER */}
              {activeTab === "register" && (
                isAdmin ? (
                  <>
                    <div className="form-title">📦 Register a Product</div>
                    <div className="form-desc">Add a new product to the blockchain. Once registered, it gets a permanent, immutable record.</div>
                    <div className="field">
                      <label className="field-label">Product ID <span className="req">*</span></label>
                      <input className="input" placeholder="Unique ID e.g. COFFEE001" value={regId} onChange={e => setRegId(e.target.value)} />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label className="field-label">Product Name <span className="req">*</span></label>
                        <input className="input" placeholder="e.g. Organic Arabica Coffee" value={regName} onChange={e => setRegName(e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="field-label">Origin <span className="req">*</span></label>
                        <input className="input" placeholder="e.g. Ethiopia" value={regOrigin} onChange={e => setRegOrigin(e.target.value)} />
                      </div>
                    </div>
                    <button className="submit-btn" onClick={registerProduct} disabled={loading}>
                      {loading ? "⏳ Writing to blockchain..." : "📦 Register Product"}
                    </button>
                  </>
                ) : (
                  <div className="admin-only-msg">
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                    <h3>Admin Access Required</h3>
                    <p>Connect with MetaMask to register products on the blockchain.</p>
                  </div>
                )
              )}

              {/* ADD STAGE */}
              {activeTab === "stage" && (
                isAdmin ? (
                  <>
                    <div className="form-title">➕ Add a Stage</div>
                    <div className="form-desc">Log a new checkpoint in the product's supply chain journey. Each stage is permanently recorded.</div>
                    <div className="field-row">
                      <div className="field">
                        <label className="field-label">Product ID <span className="req">*</span></label>
                        <input className="input" placeholder="e.g. COFFEE001" value={stageId} onChange={e => setStageId(e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="field-label">Stage Name <span className="req">*</span></label>
                        <input className="input" placeholder="e.g. HARVEST" value={stageName} onChange={e => setStageName(e.target.value)} />
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label className="field-label">Actor / Handler</label>
                        <input className="input" placeholder="e.g. Tadesse Farm Co-op" value={stageActor} onChange={e => setStageActor(e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="field-label">Location</label>
                        <input className="input" placeholder="e.g. Addis Ababa, Ethiopia" value={stageLocation} onChange={e => setStageLocation(e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Notes</label>
                      <input className="input" placeholder="e.g. Grade A certified, temperature at 18°C" value={stageNotes} onChange={e => setStageNotes(e.target.value)} />
                    </div>
                    <button className="submit-btn" onClick={addStage} disabled={loading}>
                      {loading ? "⏳ Writing to blockchain..." : "➕ Add Stage"}
                    </button>
                  </>
                ) : (
                  <div className="admin-only-msg">
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                    <h3>Admin Access Required</h3>
                    <p>Connect with MetaMask to add supply chain stages.</p>
                  </div>
                )
              )}

            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="features">
          <div className="features-title">Why blockchain for supply chain?</div>
          <div className="features-sub">Every record is permanent, transparent and impossible to fake.</div>
          <div className="features-grid">
            {[
              { icon: "🔒", title: "Tamper-Proof", desc: "Once written to blockchain, nobody can alter or delete it — ever.", color: "#6366f1" },
              { icon: "👁️", title: "Full Transparency", desc: "Anyone can verify the entire product journey with just a Product ID.", color: "#8b5cf6" },
              { icon: "⚡", title: "Real-time Updates", desc: "Each checkpoint is recorded instantly on-chain as it happens.", color: "#ec4899" },
              { icon: "🌍", title: "Decentralized", desc: "No single company controls the data. It lives on thousands of nodes.", color: "#f97316" },
              { icon: "📜", title: "Permanent Record", desc: "Records last forever on Ethereum. No data loss possible.", color: "#10b981" },
              { icon: "🤝", title: "No Middlemen", desc: "Smart contracts enforce rules automatically without third parties.", color: "#3b82f6" },
            ].map((f, i) => (
              <div key={i} className="feature-card"
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${f.color}22`; e.currentTarget.style.borderColor = f.color + "44"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
                <div className="feature-icon" style={{ background: f.color + "18" }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          Built on Ethereum · Contract: <span style={{ color: "#6366f1", fontWeight: 600 }}></span> · Sepolia Testnet
        </div>

        {/* Toast */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" && "✅"}
            {toast.type === "error" && "❌"}
            {toast.type === "loading" && "⏳"}
            {" "}{toast.msg}
          </div>
        )}

      </div>
    </>
  );
}