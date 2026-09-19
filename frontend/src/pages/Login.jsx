import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import Button from '../components/Button';
import Card from '../components/Card';
import Alert from '../components/Alert';

export const homeFor = (role) => (role === 'ADMIN' ? '/admin' : role === 'ORGANIZER' ? '/organizer/campaigns' : '/campaigns');

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(location.state?.from || homeFor(user.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed.'));
      setBusy(false);
    }
  }

  return (
    <div className="container page narrow">
      <Card>
        <h1 className="h2">Log in</h1>
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <Button type="submit" loading={busy} className="btn-block">
            Log in
          </Button>
        </form>
        <p className="muted small">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
