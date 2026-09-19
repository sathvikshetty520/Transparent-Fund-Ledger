import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          <strong>Transparent Fund Ledger</strong>
          <br />
          Donations, allocations and expenses, all in the open.
        </p>
        <ul>
          <li>
            <Link to="/campaigns">Campaigns</Link>
          </li>
          <li>
            <Link to="/audit">Audit explorer</Link>
          </li>
          <li>
            <Link to="/verify">Verify ledger</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
