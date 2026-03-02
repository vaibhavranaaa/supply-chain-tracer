import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import App from "./App";
import AuthPage from "./AuthPage";

export default function Root() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (checking) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4ff", fontFamily: "sans-serif", color: "#6366f1", fontSize: "18px", fontWeight: "700" }}>
      ⛓ Loading ChainVault...
    </div>
  );

  if (!user) return <AuthPage onLogin={() => setUser({ email: "metamask" })} />;

  return <App user={user} onLogout={handleLogout} />;
}