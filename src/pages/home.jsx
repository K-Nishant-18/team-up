import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bell, Bookmark, CalendarDays, ChevronDown, CircleHelp, Compass, Filter, GitBranch, LayoutDashboard, Menu, Plus, Search, Send, SlidersHorizontal, Sparkles, Users, X, } from 'lucide-react';
import { api, categoryLabel, colorFor, formatDeadline, initialsOf, modeLabel } from '@/lib/api';
import { useFetch } from '@/lib/use-fetch';
const categoryOptions = [
    { label: 'All posts', value: '' },
    { label: 'Hackathon', value: 'Hackathon' },
    { label: 'Open Source', value: 'OpenSource' },
    { label: 'Class Project', value: 'ClassProject' },
    { label: 'Startup Idea', value: 'StartupIdea' },
];
const navItems = [
    { label: 'Discover', href: '/', icon: Compass },
    { label: 'My dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My requests', href: '/requests', icon: Send },
    { label: 'Notifications', href: '/notifications', icon: Bell, count: 0 },
];
function Avatar({ initials, color, small = false }) {
    return (<span className={`inline-flex shrink-0 items-center justify-center rounded-full border-paper font-mono font-bold text-paper ${small ? 'h-[29px] w-[29px] border text-[9px]' : 'h-[37px] w-[37px] border-2 text-[11px]'}`} style={{ backgroundColor: color ?? '#20304f' }}>
      {initials}
    </span>);
}
function PostCard({ post, onSave, onRequest }) {
    const [expanded, setExpanded] = useState(false);
    const creatorName = post.creator?.name ?? 'Anonymous';
    const tags = (post.rolesRequired ?? []).flatMap((r) => r.skills ?? []);
    const openSpots = (post.rolesRequired ?? []).reduce((sum, r) => sum + (r.count ?? 0), 0);
    const slots = `${openSpots || 1} ${openSpots === 1 ? 'spot' : 'spots'} open`;
    return (<article className="relative border border-line bg-[rgba(250,247,239,0.85)] px-5 pt-5 pb-[18px] transition duration-200 before:absolute before:-top-px before:-left-px before:h-[3px] before:w-0 before:bg-orange before:content-[''] before:transition-[width] hover:-translate-y-[3px] hover:shadow-[7px_7px_0_rgba(23,35,61,0.08)] hover:before:w-[calc(100%+2px)]">
      <div className="flex items-center justify-between">
        <span className="inline-block bg-[#f4c4a7] px-[7px] py-[5px] font-mono text-[10px] tracking-[0.6px] text-[#9b421e]">{categoryLabel(post.category)}</span>
        <button className="border-0 bg-transparent text-[#828784]" aria-label="Save post" onClick={() => onSave(post.id)}>
          <Bookmark size={17} fill="none"/>
        </button>
      </div>
      <button className="mt-[22px] mb-3 flex w-full items-start justify-between gap-2 border-0 bg-transparent text-left font-mono text-[20px] leading-[1.15] font-bold tracking-[-1px] text-ink no-underline" onClick={() => setExpanded(!expanded)}>{post.title}<ArrowUpRight size={18} className="shrink-0 text-orange"/></button>
      <p className="min-h-[66px] text-[13px] leading-[1.5] text-[#656b6d] max-[720px]:min-h-0">{expanded ? post.description : `${post.description.slice(0, 150)}${post.description.length > 150 ? '…' : ''}`}{post.description.length > 150 && <button className="border-0 bg-transparent p-0 text-[12px] text-orange" onClick={() => setExpanded(!expanded)}>{expanded ? ' less' : ' more'}</button>}</p>
      <div className="mt-4 mb-[13px] flex items-center gap-[7px] font-mono text-[10px] text-[#777d7b]">
        <span className="flex items-center gap-[5px]"><CalendarDays size={14}/> Apply by {formatDeadline(post.deadline) || 'Open'}</span>
        <span className="text-line">·</span>
        <span>{modeLabel(post.mode)}</span>
      </div>
      {tags.length > 0 && <div className="flex flex-wrap gap-[5px] border-b border-line pb-[18px]">{tags.slice(0, 6).map((tag) => <span className="border border-[#c7c4bb] px-[7px] py-[5px] font-mono text-[10px] text-[#57605f]" key={tag}>{tag}</span>)}</div>}
      <div className="flex items-center justify-between gap-3 pt-[14px] pb-4">
        <div className="flex items-center gap-2">
          <Avatar initials={initialsOf(creatorName)} color={colorFor(creatorName)} small/>
          <div className="grid min-w-0 gap-[3px]"><strong>{creatorName}</strong><span className="text-[10px] text-[#a4adba]">{post.creator?.college ?? 'Student team'}</span></div>
        </div>
        <span className="ml-[7px] whitespace-nowrap font-mono text-[9px] text-[#7c827e]">{slots}</span>
      </div>
      <button className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-2.5 py-2.5 font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55" onClick={() => onRequest(post)}>Request to join <ArrowUpRight size={16}/></button>
    </article>);
}
export default function HomePage() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('Discover');
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [mode, setMode] = useState('');
    const [savedIds, setSavedIds] = useState([]);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [modalPost, setModalPost] = useState(null);
    const [modalRole, setModalRole] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [joining, setJoining] = useState(false);
    const [toast, setToast] = useState('');
    const { data: fetchedPosts } = useFetch(() => api.getPosts(), []);
    const { data: recommended } = useFetch(() => api.getRecommendedPosts(), []);
    const allPosts = fetchedPosts ?? [];
    const posts = useMemo(() => allPosts.filter((post) => {
        const haystack = `${post.title} ${post.description} ${(post.rolesRequired ?? []).flatMap((r) => r.skills ?? []).join(' ')}`.toLowerCase();
        const searchMatch = haystack.includes(query.toLowerCase());
        const categoryMatch = !category || post.category === category;
        const modeMatch = !mode || post.mode === mode;
        return searchMatch && categoryMatch && modeMatch;
    }), [allPosts, query, category, mode]);
    const recommendedPosts = useMemo(() => (recommended ?? []).slice(0, 3), [recommended]);
    const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
    const handleSave = (id) => {
        setSavedIds((ids) => (ids.includes(id) ? ids.filter((saved) => saved !== id) : [...ids, id]));
        notify(savedIds.includes(id) ? 'Removed from your saved posts.' : 'Saved to your dashboard.');
    };
    const openApply = (post) => { setModalRole(''); setModalMessage(''); setModalPost(post); };
    const submitJoinFromModal = async () => {
        if (!modalPost || joining)
            return;
        setJoining(true);
        try {
            await api.submitJoinRequest(modalPost.id, { role: modalRole || undefined, message: modalMessage || undefined });
            setModalPost(null);
            notify('Your join request was sent to the project owner.');
        }
        catch (err) {
            notify(err instanceof Error ? err.message : 'Could not send request. Sign in to apply.');
        }
        finally {
            setJoining(false);
        }
    };
    return (<div className="blueprint min-h-screen bg-paper">
      <header className="flex h-[76px] items-center justify-between bg-ink px-11 text-paper max-[720px]:h-[68px] max-[720px]:px-[18px]">
        <div className="grid grid-cols-[25px_auto] grid-rows-[28px_12px] items-center gap-x-[7px] font-mono text-2xl leading-none font-bold tracking-[-1.5px] max-[720px]:text-xl"><span className="text-[30px] font-normal text-orange">+</span><span>team<span className="text-orange">up</span></span><small className="col-start-2 font-sans text-[9px] tracking-[2px] text-[#aeb8c2]">BUILD TOGETHER</small></div>
        <button className="hidden border-0 bg-transparent text-paper max-[720px]:block" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X /> : <Menu />}</button>
        <div className="flex items-center gap-[26px] max-[720px]:gap-2.5">
          <button className="flex items-center gap-2 border-0 bg-transparent text-[13px] text-paper max-[1050px]:hidden"><CircleHelp size={17}/> Help</button>
          <Link className="flex items-center gap-2 border border-orange bg-orange px-3.5 py-2.5 font-mono text-xs font-bold text-paper max-[720px]:px-[9px] max-[720px]:text-[0px] max-[720px]:[&_svg]:w-[18px]" to="/create-post"><Plus size={17}/> Create a post</Link>
          <Link className="flex items-center gap-2 border-l border-[#4b5872] bg-transparent pl-5 text-[13px] text-paper max-[720px]:border-l-0 max-[720px]:pl-2 max-[720px]:[&>span]:hidden max-[720px]:[&>svg]:hidden" to="/profile"><Avatar initials="SN" color="#c65d3d" small/><span>Samira N.</span><ChevronDown size={15}/></Link>
        </div>
      </header>
      <div className="h-[5px] bg-orange"/>
      <div className="mx-auto grid max-w-[1540px] grid-cols-[254px_1fr] max-[1050px]:grid-cols-[210px_1fr] max-[720px]:block">
        <aside className={`min-h-[calc(100vh-81px)] bg-ink/97 text-paper max-[720px]:fixed max-[720px]:top-[73px] max-[720px]:bottom-0 max-[720px]:left-[-270px] max-[720px]:z-[4] max-[720px]:w-[254px] max-[720px]:transition-[left] max-[720px]:shadow-[8px_0_20px_rgba(0,0,0,0.2)] ${mobileOpen ? 'max-[720px]:left-0' : ''}`}>
          <div className="flex min-h-[calc(100vh-81px)] flex-col px-[23px] pt-[39px] pb-6">
            <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-[#8290a3]">WORKSPACE / 01</p>
            <nav aria-label="Primary navigation">
              {navItems.map(({ label, href, icon: Icon, count }) => <a key={label} href={href} className={`mb-[3px] flex w-full items-center gap-[13px] px-2.5 py-3 text-[13px] transition-colors hover:bg-[#263553] hover:text-paper ${activeNav === label ? 'bg-[#263553] text-paper shadow-[inset_3px_0_var(--color-orange)]' : 'text-[#c8cfda]'}`} onClick={(event) => { event.preventDefault(); setActiveNav(label); setMobileOpen(false); navigate(href); }}><Icon size={18}/><span>{label}</span>{count ? <b className="ml-auto min-w-5 bg-orange px-[5px] py-[3px] text-center font-mono text-[10px] font-normal text-paper">{count}</b> : null}</a>)}
            </nav>
            <div className="my-[25px] h-px bg-[#33415e]"/>
            <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-[#8290a3]">YOUR SPACE</p>
            <a href="/teams" className={`mb-[3px] flex w-full items-center gap-[13px] px-2.5 py-3 text-[13px] transition-colors hover:bg-[#263553] hover:text-paper ${activeNav === 'My teams' ? 'bg-[#263553] text-paper shadow-[inset_3px_0_var(--color-orange)]' : 'text-[#c8cfda]'}`} onClick={(event) => { event.preventDefault(); setActiveNav('My teams'); navigate('/teams'); }}><Users size={18}/><span>My teams</span></a>
            <a href="/dashboard#saved" className={`mb-[3px] flex w-full items-center gap-[13px] px-2.5 py-3 text-[13px] transition-colors hover:bg-[#263553] hover:text-paper ${activeNav === 'Saved posts' ? 'bg-[#263553] text-paper shadow-[inset_3px_0_var(--color-orange)]' : 'text-[#c8cfda]'}`} onClick={(event) => { event.preventDefault(); setActiveNav('Saved posts'); navigate('/dashboard#saved'); }}><Bookmark size={18}/><span>Saved posts</span><b className="ml-auto min-w-5 bg-orange px-[5px] py-[3px] text-center font-mono text-[10px] font-normal text-paper">{savedIds.length}</b></a>
            <div className="mt-auto">
              <div className="flex items-center gap-2.5 border-y border-[#33415e] pt-[14px] pb-5"><Avatar initials="SN" color="#c65d3d"/><div className="grid min-w-0 gap-[3px]"><strong className="text-xs">Samira N.</strong><span className="text-[10px] text-[#a4adba]">IIIT Hyderabad · Year 3</span></div><ArrowUpRight size={15} className="ml-auto text-[#9aa6b7]"/></div>
            </div>
          </div>
        </aside>
        <main className="w-full max-w-[1240px] px-[58px] pt-[55px] pb-[25px] max-[1050px]:px-[30px] max-[1050px]:pt-[45px] max-[720px]:px-[18px] max-[720px]:pt-[34px] max-[720px]:pb-5">
          <section className="flex items-end justify-between pb-9 max-[720px]:items-start max-[720px]:gap-5"><div><p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-orange">DISCOVER / OPPORTUNITIES</p><h1 className="m-0 font-mono text-[length:clamp(38px,5vw,62px)] font-bold leading-[0.95] tracking-[-4px] max-[720px]:text-[41px]">Find your people.</h1><p className="mt-[18px] max-w-[510px] text-[15px] leading-[1.5] text-[#656b6d]">Good projects get better when the right people build them together.</p></div></section>
          <section className="flex items-center justify-between gap-3 border-y border-line py-[15px] max-[720px]:grid" aria-label="Post filters">
            <div className="flex max-w-[570px] flex-1 items-center gap-2.5 border border-line bg-white/30 px-[13px] text-[#7f8582] max-[720px]:max-w-none"><Search size={18}/><input className="h-[41px] w-full border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-[#7f8582]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, skills, or people…" aria-label="Search projects, skills, or people"/>{query && <button className="border-0 bg-transparent text-muted" onClick={() => setQuery('')} aria-label="Clear search"><X size={15}/></button>}</div>
            <div className="flex gap-2 max-[720px]:overflow-x-auto"><label className="flex h-[41px] items-center gap-2 border border-line bg-white/30 px-3 text-[12px] text-[#4f575b]"><Filter size={15}/><select className="border-0 bg-transparent text-[12px] text-inherit outline-none" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label><label className="flex h-[41px] items-center gap-2 border border-line bg-white/30 px-3 text-[12px] text-[#4f575b]"><SlidersHorizontal size={15}/><select className="border-0 bg-transparent text-[12px] text-inherit outline-none" value={mode} onChange={(event) => setMode(event.target.value)} aria-label="Filter by format"><option value="">Any format</option><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option></select></label>{(category || mode) && <button className="flex h-[41px] items-center gap-2 border border-line bg-white/30 px-3 text-[12px] text-[#4f575b]" onClick={() => { setCategory(''); setMode(''); }}>Clear filters <X size={14}/></button>}</div>
          </section>
          <div className="mt-[25px] mb-3.5 flex items-center justify-between font-mono text-[11px] text-[#7a7e7c]"><span><strong className="text-ink">{posts.length}</strong> open opportunities</span>{!category && !mode && <span className="text-[13px] leading-[1.5] text-muted" style={{ font: '11px Courier New, monospace' }}>Hide filters to see tuning options</span>}<button className="flex items-center gap-[5px] border-0 bg-transparent font-mono text-[11px] text-[#7a7e7c]">Sort: <strong className="text-ink">Newest first</strong> <ChevronDown size={14}/></button></div>
          {recommendedPosts.length > 1 && (<>
              <section className="mt-[25px] mb-3.5 flex items-center justify-between font-mono text-[11px] text-[#7a7e7c]"><span className="mb-0 font-mono text-[10px] tracking-[1.4px] text-orange" style={{ margin: 0 }}>RECOMMENDED FOR YOU / SKILL MATCH</span></section>
              <section className="grid grid-cols-3 items-start gap-[17px] max-[1050px]:grid-cols-2 max-[720px]:grid-cols-1">{recommendedPosts.map((post) => <PostCard key={`rec-${post.id}`} post={post} onSave={handleSave} onRequest={openApply}/>)}</section>
              <div className="my-[30px] h-[5px] bg-orange"/>
            </>)}
          <section className="grid grid-cols-3 items-start gap-[17px] max-[1050px]:grid-cols-2 max-[720px]:grid-cols-1">{posts.map((post) => <PostCard key={post.id} post={post} onSave={handleSave} onRequest={openApply}/>)}{!allPosts.length && <div className="col-span-full border border-dashed border-line p-[55px] text-center"><Sparkles size={28}/><h2 className="font-mono text-2xl">No posts yet.</h2><p className="text-muted">Start by adding the first opportunity.</p></div>}{allPosts.length > 0 && posts.length === 0 && <div className="col-span-full border border-dashed border-line p-[55px] text-center"><Sparkles size={28}/><h2 className="font-mono text-2xl">No matches yet.</h2><p className="text-muted">Try a wider search or clear the category filter.</p></div>}</section>
          <footer className="flex justify-between border-t border-line pt-4 font-mono text-[10px] text-[#8a8e89] max-[720px]:flex-wrap max-[720px]:gap-2.5"><span>TEAMUP / 0.1.0</span><span className="max-[720px]:order-3 max-[720px]:w-full">Made for the people who make things.</span><span className="flex gap-2.5 text-ink"><GitBranch size={14}/> <Users size={14}/></span></footer>
        </main>
      </div>
      {modalPost && <div className="fixed inset-0 z-[5] grid place-items-center bg-ink/[0.72] p-5" onClick={() => setModalPost(null)}><div className="relative w-[min(490px,100%)] bg-paper p-8 shadow-[10px_10px_0_rgba(0,0,0,0.2)]" onClick={(event) => event.stopPropagation()}><button className="absolute top-[15px] right-[15px] border-0 bg-transparent text-ink" onClick={() => setModalPost(null)}><X size={18}/></button><p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-orange">JOIN REQUEST / {String(modalPost.id).padStart(2, '0')}</p><h2 className="my-[5px] mb-2.5 font-mono text-[25px] leading-[1.1] font-bold">{modalPost.title}</h2><p className="text-[14px] leading-[1.5] text-muted">Tell {(modalPost.creator?.name ?? 'them').split(' ')[0]} why you would be a good fit for this build.</p>{(modalPost.rolesRequired?.length ?? 0) > 0 && <label className="mb-2.5 mt-3 grid gap-1.5 text-[13px] text-muted">Role you are applying for<select className="w-full border border-line bg-white/30 p-2.5 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={modalRole} onChange={(event) => setModalRole(event.target.value)}><option value="">Choose a role…</option>{(modalPost.rolesRequired ?? []).map((r, i) => <option key={`${r.roleName}-${i}`} value={r.roleName ?? ''}>{r.roleName ?? 'Role'}</option>)}</select></label>}<textarea className="my-3 mb-4 min-h-[130px] w-full resize-y border border-line bg-white/30 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={modalMessage} onChange={(event) => setModalMessage(event.target.value)} placeholder="A short note about your skills, availability, or what excites you about the project…"/><button className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-2.5 py-2.5 font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55" onClick={submitJoinFromModal} disabled={joining}>{joining ? 'Sending…' : <>Send request <Send size={16}/></>}</button></div></div>}
      {toast && <div className="fixed right-[25px] bottom-[22px] z-[7] bg-ink px-4 py-[13px] text-[12px] text-paper shadow-[5px_5px_0_var(--color-orange)]"><span className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full bg-green shadow-[0_0_0_3px_rgba(95,125,103,0.14)]"/>{toast}</div>}
    </div>);
}
