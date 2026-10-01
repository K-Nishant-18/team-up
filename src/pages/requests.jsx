import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, CheckCircle2, Clock3, X } from 'lucide-react';
import { PlatformShell, SectionCard } from '@/components/platform-shell';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/use-fetch';
export default function RequestsPage() {
    const [tab, setTab] = useState('sent');
    const [toast, setToast] = useState('');
    const { data: sent, loading } = useFetch(() => api.getMyRequests(), []);
    const { data: received, loading: receivedLoading } = useFetch(() => api.getReceivedRequests(), []);
    const notify = (text) => { setToast(text); window.setTimeout(() => setToast(''), 2600); };
    async function respond(req, action) {
        if (!req.post?.id)
            return;
        try {
            await api.respondToRequest(req.post.id, req.id, action);
            notify(action === 'accept' ? 'Member added.' : 'Request declined.');
        }
        catch {
            notify('Could not respond.');
        }
    }
    const activeSent = useMemo(() => (sent ?? []).filter((r) => r.status === 'pending'), [sent]);
    const sentCount = (sent ?? []).length;
    const receivedCount = (received ?? []).filter((r) => r.status === 'pending').length;
    return (<PlatformShell title="Your requests" eyebrow="REQUESTS / 03">
      <div className="mb-[18px] flex gap-5 border-b border-line">
        <button className={`border-0 bg-transparent pb-3 font-mono text-[12px] ${tab === 'sent' ? 'border-b-2 border-orange text-ink' : 'text-muted'}`} onClick={() => setTab('sent')}>Sent <span className="ml-[5px] text-orange">{String(sentCount).padStart(2, '0')}</span></button>
        <button className={`border-0 bg-transparent pb-3 font-mono text-[12px] ${tab === 'received' ? 'border-b-2 border-orange text-ink' : 'text-muted'}`} onClick={() => setTab('received')}>Received <span className="ml-[5px] text-orange">{String(receivedCount).padStart(2, '0')}</span></button>
      </div>

      {tab === 'sent' && (<SectionCard>
          {!loading && (sent ?? []).length === 0 && <p className="py-[22px] text-[13px] leading-[1.5] text-muted">You have not applied to anything yet. Browse the board to get started.</p>}
          <div className="grid">
            {(sent ?? []).map((item) => (<div className="flex items-center gap-[13px] border-b border-line py-[17px] last:border-b-0" key={item.id}>
                <div>{item.status === 'accepted' ? <CheckCircle2 size={20}/> : item.status === 'rejected' ? <X size={20}/> : <Clock3 size={20}/>}</div>
                <div className="grid gap-1">
                  <strong>{item.post?.title ?? 'Post'}</strong>
                  <span className="text-[11px] text-muted">{item.role ?? 'Member'} · to {item.post?.creator?.name ?? 'the owner'}</span>
                  <small className="text-[11px] text-muted">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</small>
                </div>
                <span className={`px-[7px] py-[5px] font-mono text-[10px] whitespace-nowrap ${(item.status ?? 'pending') === 'pending' ? 'bg-[#f4c4a7] text-[#9b421e]' : (item.status ?? 'pending') === 'accepted' ? 'bg-[#cbd9c5] text-[#45624c]' : ''}`}>{item.status ?? 'pending'}</span>
                {item.post && <Link className="flex items-center gap-[7px] border border-line bg-transparent px-3 py-[9px] font-mono text-[11px] text-ink no-underline" aria-label="Open post" to={`/posts/${item.post.id}`}><ArrowUpRight size={17}/></Link>}
              </div>))}
          </div>
        </SectionCard>)}

      {tab === 'received' && (<SectionCard>
          {!receivedLoading && receivedCount === 0 && <p className="py-[22px] text-[13px] leading-[1.5] text-muted">No pending requests on your posts right now.</p>}
          <div className="grid">
            {(received ?? []).filter((r) => r.status === 'pending').map((item) => (<div className="flex items-center gap-[13px] border-b border-line py-[17px] last:border-b-0" key={item.id}>
                <div><Clock3 size={20}/></div>
                <div className="grid gap-1">
                  <strong>{item.requester?.name ?? 'Someone'} wants to join</strong>
                  <span className="text-[11px] text-muted">{item.post?.title}{item.role ? ` · ${item.role}` : ''}</span>
                  {item.message && <small className="text-[11px] text-muted">{item.message}</small>}
                </div>
                <div className="flex shrink-0 gap-[7px]">
                  <button className="grid h-[34px] w-[34px] place-items-center border border-line bg-transparent text-green hover:border-ink hover:bg-ink hover:text-paper" aria-label="Accept request" onClick={() => respond(item, 'accept')}><Check size={15}/></button>
                  <button className="grid h-[34px] w-[34px] place-items-center border border-line bg-transparent text-orange hover:border-ink hover:bg-ink hover:text-paper" aria-label="Reject request" onClick={() => respond(item, 'reject')}><X size={15}/></button>
                </div>
              </div>))}
          </div>
        </SectionCard>)}

      <p className="flex items-center gap-[7px] text-[12px] text-muted"><X size={15}/> You can withdraw or respond to requests from within each project.</p>
      {toast && <div className="fixed right-[25px] bottom-[22px] z-[7] bg-ink px-4 py-[13px] text-[12px] text-paper shadow-[5px_5px_0_var(--color-orange)]"><span className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full bg-green shadow-[0_0_0_3px_rgba(95,125,103,0.14)]"/>{toast}</div>}
    </PlatformShell>);
}
