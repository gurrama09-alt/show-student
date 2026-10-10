import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard'));
    } catch (err) { setError(err.message); }
  };

  return (
    <form className="card-form" onSubmit={submit}>
      <h1>Log in</h1>
      {error && <p className="error">{error}</p>}
      <label>Email
        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label>Password
        <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </label>
      <button className="btn">Log in</button>
      <p className="muted">New here? <Link to="/register">Create a student account</Link></p>
    </form>
  );
}
