import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!email || !password) return setError("Please fill in all fields");
    setLoading(true); setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (e) {
      setError(e.message.replace("Firebase: ", "").replace(" (auth/invalid-credential).", "Invalid email or password.").replace(" (auth/email-already-in-use).", "Email already registered.").replace(" (auth/weak-password).", "Password must be 6+ characters."));
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .auth-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .auth-card {
          background: #fff; border-radius: 24px;
          box-shadow: 0 24px 64px #6366f118, 0 4px 20px #0000000a;
          width: 100%; max-width: 420px;
          overflow: hidden;
        }
        .auth-top {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          padding: 36px 36px 32px; text-align: center; color: #fff;
        }
        .auth-logo { font-size: 36px; margin-bottom: 10px; }
        .auth-brand { font-size: 24px; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px; }
        .auth-sub { font-size: 13px; opacity: 0.8; }
        .auth-body { padding: 32px 36px; }
        .auth-tabs {
          display: flex; background: #f8fafc; border-radius: 10px;
          padding: 4px; margin-bottom: 28px;
        }
        .auth-tab {
          flex: 1; padding: 9px; text-align: center;
          font-size: 14px; font-weight: 600; cursor: pointer;
          border-radius: 8px; transition: all 0.2s; color: #94a3b8;
        }
        .auth-tab.active { background: #fff; color: #6366f1; box-shadow: 0 2px 8px #0000000f; }
        .auth-field { margin-bottom: 16px; }
        .auth-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .auth-input {
          width: 100%; padding: 12px 16px;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 10px; font-family: inherit; font-size: 14px;
          color: #1e293b; outline: none; transition: all 0.2s;
        }
        .auth-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px #6366f115; }
        .auth-input::placeholder { color: #cbd5e1; }
        .auth-error {
          background: #fff5f5; border: 1px solid #fecaca;
          color: #dc2626; border-radius: 8px;
          padding: 10px 14px; font-size: 13px; margin-bottom: 16px;
        }
        .auth-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; border: none; border-radius: 12px;
          font-family: inherit; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 14px #6366f133; margin-bottom: 20px;
        }
        .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px #6366f144; }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          color: #94a3b8; font-size: 12px; margin-bottom: 16px;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }
        .auth-metamask {
          width: 100%; padding: 12px;
          background: #fff7ed; border: 1.5px solid #fed7aa;
          color: #c2410c; border-radius: 12px;
          font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-metamask:hover { background: #fff; border-color: #f97316; }
        .auth-footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px; }
        .auth-role-info {
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 10px; padding: 12px 16px;
          font-size: 12px; color: #16a34a; margin-bottom: 20px; line-height: 1.6;
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-top">
            <div className="auth-logo">⛓</div>
            <div className="auth-brand">ChainVault</div>
            <div className="auth-sub">Blockchain Supply Chain Tracker</div>
          </div>

          <div className="auth-body">
            <div className="auth-tabs">
              <div className={`auth-tab ${isLogin ? "active" : ""}`} onClick={() => { setIsLogin(true); setError(""); }}>Sign In</div>
              <div className={`auth-tab ${!isLogin ? "active" : ""}`} onClick={() => { setIsLogin(false); setError(""); }}>Sign Up</div>
            </div>

            <div className="auth-role-info">
              👁️ <strong>Viewers</strong> sign in with email to trace products<br />
              🔑 <strong>Admins</strong> connect MetaMask to register & manage
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input className="auth-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()} />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input className="auth-input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()} />
            </div>

            <button className="auth-btn" onClick={handle} disabled={loading}>
              {loading ? "⏳ Please wait..." : isLogin ? "Sign In →" : "Create Account →"}
            </button>

            <div className="auth-divider">or continue as admin</div>

            <button className="auth-metamask" onClick={onLogin}>
              🦊 Connect with MetaMask (Admin)
            </button>

            <div className="auth-footer">
              Secured by Firebase · Data on Ethereum Blockchain
            </div>
          </div>
        </div>
      </div>
    </>
  );
}