import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/projects/${id}`).then(setP).catch((e) => setError(e.message));
  }, [id]);

  const remove = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try { await api(`/projects/${id}`, { method: 'DELETE' }); navigate('/dashboard'); }
    catch (e) { setError(e.message); }
  };

  if (error) return <p className="error">{error}</p>;
  if (!p) return <p className="muted">Loading…</p>;

  return (
    <article className="detail">
      <Link to="/" className="muted">Back to all projects</Link>
      <h1>{p.title}</h1>
      <p className="muted">
        By {p.student?.name}{p.student?.department ? `, ${p.student.department}` : ''} · Published{' '}
        {new Date(p.createdAt).toLocaleDateString()}
      </p>
      <p className="long">{p.description}</p>
      <h2>Technologies</h2>
      <ul className="chips">{p.technologies.map((t) => <li key={t}>{t}</li>)}</ul>
      <div className="btn-row">
        <a className="btn" href={p.githubUrl} target="_blank" rel="noreferrer">View on GitHub</a>
        {p.liveUrl && <a className="btn ghost" href={p.liveUrl} target="_blank" rel="noreferrer">Open live demo</a>}
      </div>
      {p.canManage && (
        <div className="btn-row owner">
          <Link className="btn ghost" to={`/projects/${p._id}/edit`}>Edit project</Link>
          <button className="btn danger" onClick={remove}>Delete project</button>
        </div>
      )}
    </article>
  );
}
