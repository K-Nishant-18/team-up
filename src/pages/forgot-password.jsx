import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    return (<main className="blueprint-dark grid min-h-screen place-items-center bg-ink p-7">
      <Link className="absolute top-7 left-[34px] font-mono text-[25px] font-bold text-paper no-underline max-[720px]:top-5 max-[720px]:left-5" to="/">
        <span className="text-orange">+</span>team<span className="text-orange">up</span>
      </Link>
      <section className="w-[min(460px,100%)] bg-paper p-[34px] shadow-[10px_10px_0_rgba(0,0,0,0.2)] max-[720px]:p-[25px]">
        <Link className="mb-[22px] inline-flex items-center gap-[7px] border-b border-line pb-0.5 font-mono text-[11px] text-ink no-underline" to="/login">
          <ArrowLeft size={15}/> Back to login
        </Link>
        {sent ? (<div>
            <Check size={28}/>
            <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-orange">CHECK YOUR INBOX</p>
            <h1 className="my-1 mb-3 font-mono text-[32px] leading-[1.05] font-bold tracking-[-2px]">
              Reset link sent.
            </h1>
            <p>We sent a password reset link to your email. It will stay active for 30 minutes.</p>
          </div>) : (<>
            <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-orange">ACCOUNT RECOVERY</p>
            <h1 className="my-1 mb-3 font-mono text-[32px] leading-[1.05] font-bold tracking-[-2px]">
              Forgot your password?
            </h1>
            <p>Enter the email attached to your TeamUp account and we&apos;ll send a reset link.</p>
            <label className="mb-[18px] grid gap-2 font-mono text-[11px] text-ink">
              Email address
              <input className="w-full border border-line bg-white/35 p-3 text-[13px] text-ink focus:outline-2 focus:outline-orange" type="email" placeholder="you@college.edu"/>
            </label>
            <button className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-2.5 py-2.5 font-mono text-xs text-paper no-underline transition-colors hover:border-orange hover:bg-orange disabled:cursor-not-allowed disabled:opacity-55" onClick={() => setSent(true)}>
              Send reset link <ArrowUpRight size={16}/>
            </button>
          </>)}
      </section>
    </main>);
}
