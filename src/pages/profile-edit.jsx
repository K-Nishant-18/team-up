import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Save, X } from 'lucide-react';
import { Avatar, PlatformShell, SectionCard } from '@/components/platform-shell';
import { api, colorFor, initialsOf } from '@/lib/api';
const availabilityOptions = [
    { label: 'Open to join', value: 'openToJoin' },
    { label: 'Looking for teammates', value: 'lookingForTeammates' },
    { label: 'Not available', value: 'notAvailable' },
];
export default function EditProfilePage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [college, setCollege] = useState('');
    const [year, setYear] = useState('');
    const [availability, setAvailability] = useState('openToJoin');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState([]);
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        api.getMe()
            .then((me) => {
            setName(me.name ?? '');
            setCollege(me.college ?? '');
            setYear(me.year ?? '');
            setAvailability(me.availability ?? 'openToJoin');
            setBio(me.bio ?? '');
            setSkills((me.skills ?? []).map((s) => s.skill ?? '').filter(Boolean));
            setGithub(me.links?.github ?? '');
            setLinkedin(me.links?.linkedin ?? '');
        })
            .catch(() => setError('Could not load your profile. Please sign in.'))
            .finally(() => setLoading(false));
    }, []);
    async function handleSave() {
        setError('');
        setSaved(false);
        try {
            await api.updateMe({
                name,
                college,
                year,
                availability,
                bio,
                skills: skills.filter(Boolean).map((skill) => ({ skill, proficiency: 'Intermediate' })),
                links: { github, linkedin, portfolio: github, resumeUrl: null },
            });
            setSaved(true);
            window.setTimeout(() => navigate('/profile'), 700);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save profile');
        }
    }
    if (loading) {
        return (<PlatformShell title="Edit your profile." eyebrow="PROFILE / SETTINGS">
        <p className="text-[13px] leading-[1.5] text-muted">Loading…</p>
      </PlatformShell>);
    }
    return (<PlatformShell title="Edit your profile." eyebrow="PROFILE / SETTINGS">
      <Link to="/profile" className="mb-[22px] inline-flex items-center gap-[7px] border-b border-line pb-0.5 font-mono text-[11px] text-ink no-underline">
        <ArrowLeft size={15}/> Back to profile
      </Link>
      <SectionCard className="w-full max-w-[780px] border border-line bg-[rgba(250,247,239,0.9)] p-7 max-[720px]:p-[18px]">
        <div className="mb-6 flex items-start justify-between gap-[18px] border-b border-line pb-[22px] [&>span]:h-[54px] [&>span]:w-[54px] [&>span]:text-base">
          <div>
            <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-orange">PROFILE RECORD / 03</p>
            <h2 className="mb-7 font-mono text-[length:clamp(36px,5vw,58px)] font-bold leading-[0.98] tracking-[-3px]" style={{ marginBottom: 10 }}>
              Make it easier to find you.
            </h2>
            <p className="text-[13px] leading-[1.5] text-muted">A clear profile helps the right projects find their way to you.</p>
          </div>
          <Avatar initials={initialsOf(name)} color={colorFor(name)}/>
        </div>
        {error && <p className="mb-[18px] border border-[#e0a496] bg-[#f9e3dc] px-3 py-2.5 text-[12px] text-[#9b421e]">{error}</p>}
        <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1 max-[720px]:gap-0">
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            Full name
            <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={name} onChange={(e) => setName(e.target.value)}/>
          </label>
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            College
            <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={college} onChange={(e) => setCollege(e.target.value)}/>
          </label>
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            Year
            <select className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Select</option>
              {['1', '2', '3', '4'].map((y) => (<option key={y} value={y}>
                  Year {y}
                </option>))}
            </select>
          </label>
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            Availability
            <select className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={availability} onChange={(e) => setAvailability(e.target.value)}>
              {availabilityOptions.map((o) => (<option key={o.value} value={o.value}>
                  {o.label}
                </option>))}
            </select>
          </label>
        </div>
        <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
          Short bio
          <textarea className="min-h-[120px] w-full resize-y border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={bio} onChange={(e) => setBio(e.target.value)}/>
        </label>
        <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1 max-[720px]:gap-0">
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            GitHub
            <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" placeholder="github.com/you" value={github} onChange={(e) => setGithub(e.target.value)}/>
          </label>
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            LinkedIn
            <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" placeholder="linkedin.com/in/you" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}/>
          </label>
        </div>
        <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
          Skills
          <div className="flex flex-wrap gap-1.5 border border-line bg-white/30 p-3">
            {skills.map((skill) => (<span className="inline-flex items-center gap-1.5 border border-[#c7c4bb] bg-[#eee8da] px-[9px] py-1.5 font-mono text-[10px] text-[#57605f]" key={skill}>
                {skill}
                <button type="button" className="inline-flex items-center border-0 bg-transparent text-muted" aria-label={`Remove ${skill}`} onClick={() => setSkills(skills.filter((item) => item !== skill))}>
                  <X size={12}/>
                </button>
              </span>))}
            <button type="button" className="inline-flex items-center gap-1 border border-dashed border-line bg-transparent px-[9px] py-1.5 font-mono text-[10px] text-orange" onClick={() => {
            const next = window.prompt('Add a skill')?.trim();
            if (next)
                setSkills((prev) => (prev.includes(next) ? prev : [...prev, next]));
        }}>
              + Add skill
            </button>
          </div>
        </label>
        <div className="mt-2 flex items-center justify-end gap-3.5">
          <Link to="/profile" className="flex items-center gap-[7px] border border-line bg-transparent px-3 py-[9px] font-mono text-[11px] text-ink no-underline">
            Cancel
          </Link>
          <button className="flex items-center justify-center gap-2 border border-ink bg-ink px-3 py-[9px] font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55" type="button" onClick={handleSave}>
            {saved ? (<>
                <Check size={15}/> Saved
              </>) : (<>
                <Save size={15}/> Save changes
              </>)}
          </button>
        </div>
      </SectionCard>
    </PlatformShell>);
}
