import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

// Links that depend on who is logged in
function roleLinks(role) {
  if (role === 'CONTRIBUTOR') return [{ to: '/my-donations', label: 'My donations' }];
  if (role === 'ORGANIZER')
    return [
      { to: '/organizer/campaigns', label: 'My campaigns' },
      { to: '/organizer/campaigns/new', label: 'New campaign' },
    ];
  if (role === 'ADMIN') return [{ to: '/admin', label: 'Admin' }];
  return [];
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: '/campaigns', label: 'Campaigns' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/audit', label: 'Audit' },
    { to: '/verify', label: 'Verify' },
    ...roleLinks(user?.role),
  ];

  const close = () => setOpen(false);

  function handleLogout() {
    logout();
    close();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">₹</span>
          <span>Transparent Fund Ledger</span>
        </Link>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
          {open ? '✕' : '☰'}
        </button>

        <nav className={`nav ${open ? 'nav-open' : ''}`}>
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === '/admin'} onClick={close}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="nav-user">
            {user ? (
              <>
                <span className="nav-name">
                  {user.name} <small>{user.role.toLowerCase()}</small>
                </span>
                <Button variant="ghost-light" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost-light" size="sm" onClick={close}>
                  Log in
                </Button>
                <Button to="/register" variant="accent" size="sm" onClick={close}>
                  Register
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
