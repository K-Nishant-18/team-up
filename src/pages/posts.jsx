import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Filter, Search } from 'lucide-react';
import { Avatar, PlatformShell, SectionCard } from '@/components/platform-shell';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/use-fetch';
import { categoryLabel, colorFor, formatDeadline, initialsOf, modeLabel } from '@/lib/api';
const categories = [
    { label: 'All posts', value: '' },
    { label: 'Hackathon', value: 'Hackathon' },
    { label: 'Open Source', value: 'OpenSource' },
    { label: 'Class Project', value: 'ClassProject' },
    { label: 'Startup Idea', value: 'StartupIdea' },
];
export default function PostsPage() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const { data: posts, loading } = useFetch(() => api.getPosts(), []);
    const filtered = useMemo(() => {
        const list = posts ?? [];
        return list.filter((post) => {
            const matchesCategory = !category || post.category === category;
            const haystack = `${post.title} ${post.description} ${(post.rolesRequired ?? [])
                .flatMap((r) => r.skills ?? [])
                .join(' ')}`.toLowerCase();
            return matchesCategory && haystack.includes(query.toLowerCase());
        });
    }, [posts, query, category]);
    return (<PlatformShell title="The project board." eyebrow="DISCOVER / OPPORTUNITIES">
      <div className="flex items-center justify-between gap-3 border-y border-line py-[15px] max-[720px]:grid">
        <div className="flex max-w-[570px] flex-1 items-center gap-2.5 border border-line bg-white/30 px-[13px] text-[#7f8582] max-[720px]:max-w-none">
          <Search size={17}/>
          <input className="h-[41px] w-full border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-[#7f8582]" aria-label="Search posts" placeholder="Search projects, skills, or people…" value={query} onChange={(e) => setQuery(e.target.value)}/>
        </div>
        <div className="flex gap-2 max-[720px]:overflow-x-auto">
          <label className="flex h-[41px] items-center gap-2 border border-line bg-white/30 px-3 text-[12px] text-[#4f575b]">
            <Filter size={15}/>
            <select className="border-0 bg-transparent text-[12px] text-inherit outline-none" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter category">
              {categories.map((c) => (<option key={c.value} value={c.value}>
                  {c.label}
                </option>))}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-[25px] mb-3.5 flex items-center justify-between font-mono text-[11px] text-[#7a7e7c]">
        <span>
          <strong className="text-ink">{filtered.length}</strong> opportunities mapped
        </span>
        <span>Newest first</span>
      </div>
      <section className="grid grid-cols-3 items-start gap-[17px] max-[1050px]:grid-cols-2 max-[720px]:grid-cols-1">
        {loading && (<SectionCard className="col-span-full border border-dashed border-line p-[55px] text-center">
            <p className="text-muted">Loading opportunities…</p>
          </SectionCard>)}
        {!loading && filtered.map((post) => <PostCard key={post.id} post={post}/>)}
        {!loading && filtered.length === 0 && (<SectionCard className="col-span-full border border-dashed border-line p-[55px] text-center">
            <h2 className="font-mono text-2xl">No matches yet.</h2>
            <p className="text-muted">Try clearing a filter or searching another skill.</p>
          </SectionCard>)}
      </section>
    </PlatformShell>);
}
function PostCard({ post }) {
    const creatorName = post.creator?.name ?? 'Anonymous';
    const tags = (post.rolesRequired ?? []).flatMap((r) => r.skills ?? []);
    const openSpots = (post.rolesRequired ?? []).reduce((sum, r) => sum + (r.count ?? 0), 0);
    const slots = post.status === 'Open'
        ? `${openSpots || 1} ${openSpots === 1 ? 'spot' : 'spots'} open`
        : (post.status ?? 'Open');
    return (<article className="relative border border-line bg-[rgba(250,247,239,0.85)] px-5 pt-5 pb-[18px] transition duration-200 before:absolute before:-top-px before:-left-px before:h-[3px] before:w-0 before:bg-orange before:content-[''] before:transition-[width] hover:-translate-y-[3px] hover:shadow-[7px_7px_0_rgba(23,35,61,0.08)] hover:before:w-[calc(100%+2px)]">
      <div className="flex items-center justify-between">
        <span className="inline-block bg-[#f4c4a7] px-[7px] py-[5px] font-mono text-[10px] tracking-[0.6px] text-[#9b421e]">
          {categoryLabel(post.category)}
        </span>
      </div>
      <Link className="mt-[22px] mb-3 flex w-full items-start justify-between gap-2 border-0 bg-transparent text-left font-mono text-[20px] leading-[1.15] font-bold tracking-[-1px] text-ink no-underline" to={`/posts/${post.id}`}>
        {post.title}
        <ArrowUpRight size={17} className="shrink-0 text-orange"/>
      </Link>
      <p className="min-h-[66px] text-[13px] leading-[1.5] text-[#656b6d] max-[720px]:min-h-0">
        {post.description}
      </p>
      <div className="mt-4 mb-[13px] flex items-center gap-[7px] font-mono text-[10px] text-[#777d7b]">
        <span className="flex items-center gap-[5px]">
          <CalendarDays size={14}/> Apply by {formatDeadline(post.deadline) || 'Open'}
        </span>
        <span className="text-line">·</span>
        <span>{modeLabel(post.mode)}</span>
      </div>
      {tags.length > 0 && (<div className="flex flex-wrap gap-[5px] border-b border-line pb-[18px]">
          {tags.slice(0, 6).map((tag, i) => (<span className="border border-[#c7c4bb] px-[7px] py-[5px] font-mono text-[10px] text-[#57605f]" key={`${tag}-${i}`}>
              {tag}
            </span>))}
        </div>)}
      <div className="flex items-center justify-between gap-3 pt-[14px] pb-4">
        <div className="flex items-center gap-2">
          <Avatar initials={initialsOf(creatorName)} color={colorFor(creatorName)} small/>
          <div className="grid min-w-0 gap-[3px]">
            <strong>{creatorName}</strong>
            <span className="text-[10px] text-[#a4adba]">{post.creator?.college ?? 'Student team'}</span>
          </div>
        </div>
        <span className="ml-[7px] whitespace-nowrap font-mono text-[9px] text-[#7c827e]">{slots}</span>
      </div>
      <Link className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-2.5 py-2.5 font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange" to={`/posts/${post.id}`}>
        View opportunity <ArrowUpRight size={15}/>
      </Link>
    </article>);
}
