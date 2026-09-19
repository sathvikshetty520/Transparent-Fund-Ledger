// Page title with the double "ledger rule" underneath. Buttons can go in children.
export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        {children && <div className="page-header-actions">{children}</div>}
      </div>
      <div className="ledger-rule" />
    </header>
  );
}
