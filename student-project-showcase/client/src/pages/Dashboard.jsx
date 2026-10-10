import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ProjectRow from '../components/ProjectRow';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api('/projects/mine').then(setProjects).catch((e) => setError(e.message)); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await api(`/projects/${id}`, { method: 'DELETE' });
      setProjects((list) => list.filter((p) => p._id !== id));
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="head">
        <div>
          <h1>My projects</h1>
          <p className="muted">Signed in as {user.name}</p>
        </div>
        <Link className="btn" to="/projects/new">Publish a project</Link>
      </div>
      {error && <p className="error">{error}</p>}
      {projects === null && !error && <p className="muted">Loading…</p>}
      {projects?.length === 0 && <p className="empty">You haven't published anything yet. Add your first project to show it on the homepage.</p>}
      <div className="list">
        {projects?.map((p) => (
          <ProjectRow
            key={p._id}
            project={p}
            actions={
              <>
                <Link to={`/projects/${p._id}/edit`}>Edit</Link>
                <button className="link danger-text" onClick={() => remove(p._id)}>Delete</button>
              </>
            }
          />
        ))}
      </div>
    </>
  );
}
