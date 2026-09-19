import { NavLink } from 'react-router-dom';

export default function AdminTabs() {
  return (
    <nav className="tabs" aria-label="Admin sections">
      <NavLink to="/admin" end>
        Overview
      </NavLink>
      <NavLink to="/admin/campaigns">Campaigns</NavLink>
      <NavLink to="/admin/allocations">Allocations</NavLink>
      <NavLink to="/admin/expenses">Expenses</NavLink>
    </nav>
  );
}
