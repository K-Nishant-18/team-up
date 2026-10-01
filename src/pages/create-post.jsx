import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Link2, Plus } from 'lucide-react';
import { PlatformShell } from '@/components/platform-shell';
import { api } from '@/lib/api';
const categories = [
    { label: 'Hackathon', value: 'Hackathon' },
    { label: 'Open source', value: 'OpenSource' },
    { label: 'Class project', value: 'ClassProject' },
    { label: 'Startup idea', value: 'StartupIdea' },
];
const modes = [
    { label: 'Online', value: 'online' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Offline', value: 'offline' },
];
export default function CreatePostPage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Hackathon');
    const [mode, setMode] = useState('online');
    const [deadline, setDeadline] = useState('');
    const [link, setLink] = useState('');
    const [roles, setRoles] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const roleNames = roles
                .split(',')
                .map((r) => r.trim())
                .filter(Boolean);
            await api.createPost({
                title,
                description,
                category,
                mode,
                deadline: deadline ? new Date(deadline).toISOString() : null,
                externalLink: link || null,
                rolesRequired: roleNames.map((roleName) => ({ roleName, count: 1, skills: [] })),
            });
            navigate('/posts');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Could not publish post');
            setSubmitting(false);
        }
    }
    return (<PlatformShell title="Put an idea on the table" eyebrow="NEW POST / 07">
      <form className="w-full max-w-[780px] border border-line bg-[rgba(250,247,239,0.9)] p-7 max-[720px]:p-[18px]" onSubmit={handleSubmit}>
        <div className="mb-[23px] border-b border-line pb-[22px]">
          <span className="font-mono text-[11px] text-orange">01 / PROJECT BRIEF</span>
          <p className="mt-2.5 max-w-[500px] text-[13px] leading-[1.5] text-muted">
            Give people enough signal to imagine themselves building this with you.
          </p>
        </div>
        {error && (<p className="mb-[18px] border border-[#e0a496] bg-[#f9e3dc] px-3 py-2.5 text-[12px] text-[#9b421e]">{error}</p>)}
        <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
          Project title
          <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" placeholder="e.g. GreenCart — campus food, zero waste" value={title} onChange={(e) => setTitle(e.target.value)} required/>
        </label>
        <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
          Short description
          <textarea className="min-h-[120px] w-full resize-y border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" placeholder="What are you building, and why does it matter?" value={description} onChange={(e) => setDescription(e.target.value)} required/>
        </label>
        <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1 max-[720px]:gap-0">
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            Category
            <select className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (<option key={c.value} value={c.value}>
                  {c.label}
                </option>))}
            </select>
          </label>
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            Format
            <select className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={mode} onChange={(e) => setMode(e.target.value)}>
              {modes.map((m) => (<option key={m.value} value={m.value}>
                  {m.label}
                </option>))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1 max-[720px]:gap-0">
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            <CalendarDays size={14}/> Apply by
            <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}/>
          </label>
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            <Link2 size={14}/> Project link
            <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" placeholder="github.com/..." value={link} onChange={(e) => setLink(e.target.value)}/>
          </label>
        </div>
        <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
          Roles you need (comma-separated)
          <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" placeholder="e.g. Product designer, frontend builder" value={roles} onChange={(e) => setRoles(e.target.value)}/>
        </label>
        <div className="mt-2 flex items-center justify-end gap-3.5">
          <Link to="/posts" className="flex items-center gap-[7px] border border-line bg-transparent px-3 py-[9px] font-mono text-[11px] text-ink no-underline">
            <ArrowLeft size={15}/> Cancel
          </Link>
          <button className="flex items-center justify-center gap-2 border border-ink bg-ink px-3 py-[9px] font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55" type="submit" disabled={submitting}>
            {submitting ? 'Publishing…' : <>Publish opportunity <Plus size={15}/></>}
          </button>
        </div>
      </form>
    </PlatformShell>);
}
