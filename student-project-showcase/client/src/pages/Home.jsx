import { useEffect, useState } from 'react';
import { api } from '../api';
import ProjectRow from '../components/ProjectRow';

export default function Home() {
  const [data, setData] = useState({ projects: [], total: 0, pages: 1 });
  const [techs, setTechs] = useState([]);
  const [q, setQ] = useState('');
  const [tech, setTech] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { api('/projects/meta/technologies').then(setTechs).catch(() => {}); }, []);

  // Debounced search so the API isn't hit on every keystroke
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams({ page, ...(q && { q }), ...(tech && { tech }) });
      api(`/projects?${params}`)
        .then((d) => { setData(d); setError(''); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, tech, page]);

  return (
    <>
      <section className="hero">
        <h1>What students are building</h1>
        <p className="muted">Browse projects, see the stack behind them, and jump straight to the code.</p>
        <div className="filters">
          <input
            placeholder="Search by title, description or technology"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            aria-label="Search projects"
          />
          <select value={tech} onChange={(e) => { setTech(e.target.value); setPage(1); }} aria-label="Filter by technology">
            <option value="">All technologies</option>
            {techs.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </section>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading projects…</p>}
      {!loading && !error && data.projects.length === 0 && (
        <p className="empty">No projects match your search. Try a different keyword or clear the filter.</p>
      )}
      <div className="list">
        {data.projects.map((p) => <ProjectRow key={p._id} project={p} />)}
      </div>

      {data.pages > 1 && (
        <div className="pager">
          <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted">Page {data.page} of {data.pages}</span>
          <button className="btn ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
