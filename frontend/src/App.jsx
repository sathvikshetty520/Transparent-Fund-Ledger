import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- INTERACTIVE BACKGROUND CANVAS (AMBER THEME) ---
function CyberLedgerCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.12 - dist / 1000})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#f59e0b';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 15%, #18181b 0%, #09090b 100%)',
      }}
    />
  );
}

// --- NAVBAR (RIGHT ALIGNED AUTH & NO EMOJIS) ---
function Navbar({ user, onLogout }) {
  const role = user?.role;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 3rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxSizing: 'border-box',
      }}
    >
      {/* Left Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <Link to="/" style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f59e0b', textDecoration: 'none', letterSpacing: '0.05em' }}>
          FUNDLEDGER
        </Link>
        <div style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#f4f4f5', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>Explorer</Link>
          
          {user && (role === 'CONTRIBUTOR' || role === 'ADMIN') && (
            <Link to="/donate" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
              Contribute
            </Link>
          )}

          {user && (role === 'ORGANIZER' || role === 'ADMIN') && (
            <Link to="/expense" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
              Log Expense
            </Link>
          )}

          {user && role === 'ADMIN' && (
            <Link to="/admin" style={{ color: '#f87171', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Right Auth Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                color: '#fbbf24',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.05em'
              }}
            >
              {user.role}
            </span>
            <span style={{ color: '#d4d4d8', fontSize: '0.9rem', fontWeight: '500' }}>{user.email}</span>
            <button
              onClick={onLogout}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <Link to="/login" style={{ color: '#d4d4d8', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
              Login
            </Link>
            <Link
              to="/register"
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.9rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '6px',
                boxShadow: '0 0 15px rgba(217, 119, 6, 0.3)'
              }}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
}

// --- PUBLIC EXPLORER VIEW ---
function PublicExplorer() {
  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '3.5rem 0' }}>
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem auto' }}>
        <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Cryptographic Fund Verification
        </span>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff', margin: '0.8rem 0', lineHeight: 1.2 }}>
          Immutable Audit Trails & Public Transparency
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Secure tracking of campaign contributions, fund allocations, and administrative block verifications.
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0 }}>Live Ledger Blocks</h3>
          <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>Live Sync Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {[
            { id: 'BLOCK-8921', type: 'DONATION', amount: '$5,000 USD', from: '0x3F...9a12', status: 'VERIFIED' },
            { id: 'BLOCK-8922', type: 'EXPENSE', amount: '$1,200 USD', from: 'Medical Relief Team', status: 'PENDING' },
            { id: 'BLOCK-8923', type: 'DONATION', amount: '$250 USD', from: '0x8A...3c44', status: 'VERIFIED' },
          ].map((block, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(9, 9, 11, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontSize: '0.8rem', fontWeight: '600' }}>
                <span>{block.id}</span>
                <span style={{ color: block.status === 'VERIFIED' ? '#10b981' : '#f59e0b' }}>{block.status}</span>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#fff', margin: '0.6rem 0' }}>{block.amount}</div>
              <div style={{ color: '#fbbf24', fontSize: '0.85rem' }}>{block.type} | {block.from}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- CONTRIBUTION VIEW (Contributor / Donor) ---
function DonateView({ user }) {
  const [amount, setAmount] = useState('');
  const [campaign, setCampaign] = useState('Medical Aid');
  const [submitted, setSubmitted] = useState(false);

  if (user && user.role !== 'CONTRIBUTOR' && user.role !== 'ADMIN') {
    return <div style={{ color: '#f87171', textAlign: 'center', marginTop: '4rem' }}>Access Restricted: Contributors and Admins only.</div>;
  }

  const handleDonate = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', margin: '4rem auto', padding: '2.5rem', backgroundColor: 'rgba(24, 24, 27, 0.8)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)', backdropFilter: 'blur(16px)' }}>
      <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.4rem' }}>Contribution Portal</h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Submit financial contributions directly to the verified ledger.</p>
      
      {submitted && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>Contribution recorded successfully.</div>}

      <form onSubmit={handleDonate} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Campaign Target</label>
          <select value={campaign} onChange={(e) => setCampaign(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
            <option value="Medical Aid">Medical Relief Fund</option>
            <option value="Education">Clean Water Initiative</option>
            <option value="Disaster Relief">Disaster Emergency Fund</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Amount (USD)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="250" required style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#d97706', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
          Submit Contribution
        </button>
      </form>
    </div>
  );
}

// --- EXPENSE VIEW (Organizer) ---
function ExpenseView({ user }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (user && user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
    return <div style={{ color: '#f87171', textAlign: 'center', marginTop: '4rem' }}>Access Restricted: Organizers and Admins only.</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', margin: '4rem auto', padding: '2.5rem', backgroundColor: 'rgba(24, 24, 27, 0.8)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)', backdropFilter: 'blur(16px)' }}>
      <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.4rem' }}>Expense Claim Logger</h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Submit campaign allocation requests for administrative review.</p>

      {submitted && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>Expense submitted for approval.</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Description</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Emergency Medical Supplies" required style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Amount (USD)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1200" required style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Receipt Reference URL</label>
          <input type="text" value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="https://secure-docs.io/receipt" required style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#d97706', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
          Submit Claim
        </button>
      </form>
    </div>
  );
}

// --- ADMIN PANEL (Admin Only) ---
function AdminView({ user }) {
  const [claims, setClaims] = useState([
    { id: 'EXP-101', title: 'Medical Relief Equipment', amount: '$1,200', organizer: 'org1@demo.com', status: 'PENDING' },
    { id: 'EXP-102', title: 'Transportation Logistics', amount: '$450', organizer: 'org2@demo.com', status: 'PENDING' },
  ]);

  if (user && user.role !== 'ADMIN') {
    return <div style={{ color: '#f87171', textAlign: 'center', marginTop: '4rem' }}>Access Restricted: Administrator privileges required.</div>;
  }

  const handleAction = (id, newStatus) => {
    setClaims(claims.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '3.5rem auto', padding: '2rem', backgroundColor: 'rgba(24, 24, 27, 0.8)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(16px)' }}>
      <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.4rem' }}>Admin Approval Dashboard</h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '2rem' }}>Review pending claims and commit verified blocks to the immutable ledger.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {claims.map((claim) => (
          <div key={claim.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', backgroundColor: '#09090b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: '700' }}>{claim.id} | {claim.organizer}</div>
              <div style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '600', margin: '0.2rem 0' }}>{claim.title}</div>
              <div style={{ color: '#fbbf24', fontSize: '1.15rem', fontWeight: '700' }}>{claim.amount}</div>
            </div>

            {claim.status === 'PENDING' ? (
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={() => handleAction(claim.id, 'APPROVED')} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  Approve
                </button>
                <button onClick={() => handleAction(claim.id, 'REJECTED')} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  Reject
                </button>
              </div>
            ) : (
              <span style={{ color: claim.status === 'APPROVED' ? '#10b981' : '#f87171', fontWeight: '700', fontSize: '0.85rem' }}>
                {claim.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- AUTH FORM ---
function AuthForm({ type, onLogin }) {
  const isLogin = type === 'login';
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CONTRIBUTOR');

  const handleSubmit = (e) => {
    e.preventDefault();
    const activeEmail = email || `${role.toLowerCase()}1@demo.com`;
    onLogin({ email: activeEmail, role });

    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'ORGANIZER') navigate('/expense');
    else navigate('/donate');
  };

  return (
    <div style={{ position: 'relative', zIndex: '1', maxWidth: '400px', margin: '4.5rem auto', padding: '2.5rem', borderRadius: '12px', backgroundColor: 'rgba(24, 24, 27, 0.85)', border: '1px solid rgba(245, 158, 11, 0.25)', backdropFilter: 'blur(16px)' }}>
      <h2 style={{ fontSize: '1.6rem', color: '#fff', textAlign: 'center', fontWeight: '800', marginBottom: '0.4rem' }}>
        {isLogin ? 'Sign In' : 'Create Account'}
      </h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.8rem' }}>
        Select your role permission level
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label style={{ display: 'block', color: '#fbbf24', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>
            System Role
          </label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#09090b', color: '#fff', outline: 'none' }}>
            <option value="CONTRIBUTOR">CONTRIBUTOR (Donor)</option>
            <option value="ORGANIZER">ORGANIZER (Campaign Creator)</option>
            <option value="ADMIN">ADMIN (Approver)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`${role.toLowerCase()}1@demo.com`} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#09090b', color: '#fff', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', color: '#d4d4d8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#09090b', color: '#fff', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" style={{ marginTop: '0.5rem', padding: '0.85rem', borderRadius: '6px', border: 'none', backgroundColor: '#d97706', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
          {isLogin ? `Sign In as ${role}` : `Register as ${role}`}
        </button>
      </form>
    </div>
  );
}

// --- APP ROUTER ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <BrowserRouter>
      <div style={{ backgroundColor: '#09090b', minHeight: '100vh', color: '#f4f4f5', position: 'relative', overflowX: 'hidden', fontFamily: 'Inter, sans-serif' }}>
        <CyberLedgerCanvas />
        <Navbar user={currentUser} onLogout={() => setCurrentUser(null)} />

        <main style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<PublicExplorer />} />
            <Route path="/login" element={<AuthForm type="login" onLogin={(u) => setCurrentUser(u)} />} />
            <Route path="/register" element={<AuthForm type="register" onLogin={(u) => setCurrentUser(u)} />} />
            
            {/* Secured Role Routes */}
            <Route path="/donate" element={currentUser ? <DonateView user={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/expense" element={currentUser ? <ExpenseView user={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={currentUser ? <AdminView user={currentUser} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}