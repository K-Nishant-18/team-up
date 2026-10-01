import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { Avatar, PlatformShell, SectionCard } from '@/components/platform-shell';
import { api, availabilityLabel, colorFor, initialsOf } from '@/lib/api';
import { useFetch } from '@/lib/use-fetch';
export default function ProfilesPage() {
    const [query, setQuery] = useState('');
    const { data: people, loading } = useFetch(() => api.getUsers(), []);
    const filtered = useMemo(() => {
        const list = people ?? [];
        const q = query.trim().toLowerCase();
        if (!q)
            return list;
        return list.filter((person) => {
            const skills = (person.skills ?? []).map((s) => s.skill ?? '').join(' ');
            return `${person.name} ${person.college ?? ''} ${skills}`.toLowerCase().includes(q);
        });
    }, [people, query]);
    return (<PlatformShell title="Find your next teammate." eyebrow="NETWORK / STUDENTS">
      <div className="flex items-center justify-between gap-3 border-y border-line py-[15px] max-[720px]:grid">
        <div className="flex max-w-[570px] flex-1 items-center gap-2.5 border border-line bg-white/30 px-[13px] text-[#7f8582] max-[720px]:max-w-none">
          <Search size={17}/>
          <input className="h-[41px] w-full border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-[#7f8582]" aria-label="Search people" placeholder="Search by name, college, or skill…" value={query} onChange={(e) => setQuery(e.target.value)}/>
        </div>
      </div>
      <div className="mt-[25px] mb-3.5 flex items-center justify-between font-mono text-[11px] text-[#7a7e7c]">
        <span>
          <strong className="text-ink">{filtered.length}</strong> people in the network
        </span>
        {loading && <span>Loading…</span>}
      </div>
      <section className="grid grid-cols-2 gap-[17px] max-[720px]:grid-cols-1">
        {loading && (<SectionCard className="col-span-full border border-dashed border-line p-[55px] text-center">
            <p className="text-muted">Loading people…</p>
          </SectionCard>)}
        {!loading && filtered.map((person) => <PersonCard key={person.id} person={person}/>)}
        {!loading && filtered.length === 0 && (<SectionCard className="col-span-full border border-dashed border-line p-[55px] text-center">
            <h2 className="font-mono text-2xl">No matches yet.</h2>
            <p className="text-muted">Try a wider search.</p>
          </SectionCard>)}
      </section>
    </PlatformShell>);
}
function PersonCard({ person }) {
    const name = person.name;
    const skills = (person.skills ?? []).map((s) => s.skill).filter(Boolean);
    const collegeLine = [person.college, person.year ? `Year ${person.year}` : null].filter(Boolean).join(' · ');
    return (<SectionCard>
      <div className="mb-4 flex items-center justify-start gap-3.5 max-[720px]:flex-wrap max-[720px]:items-start">
        <Avatar initials={initialsOf(name)} color={colorFor(name)}/>
        <div className="flex-1">
          <strong>{name}</strong>
          <span className="mb-1 flex items-center gap-[5px] text-[12px] text-muted">{collegeLine}</span>
        </div>
      </div>
      <span className="mb-3.5 inline-flex items-center gap-[7px] border border-line px-2 py-[5px] font-mono text-[10px] text-[#45624c]">
        <span className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full bg-green shadow-[0_0_0_3px_rgba(95,125,103,0.14)]"/>
        {availabilityLabel(person.availability)}
      </span>
      <p className="text-[13px] leading-[1.5] text-muted">{person.bio ?? 'No bio yet.'}</p>
      {skills.length > 0 && (<div className="my-[18px] flex flex-wrap gap-[5px] border-b border-line pb-[18px]">
          {skills.map((skill, i) => (<span className="border border-[#c7c4bb] px-[7px] py-[5px] font-mono text-[10px] text-[#57605f]" key={`${skill}-${i}`}>
              {skill}
            </span>))}
        </div>)}
      <Link className="ml-auto inline-flex items-center gap-[5px] font-mono text-[11px] text-ink no-underline" to="/profile">
        View profile <ArrowUpRight size={14}/>
      </Link>
    </SectionCard>);
}
