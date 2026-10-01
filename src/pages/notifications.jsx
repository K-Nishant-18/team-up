import { useState } from 'react';
import { Bell, Check, CheckCircle2, MessageCircle, UserPlus, XCircle } from 'lucide-react';
import { PlatformShell, SectionCard } from '@/components/platform-shell';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/use-fetch';
function iconFor(type) {
    switch (type) {
        case 'joinRequest': return UserPlus;
        case 'requestAccepted': return CheckCircle2;
        case 'requestRejected': return XCircle;
        case 'newMessage': return MessageCircle;
        default: return Bell;
    }
}
export default function NotificationsPage() {
    const { data: notes, loading, error } = useFetch(() => api.getNotifications(), []);
    const [toast, setToast] = useState('');
    async function markAllRead() {
        try {
            await api.markNotificationsRead();
            setToast('All notifications marked as read.');
            location.reload();
        }
        catch {
            setToast('Could not update notifications.');
        }
        window.setTimeout(() => setToast(''), 2600);
    }
    const unreadCount = (notes ?? []).filter((n) => !n.read).length;
    return (<PlatformShell title="Signal received" eyebrow="NOTIFICATIONS / 04">
      <div className="-mt-2 mb-5 flex items-center justify-between gap-3.5 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-[5px]">
        <p className="text-[13px] leading-[1.5] text-muted">Stay close to the conversations that move your projects forward.</p>
        <button className="flex items-center gap-[7px] border-0 bg-transparent px-3 pr-0 py-[9px] font-mono text-[11px] text-ink no-underline" onClick={markAllRead} disabled={unreadCount === 0}>Mark all as read</button>
      </div>
      <SectionCard>
        {loading && <p className="text-[13px] leading-[1.5] text-muted">Loading notifications…</p>}
        {error && <p className="mb-[18px] border border-[#e0a496] bg-[#f9e3dc] px-3 py-2.5 text-[12px] text-[#9b421e]">{error.message}</p>}
        {!loading && !error && notes && notes.length === 0 && (<p className="py-[22px] text-[13px] leading-[1.5] text-muted">No notifications yet. They will show up here as things move.</p>)}
        <div className="grid">
          {!loading && !error && (notes ?? []).map((note) => {
            const Icon = iconFor(note.type);
            return (<div className="flex items-start gap-[13px] border-b border-line py-[17px] last:border-b-0" key={note.id}>
                <span className="grid h-[34px] w-[34px] place-items-center bg-paper-deep text-orange"><Icon size={18}/></span>
                <div className="grid gap-1">
                  <strong>{note.message ?? 'Update'}</strong>
                  <p className="m-0 text-[12px] leading-[1.5] text-muted">{note.type ?? ''}</p>
                  <small className="text-[11px] text-muted">{note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</small>
                </div>
                {note.read ? <Check size={16}/> : <span className="ml-auto h-[7px] w-[7px] rounded-full bg-orange"/>}
              </div>);
        })}
        </div>
      </SectionCard>
      {toast && <div className="fixed right-[25px] bottom-[22px] z-[7] bg-ink px-4 py-[13px] text-[12px] text-paper shadow-[5px_5px_0_var(--color-orange)]"><span className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full bg-green shadow-[0_0_0_3px_rgba(95,125,103,0.14)]"/>{toast}</div>}
    </PlatformShell>);
}
