import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Admin() {
  const [tab, setTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/projects/admin/all'), api('/users')])
      .then(([p, u]) => { setProjects(p); setUsers(u); })
      .catch((e) => setError(e.message));
  }, []);

  const moderate = async (p, patch) => {
    try {
      const updated = await api(`/projects/${p._id}/moderate`, { method: 'PATCH', body: patch });
      setProjects((list) => list.map((x) => (x._id === p._id ? { ...x, ...updated, student: x.student } : x)));
    } catch (e) { setError(e.message); }
  };

  const removeProject = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try { await api(`/projects/${p._id}`, { method: 'DELETE' }); setProjects((l) => l.filter((x) => x._id !== p._id)); }
    catch (e) { setError(e.message); }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Delete ${u.name} and all of their projects?`)) return;
    try {
      await api(`/users/${u._id}`, { method: 'DELETE' });
      setUsers((l) => l.filter((x) => x._id !== u._id));
      setProjects((l) => l.filter((x) => x.student?._id !== u._id));
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <h1>Admin</h1>
      <p className="muted">{projects.length} projects · {users.length} accounts</p>
      <div className="tabs">
        <button className={tab === 'projects' ? 'on' : ''} onClick={() => setTab('projects')}>Projects</button>
        <button className={tab === 'users' ? 'on' : ''} onClick={() => setTab('users')}>Students</button>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="scroll">
        {tab === 'projects' ? (
          <table>
            <thead><tr><th>Project</th><th>Student</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td><Link to={`/projects/${p._id}`}>{p.title}</Link></td>
                  <td>{p.student?.name}</td>
                  <td>{p.status}{p.featured ? ', featured' : ''}</td>
                  <td className="acts">
                    <button className="link" onClick={() => moderate(p, { status: p.status === 'published' ? 'hidden' : 'published' })}>
                      {p.status === 'published' ? 'Hide' : 'Publish'}
                    </button>
                    <button className="link" onClick={() => moderate(p, { featured: !p.featured })}>
                      {p.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button className="link danger-text" onClick={() => removeProject(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Projects</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.projectCount}</td>
                  <td className="acts">
                    {u.role !== 'admin' && <button className="link danger-text" onClick={() => removeUser(u)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
