import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, Clock3, FolderKanban, Plus, Users } from 'lucide-react';
import { PageButton, PlatformShell, SectionCard } from '@/components/platform-shell';
import { api, formatDeadline, modeLabel } from '@/lib/api';
import { useFetch } from '@/lib/use-fetch';
import { getSavedIds } from '@/lib/saved';
function completeness(me) {
    if (!me)
        return 0;
    let filled = 0;
    const checks = [me.name, me.college, me.major, me.bio, me.location];
    checks.forEach((c) => c && filled++);
    if ((me.skills?.length ?? 0) > 0)
        filled++;
    if (me.links != null)
        filled++;
    if ((me.timeline?.length ?? 0) > 0)
        filled++;
    return Math.round((filled / 9) * 100);
}
export default function DashboardPage() {
    const { data: me } = useFetch(() => api.getMe(), []);
    const { data: myPosts } = useFetch(() => api.getMyPosts(), []);
    const { data: myRequests } = useFetch(() => api.getMyRequests(), []);
    const { data: received } = useFetch(() => api.getReceivedRequests(), []);
    const { data: notifications } = useFetch(() => api.getNotifications(), []);
    const { data: allPosts } = useFetch(() => api.getPosts(), []);
    const savedPosts = useMemo(() => {
        const ids = getSavedIds();
        if (ids.length === 0)
            return [];
        return (allPosts ?? []).filter((p) => ids.includes(p.id));
    }, [allPosts]);
    const activeProjects = (myPosts ?? []).filter((p) => p.status !== 'Completed' && p.status !== 'Closed').length;
    const acceptedRequestCount = (myRequests ?? []).filter((r) => r.status === 'accepted').length;
    const pct = completeness(me);
    const activity = [];
    (notifications ?? []).slice(0, 3).forEach((n) => {
        activity.push({
            title: n.message ?? 'You have a new update',
            time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recently',
        });
    });
    if (acceptedRequestCount > 0 && activity.length < 3) {
        activity.push({ title: 'You joined a new project workspace', time: 'Recently' });
    }
    return (<PlatformShell title="Your build board" eyebrow="DASHBOARD / 02">
      <div className="grid grid-cols-2 gap-[17px] max-[720px]:grid-cols-1">
        <SectionCard className="bg-ink text-paper">
          <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-[#8290a3]">YOUR MOMENTUM</p>
          <div className="flex flex-wrap gap-7">
            <div className="grid gap-[5px]"><strong className="font-mono text-[34px] font-bold text-orange">{String(activeProjects).padStart(2, '0')}</strong><span className="text-[13px] leading-[1.5] text-muted">active projects</span></div>
            <div className="grid gap-[5px]"><strong className="font-mono text-[34px] font-bold text-orange">{String(acceptedRequestCount).padStart(2, '0')}</strong><span className="text-[13px] leading-[1.5] text-muted">connections made</span></div>
            <div className="grid gap-[5px]"><strong className="font-mono text-[34px] font-bold text-orange">{pct}%</strong><span className="text-[13px] leading-[1.5] text-muted">profile complete</span></div>
          </div>
          <div className="my-6 mb-[18px] h-px bg-[#3d4a65]"/>
          <p className="text-[13px] leading-[1.5] text-[#b7bfca]">You are one thoughtful introduction away from your next great collaboration.</p>
          <PageButton href="/profile">Complete your profile <Plus size={15}/></PageButton>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between gap-3.5"><h2 className="font-mono text-lg font-bold">Recent activity</h2><Clock3 size={17}/></div>
          <div className="grid">
            {activity.length === 0 && <p className="py-[17px] text-[13px] leading-[1.5] text-muted">Nothing yet. Explore the board to get moving.</p>}
            {activity.map((item, i) => (<div className="flex items-center gap-[13px] border-b border-line py-[17px] last:border-b-0" key={`${item.title}-${i}`}>
                <span className="font-mono text-[11px] text-orange">0{i + 1}</span>
                <div className="grid gap-1"><strong>{item.title}</strong><span className="last:text-[11px] last:text-muted">{item.time}</span></div>
              </div>))}
          </div>
        </SectionCard>

        <SectionCard className="col-span-full">
          <div className="flex items-center justify-between gap-3.5">
            <h2 className="font-mono text-lg font-bold">Your requests</h2>
            <span className="inline-flex items-center gap-[7px] border border-line px-2 py-[5px] font-mono text-[10px] text-[#45624c]">{received?.length ?? 0} pending</span>
          </div>
          <div className="grid">
            {(received ?? []).length === 0 && <p className="py-[17px] text-[13px] leading-[1.5] text-muted">No requests waiting on you. Respond from each post's page.</p>}
            {(received ?? []).slice(0, 4).map((req) => (<div className="flex items-center gap-[13px] border-b border-line py-[17px] last:border-b-0" key={req.id}>
                <div>{req.status === 'accepted' ? <CheckCircle2 size={20}/> : <Clock3 size={20}/>}</div>
                <div className="grid gap-1">
                  <strong>{req.requester?.name ?? 'Someone'} wants to join</strong>
                  <span className="text-[11px] text-muted">{req.post?.title ?? 'Your post'}{req.role ? ` · ${req.role}` : ''}</span>
                  <small className="text-[11px] text-muted">{req.message ?? 'See the post to review.'}</small>
                </div>
                <span className={`px-[7px] py-[5px] font-mono text-[10px] whitespace-nowrap ${(req.status ?? 'pending') === 'pending' ? 'bg-[#f4c4a7] text-[#9b421e]' : (req.status ?? 'pending') === 'accepted' ? 'bg-[#cbd9c5] text-[#45624c]' : ''}`}>{req.status ?? 'pending'}</span>
              </div>))}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between gap-3.5"><h2 className="font-mono text-lg font-bold">Your posts</h2><Users size={17}/></div>
          <div className="grid">
            {(myPosts ?? []).length === 0 && <p className="py-[17px] text-[13px] leading-[1.5] text-muted">You have not created a post yet.</p>}
            {(myPosts ?? []).slice(0, 4).map((p) => (<div className="flex items-center gap-[13px] border-b border-line py-[17px] last:border-b-0" key={p.id}>
                <span className="font-mono text-[11px] text-orange">{String(p.id).padStart(2, '0')}</span>
                <div className="grid gap-1"><strong>{p.title}</strong><span className="last:text-[11px] last:text-muted">{modeLabel(p.mode)} · {formatDeadline(p.deadline) || 'Open'} · {p.status}</span><Link className="mt-[2px] inline-flex items-center gap-[5px] font-mono text-[11px] text-ink no-underline" to={`/posts/${p.id}`}>View post</Link></div>
              </div>))}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center justify-between gap-3.5"><h2 className="font-mono text-lg font-bold">You have joined</h2><CheckCircle2 size={17}/></div>
          <div className="grid">
            {(myRequests ?? []).filter((r) => r.status === 'accepted').length === 0 && <p className="py-[17px] text-[13px] leading-[1.5] text-muted">You are not part of a team yet.</p>}
            {(myRequests ?? []).filter((r) => r.status === 'accepted').map((r) => (<div className="flex items-center gap-[13px] border-b border-line py-[17px] last:border-b-0" key={r.id}>
                <span className="font-mono text-[11px] text-orange"><CheckCircle2 size={16}/></span>
                <div className="grid gap-1"><strong>{r.post?.title ?? 'Project'}</strong><span className="last:text-[11px] last:text-muted">{r.role ?? 'Member'}</span><Link className="mt-[2px] inline-flex items-center gap-[5px] font-mono text-[11px] text-ink no-underline" to={`/posts/${r.post?.id}`}>Open workspace</Link></div>
              </div>))}
          </div>
        </SectionCard>

        <SectionCard className="col-span-full" id="saved">
          <div className="flex items-center justify-between gap-3.5"><h2 className="font-mono text-lg font-bold">Saved posts</h2><Bookmark size={17}/></div>
          {savedPosts.length === 0 && <p className="pt-5 text-[13px] leading-[1.5] text-muted">Nothing saved yet. Bookmark posts to keep them here.</p>}
          {savedPosts.map((p) => (<div className="flex items-center gap-3.5 pt-6" key={p.id}>
              <FolderKanban size={22}/>
              <div className="grid flex-1 gap-[5px]"><strong>{p.title}</strong><span className="text-[12px] text-muted">{(p.creator?.college ?? 'Student team')} · {p.status === 'Open' ? 'Open' : p.status} · Saved</span></div>
              <PageButton href={`/posts/${p.id}`}>View post <Users size={15}/></PageButton>
            </div>))}
        </SectionCard>
      </div>
    </PlatformShell>);
}
