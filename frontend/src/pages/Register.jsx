import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { homeFor } from './Login';
import Button from '../components/Button';
import Card from '../components/Card';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CONTRIBUTOR' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    setBusy(true);
    setError('');
    try {
      // Only CONTRIBUTOR and ORGANIZER can be picked here. Admins are not self-registered.
      const user = await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Registration failed.'));
      setBusy(false);
    }
  }

  return (
    <div className="container page narrow">
      <Card>
        <h1 className="h2">Create an account</h1>
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required autoComplete="name" value={form.name} onChange={update} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" value={form.email} onChange={update} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="new-password" value={form.password} onChange={update} />
          </div>
          <div className="field">
            <label htmlFor="role">I want to</label>
            <select id="role" name="role" value={form.role} onChange={update}>
              <option value="CONTRIBUTOR">Donate to campaigns</option>
              <option value="ORGANIZER">Run campaigns</option>
            </select>
          </div>
          <Button type="submit" loading={busy} className="btn-block">
            Create account
          </Button>
        </form>
        <p className="muted small">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
