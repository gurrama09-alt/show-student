import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="nav">
      <Link to="/" className="brand">Showcase</Link>
      <nav>
        <NavLink to="/">Projects</NavLink>
        {user && <NavLink to="/dashboard">My projects</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {user ? (
          <>
            <span className="muted who">{user.name}</span>
            <button className="btn ghost" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <Link to="/register" className="btn">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
