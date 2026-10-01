import { ArrowUpRight, GitBranch, Layers3, Users } from 'lucide-react';
import { PlatformShell, SectionCard } from '@/components/platform-shell';
const teams = [
    { name: 'StudyLoop', status: 'Active', desc: 'Make group study actually work.', members: '4 members', color: '#6f8662' },
    { name: 'GreenCart', status: 'Forming', desc: 'Campus food, zero waste.', members: '3 members', color: '#f16d3d' },
];
export default function TeamsPage() {
    return (<PlatformShell title="Your teams" eyebrow="TEAMS / 05">
      <div className="-mt-2 mb-5 flex items-center justify-between gap-3.5">
        <p className="text-[13px] leading-[1.5] text-muted">The rooms where ideas become artifacts.</p>
        <button className="flex items-center gap-[7px] border border-line bg-transparent px-3 py-[9px] font-mono text-[11px] text-ink no-underline"><GitBranch size={16}/> Browse projects</button>
      </div>
      <div className="grid grid-cols-2 gap-[17px] max-[720px]:grid-cols-1">
        {teams.map((team) => (<SectionCard key={team.name}>
            <div className="mb-5 grid h-12 w-12 place-items-center text-paper" style={{ backgroundColor: team.color }}><Layers3 size={24}/></div>
            <span className="bg-[#cbd9c5] px-[7px] py-[5px] font-mono text-[10px] whitespace-nowrap text-[#45624c]">{team.status}</span>
            <h2 className="mt-3.5 mb-[7px] font-mono text-2xl font-bold">{team.name}</h2>
            <p className="text-[13px] leading-[1.5] text-muted">{team.desc}</p>
            <div className="mt-[25px] flex items-center justify-between gap-3.5 border-t border-line pt-3.5 text-[11px] text-muted">
              <span className="flex items-center gap-1.5"><Users size={15}/> {team.members}</span>
              <ArrowUpRight size={17}/>
            </div>
          </SectionCard>))}
      </div>
    </PlatformShell>);
}
