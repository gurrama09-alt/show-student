import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { await register(form); navigate('/dashboard'); }
    catch (err) { setError(err.message); }
  };

  return (
    <form className="card-form" onSubmit={submit}>
      <h1>Create your account</h1>
      {error && <p className="error">{error}</p>}
      <label>Full name<input required value={form.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
      <label>Department<input value={form.department} onChange={set('department')} placeholder="e.g. Computer Science" /></label>
      <label>Password<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
      <button className="btn">Create account</button>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
