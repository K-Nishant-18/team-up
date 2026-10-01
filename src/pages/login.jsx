import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api, setToken } from '@/lib/api';
export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { accessToken } = await api.login(email, password);
            setToken(accessToken);
            navigate('/posts');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Sign in failed');
            setSubmitting(false);
        }
    }
    return (<main className="blueprint-dark grid min-h-screen place-items-center bg-ink p-7">
      <div className="absolute top-7 left-[34px] font-mono text-[25px] font-bold text-paper max-[720px]:top-5 max-[720px]:left-5">
        <span className="text-orange">+</span> team<span className="text-orange">up</span>
        <small className="ml-8 block font-sans text-[9px] tracking-[2px] text-[#aeb8c2]">
          BUILD TOGETHER
        </small>
      </div>
      <section className="w-[min(460px,100%)] bg-paper p-[34px] shadow-[10px_10px_0_rgba(0,0,0,0.2)] max-[720px]:p-[25px]">
        <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-orange">WELCOME BACK / 01</p>
        <h1 className="my-1 mb-3 font-mono text-[32px] leading-[1.05] font-bold tracking-[-2px]">
          Pick up where you left off.
        </h1>
        <p className="mb-[25px] text-[13px] leading-[1.5] text-muted">
          Your next good collaboration is probably closer than you think.
        </p>
        {error && (<p className="mb-[18px] border border-[#e0a496] bg-[#f9e3dc] px-3 py-2.5 text-[12px] text-[#9b421e]">
            {error}
          </p>)}
        <form onSubmit={handleSubmit}>
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            Email address
            <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </label>
          <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
            Password
            <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </label>
          <button className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-2.5 py-2.5 font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : <>Sign in <ArrowRight size={16}/></>}
          </button>
        </form>
        <p className="text-center text-[12px] text-muted">
          New to TeamUp?{' '}
          <Link className="font-bold text-orange no-underline" to="/signup">
            Create an account
          </Link>
        </p>
        <p className="mt-5 text-center font-mono text-[10px] text-muted">
          Demo login: samira@teamup.dev / teamup-demo-2026
        </p>
      </section>
    </main>);
}
