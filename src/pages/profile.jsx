import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, Link2, MapPin, Pencil, Plus } from 'lucide-react';
import { Avatar, PlatformShell, SectionCard } from '@/components/platform-shell';
import { api, availabilityLabel, colorFor, initialsOf } from '@/lib/api';
export default function ProfilePage() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        api.getMe()
            .then(setMe)
            .catch(() => setError('Sign in to view and complete your profile.'))
            .finally(() => setLoading(false));
    }, []);
    if (loading) {
        return (<PlatformShell title="Your profile" eyebrow="PROFILE / 06">
        <p className="text-[13px] leading-[1.5] text-muted">Loading…</p>
      </PlatformShell>);
    }
    if (!me) {
        return (<PlatformShell title="Your profile" eyebrow="PROFILE / 06">
        <SectionCard className="col-span-full border border-dashed border-line p-[55px] text-center">
          <h2 className="font-mono text-2xl">{error}</h2>
          <Link className="text-ink no-underline" to="/login">
            Sign in
          </Link>
        </SectionCard>
      </PlatformShell>);
    }
    const skills = (me.skills ?? []).map((s) => s.skill).filter(Boolean);
    const locationLine = [me.location, me.college].filter(Boolean).join(' · ');
    return (<PlatformShell title="Your profile" eyebrow="PROFILE / 06">
      <div className="grid grid-cols-2 gap-[17px] max-[720px]:grid-cols-1">
        <SectionCard>
          <div className="-mt-6 -mx-6 mb-5 h-[75px] bg-ink blueprint-cover max-[720px]:-mx-[18px] max-[720px]:-mt-[18px]"/>
          <div className="flex items-center justify-start gap-3.5 max-[720px]:flex-wrap max-[720px]:items-start">
            <Avatar initials={initialsOf(me.name)} color={colorFor(me.name)}/>
            <div className="flex-1">
              <h2 className="mb-1 font-mono text-[22px] font-bold">{me.name}</h2>
              <p className="mb-1 flex items-center gap-[5px] text-[12px] text-muted">
                {me.year ? `Year ${me.year} · ` : ''}
                {availabilityLabel(me.availability)}
              </p>
              <span className="mb-1 flex items-center gap-[5px] text-[12px] text-muted">
                <MapPin size={14}/> {locationLine || 'Add your campus'}
              </span>
            </div>
            <Link className="flex items-center gap-[7px] border border-line bg-transparent px-3 py-[9px] font-mono text-[11px] text-ink no-underline max-[720px]:ml-[49px]" to="/profile/edit">
              <Pencil size={15}/> Edit profile
            </Link>
          </div>
          <p className="my-[23px] max-w-[650px] text-[13px] leading-[1.6] text-[#5f6666]">
            {me.bio || 'No bio yet — tell people what you like to build.'}
          </p>
          <div className="flex flex-wrap items-center justify-start gap-3.5 border-t border-line pt-[17px]">
            {me.links?.github && (<a className="flex items-center gap-[5px] font-mono text-[10px] text-ink no-underline" href={me.links.github} target="_blank" rel="noreferrer">
                <Code2 size={15}/> {me.links.github}
              </a>)}
            {me.links?.linkedin && (<a className="flex items-center gap-[5px] font-mono text-[10px] text-ink no-underline" href={me.links.linkedin} target="_blank" rel="noreferrer">
                <Link2 size={15}/> {me.links.linkedin}
              </a>)}
            {me.links?.portfolio && (<a className="flex items-center gap-[5px] font-mono text-[10px] text-ink no-underline" href={me.links.portfolio} target="_blank" rel="noreferrer">
                <ArrowUpRight size={15}/> Portfolio
              </a>)}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between gap-3.5">
            <h2 className="font-mono text-lg font-bold">Skills & interests</h2>
            <Plus size={17}/>
          </div>
          <div className="mt-5 flex flex-wrap gap-[5px] border-b-0 pb-0">
            {skills.length > 0 ? (skills.map((skill) => (<span className="border border-[#c7c4bb] px-[7px] py-[5px] font-mono text-[10px] text-[#57605f]" key={skill}>
                  {skill}
                </span>))) : (<span className="text-[13px] leading-[1.5] text-muted">No skills added yet.</span>)}
          </div>
        </SectionCard>
      </div>
    </PlatformShell>);
}
