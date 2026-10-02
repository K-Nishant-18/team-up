import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isDemoMode } from '@/lib/demo-data';
import { Bell, Bookmark, Compass, LayoutDashboard, Plus, Send, Users, UserRoundSearch } from 'lucide-react';
const items = [
    { label: 'Discover', href: '/posts', icon: Compass },
    { label: 'My dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My requests', href: '/requests', icon: Send },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'My teams', href: '/teams', icon: Users },
    { label: 'People', href: '/profiles', icon: UserRoundSearch },
];
export function Avatar({ initials, color = '#c65d3d', small = false, }) {
    return (<span className={`inline-flex shrink-0 items-center justify-center rounded-full border-paper font-mono font-bold text-paper ${small ? 'h-[29px] w-[29px] border text-[9px]' : 'h-[37px] w-[37px] border-2 text-[11px]'}`} style={{ backgroundColor: color }}>
      {initials}
    </span>);
}
export function PlatformShell({ children, title, eyebrow, }) {
    const { pathname } = useLocation();
    const [demo, setDemo] = useState(isDemoMode());
    useEffect(() => {
        const onDemo = (e) => setDemo(Boolean(e.detail));
        window.addEventListener('teamup:demo-mode', onDemo);
        return () => window.removeEventListener('teamup:demo-mode', onDemo);
    }, []);
    return (<div className="blueprint min-h-screen bg-paper">
      <header className="flex h-[76px] items-center justify-between bg-ink px-11 text-paper max-[720px]:h-[68px] max-[720px]:px-[18px]">
        <Link to="/" className="grid grid-cols-[25px_auto] grid-rows-[28px_12px] items-center gap-x-[7px] font-mono text-2xl leading-none font-bold tracking-[-1.5px] max-[720px]:text-xl">
          <span className="text-[30px] font-normal text-orange">+</span>
          <span>
            team<span className="text-orange">up</span>
          </span>
          <small className="col-start-2 font-sans text-[9px] tracking-[2px] text-[#aeb8c2]">
            BUILD TOGETHER
          </small>
        </Link>
        <div className="flex items-center gap-[26px] max-[720px]:gap-2.5">
          <Link to="/create-post" className="flex items-center gap-2 border border-orange bg-orange px-3.5 py-2.5 font-mono text-xs font-bold text-paper max-[720px]:px-[9px]">
            <Plus size={17}/>
            <span className="max-[720px]:hidden">Create a post</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-2 border-l border-[#4b5872] pl-5 text-[13px] text-paper max-[720px]:border-l-0 max-[720px]:pl-2">
            <Avatar initials="SN" small/>
            <span className="max-[720px]:hidden">Samira N.</span>
          </Link>
        </div>
      </header>
      <div className="h-[5px] bg-orange"/>
      <div className="mx-auto grid max-w-[1540px] grid-cols-[254px_1fr] max-[720px]:block">
        <aside className="min-h-[calc(100vh-81px)] bg-ink/97 text-paper max-[720px]:fixed max-[720px]:top-[73px] max-[720px]:bottom-0 max-[720px]:left-[-270px] max-[720px]:z-10 max-[720px]:w-[254px] max-[1050px]:w-[210px]">
          <div className="flex min-h-[calc(100vh-81px)] flex-col px-[23px] pt-[39px] pb-6">
            <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-[#8290a3]">WORKSPACE / 01</p>
            <nav>
              {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (<Link key={item.href} to={item.href} className={`mb-[3px] flex w-full items-center gap-[13px] px-2.5 py-3 text-[13px] transition-colors hover:bg-[#263553] hover:text-paper ${active
                    ? 'bg-[#263553] text-paper shadow-[inset_3px_0_var(--color-orange)]'
                    : 'text-[#c8cfda]'}`}>
                    <Icon size={18}/>
                    <span>{item.label}</span>
                    {item.label === 'Notifications' && (<b className="ml-auto min-w-5 bg-orange px-[3px] py-[3px] text-center font-mono text-[10px] font-normal text-paper">
                        3
                      </b>)}
                  </Link>);
        })}
            </nav>
            <div className="my-[25px] h-px bg-[#33415e]"/>
            <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-[#8290a3]">YOUR SPACE</p>
            <Link to="/teams" className="mb-[3px] flex w-full items-center gap-[13px] px-2.5 py-3 text-[13px] text-[#c8cfda] transition-colors hover:bg-[#263553] hover:text-paper">
              <Users size={18}/>
              <span>My teams</span>
            </Link>
            <Link to="/dashboard#saved" className="mb-[3px] flex w-full items-center gap-[13px] px-2.5 py-3 text-[13px] text-[#c8cfda] transition-colors hover:bg-[#263553] hover:text-paper">
              <Bookmark size={18}/>
              <span>Saved posts</span>
            </Link>
            <div className="mt-auto">
              <div className="flex items-center gap-2.5 border-y border-[#33415e] py-3.5">
                <Avatar initials="SN"/>
                <div className="grid min-w-0 gap-[3px]">
                  <strong className="text-xs">Samira N.</strong>
                  <span className="text-[10px] text-[#a4adba]">IIIT Hyderabad · Year 3</span>
                </div>
              </div>
              <div className="pt-[22px]">
                <div className="flex justify-between font-mono text-[9px] text-[#9daabd]">
                  <span>PROFILE COMPLETENESS</span>
                  <strong className="text-orange">72%</strong>
                </div>
                <div className="my-[9px] h-[5px] bg-[#34425d]">
                  <span className="block h-full bg-orange" style={{ width: '72%' }}/>
                </div>
                <small className="text-[10px] text-[#79879a]">Add a portfolio link to reach 80%</small>
              </div>
            </div>
          </div>
        </aside>
        <main className="w-full max-w-[1240px] px-[58px] pt-[55px] pb-[25px] max-[1050px]:px-[30px] max-[1050px]:pt-[45px] max-[720px]:px-[18px] max-[720px]:pt-[34px] max-[720px]:pb-5">
          <p className="mb-4 font-mono text-[10px] tracking-[1.4px] text-orange">
            {eyebrow ?? 'TEAMUP / WORKSPACE'}
          </p>
          <h1 className="mb-7 font-mono text-[length:clamp(36px,5vw,58px)] leading-[0.98] font-bold tracking-[-3px]">
            {title}
          </h1>
          {children}
        </main>
      </div>
      {demo && (<div role="status" className="fixed bottom-4 left-4 z-20 border border-line bg-paper-deep px-3 py-2 font-mono text-[10px] tracking-[0.8px] text-muted shadow-[3px_3px_0_rgba(0,0,0,0.12)]">
          DEMO DATA // BACKEND OFFLINE
        </div>)}
    </div>);
}
export function SectionCard({ children, className = '', id, }) {
    return (<section id={id} className={`border border-line bg-[rgba(250,247,239,0.88)] p-6 max-[720px]:p-[18px] ${className}`}>
      {children}
    </section>);
}
export function PageButton({ children, href = '#' }) {
    return (<Link className="flex w-auto items-center justify-center gap-2 border border-ink bg-ink px-3 py-[9px] font-mono text-xs text-paper transition-colors hover:border-orange hover:bg-orange" to={href}>
      {children}
    </Link>);
}
