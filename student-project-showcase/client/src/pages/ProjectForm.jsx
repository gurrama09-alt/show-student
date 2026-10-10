import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

const empty = { title: '', description: '', technologies: '', githubUrl: '', liveUrl: '' };

export default function ProjectForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (!editing) return;
    api(`/projects/${id}`)
      .then((p) => setForm({ ...p, technologies: p.technologies.join(', '), liveUrl: p.liveUrl || '' }))
      .catch((e) => setError(e.message));
  }, [id, editing]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { title, description, technologies, githubUrl, liveUrl } = form;
      const body = { title, description, technologies, githubUrl, liveUrl };
      const saved = await api(editing ? `/projects/${id}` : '/projects', {
        method: editing ? 'PUT' : 'POST',
        body,
      });
      navigate(`/projects/${saved._id}`);
    } catch (err) { setError(err.message); setSaving(false); }
  };

  return (
    <form className="card-form wide" onSubmit={submit}>
      <h1>{editing ? 'Edit project' : 'Publish a project'}</h1>
      {error && <p className="error">{error}</p>}
      <label>Title<input required maxLength={100} value={form.title} onChange={set('title')} /></label>
      <label>Description
        <textarea required rows={6} maxLength={2000} value={form.description} onChange={set('description')}
          placeholder="What does it do, and who is it for?" />
      </label>
      <label>Technologies
        <input required value={form.technologies} onChange={set('technologies')} placeholder="React, Node.js, MongoDB" />
        <small className="muted">Separate with commas.</small>
      </label>
      <label>GitHub URL<input type="url" required value={form.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/you/project" /></label>
      <label>Live demo URL (optional)<input type="url" value={form.liveUrl} onChange={set('liveUrl')} /></label>
      <button className="btn" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Publish project'}</button>
    </form>
  );
}
