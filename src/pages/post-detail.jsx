import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, CheckCircle2, MessageSquare, Send, X, } from 'lucide-react';
import { Avatar, PlatformShell, SectionCard } from '@/components/platform-shell';
import { api, categoryLabel, colorFor, formatDeadline, initialsOf, modeLabel } from '@/lib/api';
import { useFetch } from '@/lib/use-fetch';
export default function PostDetailPage() {
    const params = useParams();
    const id = params.id ?? '';
    const { data: post, loading } = useFetch(() => (id ? api.getPost(id) : Promise.reject(new Error('Missing id'))), [id]);
    const { data: me } = useFetch(() => api.getMe(), []);
    const { data: myRequests } = useFetch(() => api.getMyRequests(), []);
    const { data: comments, loading: commentsLoading } = useFetch(() => (id ? api.getComments(id) : Promise.reject(new Error())), [id]);
    const { data: incoming } = useFetch(() => (post && me && post.creator?.id === me.id && id ? api.getPostRequests(id) : Promise.resolve([])), [post, me, id]);
    const [showJoin, setShowJoin] = useState(false);
    const [role, setRole] = useState('');
    const [message, setMessage] = useState('');
    const [joining, setJoining] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [posting, setPosting] = useState(false);
    const [toast, setToast] = useState('');
    const [requests, setRequests] = useState(null);
    const notify = (text) => { setToast(text); window.setTimeout(() => setToast(''), 2600); };
    const isCreator = Boolean(me && post && post.creator?.id === me.id);
    const pendingRequests = (requests ?? incoming ?? []).filter((r) => r.status === 'pending');
    const alreadyApplied = (myRequests ?? []).some((r) => r.post?.id === post?.id && (r.status === 'pending' || r.status === 'accepted'));
    if (loading) {
        return <PlatformShell title="Loading…" eyebrow="OPPORTUNITY"><p className="text-[13px] leading-[1.5] text-muted">Loading this opportunity…</p></PlatformShell>;
    }
    if (!post) {
        return (<PlatformShell title="Not found" eyebrow="OPPORTUNITY">
        <Link to="/posts" className="mb-[22px] inline-flex items-center gap-[7px] border-b border-line pb-0.5 font-mono text-[11px] text-ink no-underline"><ArrowLeft size={15}/> Back to all opportunities</Link>
        <p className="text-[13px] leading-[1.5] text-muted">This opportunity could not be found.</p>
      </PlatformShell>);
    }
    const roles = post.rolesRequired ?? [];
    const tags = roles.flatMap((r) => r.skills ?? []);
    const openSpots = roles.reduce((sum, r) => sum + (r.count ?? 0), 0);
    const creatorName = post.creator?.name ?? 'Anonymous';
    async function submitJoin() {
        setJoining(true);
        try {
            await api.submitJoinRequest(id, { role, message });
            setShowJoin(false);
            notify('Your join request was sent to the project owner.');
        }
        catch (err) {
            notify(err instanceof Error ? err.message : 'Could not send request');
        }
        finally {
            setJoining(false);
        }
    }
    async function submitComment() {
        if (!commentText.trim() || posting)
            return;
        setPosting(true);
        try {
            await api.addComment(id, commentText);
            setCommentText('');
            notify('Comment posted.');
        }
        catch (err) {
            notify(err instanceof Error ? err.message : 'Could not post comment');
        }
        finally {
            setPosting(false);
        }
    }
    async function respond(requestId, action) {
        try {
            await api.respondToRequest(id, requestId, action);
            setRequests((prev) => (prev ?? incoming ?? []).map((r) => r.id === requestId ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r));
            notify(action === 'accept' ? 'Member added to the team.' : 'Request declined.');
        }
        catch (err) {
            notify(err instanceof Error ? err.message : 'Could not respond');
        }
    }
    return (<PlatformShell title={post.title} eyebrow={`OPPORTUNITY / ${categoryLabel(post.category)}`}>
      <Link to="/posts" className="mb-[22px] inline-flex items-center gap-[7px] border-b border-line pb-0.5 font-mono text-[11px] text-ink no-underline"><ArrowLeft size={15}/> Back to all opportunities</Link>
      <div className="grid grid-cols-[1fr_300px] items-start gap-[17px] max-[720px]:grid-cols-1">
        <div className="grid gap-[17px]">
          <SectionCard>
            <div className="mb-[22px] flex items-center justify-between gap-2.5">
              <span className="inline-block bg-[#f4c4a7] px-[7px] py-[5px] font-mono text-[10px] tracking-[0.6px] text-[#9b421e]">{categoryLabel(post.category)}</span>
              <span className="inline-flex items-center gap-[7px] border border-line px-2 py-[5px] font-mono text-[10px] text-[#45624c]"><span className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full bg-green shadow-[0_0_0_3px_rgba(95,125,103,0.14)]"/> {post.status?.toUpperCase() ?? 'OPEN'}</span>
            </div>
            <p className="mb-[18px] max-w-[720px] font-mono text-[22px] leading-[1.35] font-bold tracking-[-1px]">{post.description}</p>
            <div className="grid grid-cols-3 gap-3.5 border-t border-line pt-5 max-[720px]:grid-cols-1">
              <div className="flex items-start gap-[9px] font-mono text-[10px] tracking-[0.4px] text-muted"><CalendarDays size={16} className="shrink-0 text-orange"/><span className="grid gap-1">Apply by<strong className="text-[13px] tracking-normal text-ink">{formatDeadline(post.deadline) || 'Open'}</strong></span></div>
              <div className="flex items-start gap-[9px] font-mono text-[10px] tracking-[0.4px] text-muted"><span className="grid gap-1">FORMAT<strong className="text-[13px] tracking-normal text-ink">{modeLabel(post.mode)}</strong></span></div>
              <div className="flex items-start gap-[9px] font-mono text-[10px] tracking-[0.4px] text-muted"><span className="grid gap-1">OPEN SPOTS<strong className="text-[13px] tracking-normal text-ink">{openSpots}</strong></span></div>
            </div>
          </SectionCard>

          {roles.length > 0 && (<SectionCard>
              <div className="flex items-center justify-between gap-3.5"><h2 className="font-mono text-lg font-bold">Roles we need</h2><span className="mb-4 font-mono text-[10px] tracking-[1.4px] text-[#8290a3]">{String(openSpots).padStart(2, '0')} SPOTS OPEN</span></div>
              <div className="grid">
                {roles.map((roleRow, i) => (<div className="flex items-center justify-between gap-3.5 border-b border-line py-4 last:border-b-0 max-[720px]:flex-col max-[720px]:items-start" key={`${roleRow.roleName}-${i}`}>
                    <div className="grid gap-1"><strong className="text-sm">{roleRow.roleName ?? 'Role'}</strong><span className="text-[11px] text-muted">Count {roleRow.count ?? 1}</span></div>
                    {(roleRow.skills ?? []).length > 0 && (<div className="flex flex-wrap gap-[5px]">{(roleRow.skills ?? []).map((skill, j) => <span className="border border-[#c7c4bb] px-[7px] py-[5px] font-mono text-[10px] text-[#57605f]" key={`${skill}-${j}`}>{skill}</span>)}</div>)}
                  </div>))}
              </div>
            </SectionCard>)}

          {post.creator && (<SectionCard>
              <div className="flex items-center justify-between gap-3.5"><h2 className="font-mono text-lg font-bold">Posted by</h2></div>
              <div className="flex items-center justify-start gap-3.5 max-[720px]:flex-wrap max-[720px]:items-start">
                <Avatar initials={initialsOf(creatorName)} color={colorFor(creatorName)}/>
                <div className="grid min-w-0 gap-[3px] flex-1"><strong>{creatorName}</strong><span className="mb-1 flex items-center gap-[5px] text-[12px] text-muted">{post.creator.college ?? 'Student team'}</span></div>
              </div>
            </SectionCard>)}

          <SectionCard>
            <div className="flex items-center justify-between gap-3.5"><h2 className="font-mono text-lg font-bold">Discussion</h2><MessageSquare size={17}/></div>
            <div className="mt-3.5 grid">
              {commentsLoading && <p className="text-[13px] leading-[1.5] text-muted">Loading comments…</p>}
              {!commentsLoading && comments && comments.length === 0 && <p className="text-[13px] leading-[1.5] text-muted">No comments yet. Start the conversation.</p>}
              {!commentsLoading && comments?.map((comment) => (<div className="flex gap-[11px] border-b border-line py-3.5 last:border-b-0" key={comment.id}>
                  <Avatar initials={initialsOf(comment.author?.name)} color={colorFor(comment.author?.name)} small/>
                  <div className="grid min-w-0 gap-1"><strong className="text-[13px]">{comment.author?.name ?? 'Someone'}</strong><p className="text-[13px] leading-[1.5] text-[#4f575b]">{comment.body}</p><small className="text-[11px] text-muted">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</small></div>
                </div>))}
            </div>
            <div className="mt-4 grid gap-2.5">
              <textarea className="min-h-[74px] w-full resize-y border border-line bg-white/30 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Ask a question or start a discussion…"/>
              <button className="flex items-center justify-center gap-2 border border-ink bg-ink px-3 py-[9px] font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55 justify-self-end" onClick={submitComment} disabled={posting || !commentText.trim()}><Send size={15}/> Post</button>
            </div>
          </SectionCard>
        </div>

        <aside className="sticky top-6 max-[720px]:static">
          {isCreator ? (<SectionCard>
              <h3 className="mb-2 font-mono text-lg font-bold">Requests to join</h3>
              <p className="text-[13px] leading-[1.5] text-muted">People waiting to build with you on this post.</p>
              {pendingRequests.length === 0 ? (<p className="text-[13px] leading-[1.5] text-muted" style={{ marginTop: 14 }}>No pending requests right now.</p>) : (<div className="grid" style={{ marginTop: 10 }}>
                  {pendingRequests.map((req) => (<div className="flex items-center gap-[13px] border-b border-line py-[17px] last:border-b-0" key={req.id}>
                      <div className="grid gap-1">
                        <strong>{req.requester?.name ?? 'Someone'}</strong>
                        {req.role && <span className="text-[11px] text-muted">Role: {req.role}</span>}
                        {req.message && <p className="text-[13px] leading-[1.5] text-muted" style={{ fontSize: 12 }}>{req.message}</p>}
                      </div>
                      <div className="flex shrink-0 gap-[7px]">
                        <button className="grid h-[34px] w-[34px] place-items-center border border-line bg-transparent text-green hover:border-ink hover:bg-ink hover:text-paper" aria-label="Accept request" onClick={() => respond(req.id, 'accept')}><Check size={15}/></button>
                        <button className="grid h-[34px] w-[34px] place-items-center border border-line bg-transparent text-orange hover:border-ink hover:bg-ink hover:text-paper" aria-label="Reject request" onClick={() => respond(req.id, 'reject')}><X size={15}/></button>
                      </div>
                    </div>))}
                </div>)}
              <Link className="inline-flex items-center gap-[5px] font-mono text-[11px] text-ink no-underline" style={{ marginTop: 14 }} to="/dashboard">Open your build board <ArrowUpRight size={13}/></Link>
            </SectionCard>) : (<SectionCard>
              <h3 className="mb-2 font-mono text-lg font-bold">Want in on this?</h3>
              <p className="text-[13px] leading-[1.5] text-muted">Tell {creatorName.split(' ')[0]} why you would be a good fit for this build.</p>
              {alreadyApplied ? (<button className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-2.5 py-2.5 font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55" disabled><CheckCircle2 size={16}/> Request sent</button>) : (<button className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-2.5 py-2.5 font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55" onClick={() => setShowJoin(true)}>Request to join <Send size={16}/></button>)}
              {tags.length > 0 && (<div className="flex flex-wrap gap-[5px] border-b-0 pb-0" style={{ marginTop: 18 }}>
                  {tags.map((tag, i) => <span className="border border-[#c7c4bb] px-[7px] py-[5px] font-mono text-[10px] text-[#57605f]" key={`${tag}-${i}`}>{tag}</span>)}
                </div>)}
            </SectionCard>)}
        </aside>
      </div>

      {showJoin && (<div className="fixed inset-0 z-[5] grid place-items-center bg-ink/[0.72] p-5" onClick={() => setShowJoin(false)}>
          <div className="relative w-[min(490px,100%)] bg-paper p-8 shadow-[10px_10px_0_rgba(0,0,0,0.2)]" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-[15px] right-[15px] border-0 bg-transparent text-ink" onClick={() => setShowJoin(false)}><X size={18}/></button>
            <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-orange">JOIN REQUEST / {String(post.id).padStart(2, '0')}</p>
            <h2 className="my-[5px] mb-2.5 font-mono text-[25px] leading-[1.1] font-bold">{post.title}</h2>
            <p className="text-[14px] leading-[1.5] text-muted">Tell {creatorName.split(' ')[0]} why you would be a good fit for this build.</p>
            <label className="mb-2.5 mt-3 grid gap-1.5 text-[13px] text-muted">
              Role you are applying for
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-line bg-white/30 p-2.5 text-[13px] text-ink focus:outline-2 focus:outline-orange">
                <option value="">Choose a role…</option>
                {roles.map((r, i) => <option key={`${r.roleName}-${i}`} value={r.roleName ?? ''}>{r.roleName ?? 'Role'}</option>)}
              </select>
            </label>
            <textarea className="my-3 mb-4 min-h-[130px] w-full resize-y border border-line bg-white/30 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A short note about your skills, availability, or what excites you…"/>
            <button className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-2.5 py-2.5 font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55" onClick={submitJoin} disabled={joining}>Send request <Send size={16}/></button>
          </div>
        </div>)}

      {toast && <div className="fixed right-[25px] bottom-[22px] z-[7] bg-ink px-4 py-[13px] text-[12px] text-paper shadow-[5px_5px_0_var(--color-orange)]"><span className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full bg-green shadow-[0_0_0_3px_rgba(95,125,103,0.14)]"/>{toast}</div>}
    </PlatformShell>);
}
