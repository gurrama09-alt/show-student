import { Link } from 'react-router-dom';

export default function ProjectRow({ project, actions }) {
  const p = project;
  return (
    <article className="row">
      <div className="row-main">
        <h3>
          <Link to={`/projects/${p._id}`}>{p.title}</Link>
          {p.featured && <span className="flag">Featured</span>}
          {p.status === 'hidden' && <span className="flag off">Hidden</span>}
        </h3>
        {p.student?.name && (
          <p className="muted">
            {p.student.name}{p.student.department ? `, ${p.student.department}` : ''}
          </p>
        )}
        <p className="desc">{p.description}</p>
        <ul className="chips">{p.technologies.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
      <div className="row-side">
        <a href={p.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
        {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer">Live demo</a>}
        {actions}
      </div>
    </article>
  );
}
