// Offline demo store.
// Used ONLY when the backend cannot be reached (connection refused / offline),
// so the site still feels alive with realistic data. When the real server
// responds, none of this code runs.

const now = Date.now();
const DAY = 86400000;
const ago = (d) => new Date(now - d * DAY).toISOString();
const ahead = (d) => new Date(now + d * DAY).toISOString();

const FLAG_KEY = 'teamup_demo';
const STORE_KEY = 'teamup_demo_store';
let demoActive = false;

function readFlag() {
    try {
        if (typeof sessionStorage !== 'undefined')
            return sessionStorage.getItem(FLAG_KEY) === '1';
    }
    catch { /* private mode */ }
    return demoActive;
}
export function isDemoMode() {
    return readFlag();
}
function dispatchDemo(active) {
    if (typeof window !== 'undefined')
        window.dispatchEvent(new CustomEvent('teamup:demo-mode', { detail: active }));
}
export function markDemoMode() {
    if (readFlag())
        return;
    demoActive = true;
    try {
        if (typeof sessionStorage !== 'undefined')
            sessionStorage.setItem(FLAG_KEY, '1');
    }
    catch { /* private mode */ }
    dispatchDemo(true);
}
export function clearDemoMode() {
    if (!readFlag() && !demoActive)
        return;
    demoActive = false;
    try {
        if (typeof sessionStorage !== 'undefined')
            sessionStorage.removeItem(FLAG_KEY);
    }
    catch { /* private mode */ }
    dispatchDemo(false);
}

class DemoError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const clone = (x) => (typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x)));

// ---------------------------------------------------------------- seed users
const store = {
    users: [
        {
            id: 1, name: 'Aarav Mehta', email: 'aarav@teamup.dev', password: 'x',
            college: 'IIT Bombay', major: 'Computer Science', year: '4',
            bio: 'Full-stack builder. I turn weekend ideas into working products and care a lot about fast, accessible UIs.',
            location: 'Mumbai', availability: 'lookingForTeammates',
            skills: [{ skill: 'React', proficiency: 'Advanced' }, { skill: 'TypeScript', proficiency: 'Advanced' }, { skill: 'Node.js', proficiency: 'Intermediate' }],
            interests: ['Food waste', 'Marketplaces', 'Edtech'],
            links: { github: 'https://github.com/aaravbuilds', linkedin: 'https://linkedin.com/in/aaravbuilds', portfolio: 'https://aarav.dev', resumeUrl: null },
            timeline: [{ type: 'project', title: 'Campus marketplaces', role: 'Founding engineer', date: ago(120), project: null }],
            verified: true, role: 'student', createdAt: ago(400), updatedAt: ago(30),
        },
        {
            id: 2, name: 'Maya Iyer', email: 'maya@teamup.dev', password: 'x',
            college: 'VIT Vellore', major: 'Interaction Design', year: '2',
            bio: 'Design-minded frontend developer. I prototype fast, then harden the details: motion, contrast, empty states.',
            location: 'Vellore', availability: 'openToJoin',
            skills: [{ skill: 'Figma', proficiency: 'Advanced' }, { skill: 'UX Research', proficiency: 'Intermediate' }, { skill: 'React', proficiency: 'Intermediate' }],
            interests: ['Open source', 'Civic tech'],
            links: { github: 'https://github.com/mayaiyer', linkedin: 'https://linkedin.com/in/mayaiyer', portfolio: 'https://maya.design', resumeUrl: null },
            timeline: [{ type: 'hackathon', title: 'Smart India Hackathon', role: 'Design lead', date: ago(75), project: null }],
            verified: true, role: 'student', createdAt: ago(380), updatedAt: ago(12),
        },
        {
            id: 3, name: 'Samira Nair', email: 'samira@teamup.dev', password: 'x',
            college: 'IIIT Hyderabad', major: 'Interaction Design', year: '3',
            bio: 'I design and build for accessibility. Currently exploring climate-tech products and better tools for student teams.',
            location: 'Hyderabad', availability: 'lookingForTeammates',
            skills: [{ skill: 'Figma', proficiency: 'Advanced' }, { skill: 'UX Writing', proficiency: 'Advanced' }, { skill: 'React', proficiency: 'Intermediate' }, { skill: 'Accessibility', proficiency: 'Advanced' }],
            interests: ['Climate tech', 'Accessibility', 'Writing'],
            links: { github: 'https://github.com/samiranair', linkedin: 'https://linkedin.com/in/samiranair', portfolio: 'https://samira.works', resumeUrl: null },
            timeline: [
                { type: 'project', title: 'A11yCharts', role: 'Maintainer', date: ago(60), project: null },
                { type: 'course', title: 'Human-computer interaction', role: 'Teaching assistant', date: ago(200), project: null },
            ],
            verified: true, role: 'student', createdAt: ago(420), updatedAt: ago(5),
        },
        {
            id: 4, name: 'Rohan Kapoor', email: 'rohan@teamup.dev', password: 'x',
            college: 'BITS Pilani', major: 'Computer Science', year: '3',
            bio: 'Backend-leaning generalist. I like boring, reliable systems: clean APIs, good tests, honest documentation.',
            location: 'Pilani', availability: 'lookingForTeammates',
            skills: [{ skill: 'Python', proficiency: 'Advanced' }, { skill: 'FastAPI', proficiency: 'Advanced' }, { skill: 'PostgreSQL', proficiency: 'Intermediate' }],
            interests: ['Edtech', 'Study tools'],
            links: { github: 'https://github.com/rohankapoor', linkedin: 'https://linkedin.com/in/rohankapoor', portfolio: null, resumeUrl: null },
            timeline: [],
            verified: false, role: 'student', createdAt: ago(300), updatedAt: ago(20),
        },
        {
            id: 5, name: 'Nisha Shah', email: 'nisha@teamup.dev', password: 'x',
            college: 'IIIT Hyderabad', major: 'CS + Design', year: '3',
            bio: 'Product thinker who codes. I map the problem first, then ship the smallest thing that teaches us something.',
            location: 'Hyderabad', availability: 'openToJoin',
            skills: [{ skill: 'Product planning', proficiency: 'Advanced' }, { skill: 'Figma', proficiency: 'Intermediate' }, { skill: 'React', proficiency: 'Intermediate' }],
            interests: ['Product planning', 'Sustainability'],
            links: { github: 'https://github.com/nishashah', linkedin: 'https://linkedin.com/in/nishashah', portfolio: null, resumeUrl: null },
            timeline: [{ type: 'startup', title: 'EcoTrace', role: 'Product lead', date: ago(45), project: null }],
            verified: true, role: 'student', createdAt: ago(350), updatedAt: ago(8),
        },
        {
            id: 6, name: 'Kabir Menon', email: 'kabir@teamup.dev', password: 'x',
            college: 'IIT Delhi', major: 'Mechanical Engineering', year: '2',
            bio: 'Hardware tinkerer learning to ship software. Drones, robots, and the firmware that keeps them honest.',
            location: 'New Delhi', availability: 'openToJoin',
            skills: [{ skill: 'C++', proficiency: 'Intermediate' }, { skill: 'Arduino', proficiency: 'Advanced' }, { skill: 'SolidWorks', proficiency: 'Advanced' }],
            interests: ['Robotics', 'Hardware'],
            links: { github: 'https://github.com/kabirmenon', linkedin: null, portfolio: null, resumeUrl: null },
            timeline: [],
            verified: false, role: 'student', createdAt: ago(210), updatedAt: ago(15),
        },
    ],
    // ------------------------------------------------------------- seed posts
    posts: [
        {
            id: 1, creatorId: 1, category: 'StartupIdea', mode: 'hybrid', status: 'Open',
            title: 'CampusEats — cut hostel food waste before it happens',
            description: 'Canteens overcook because forecasting is guesswork. CampusEats is a lightweight ordering + forecasting tool for hostel messes: students pre-order meals, the kitchen cooks to real demand, and leftovers get redirected to shelters. Looking for a builder and a designer to take the MVP to our first two hostels.',
            deadline: ahead(12), eventLink: null, externalLink: 'https://github.com/teamup/campuseats',
            rolesRequired: [{ roleName: 'Full-stack builder', count: 1, skills: ['React', 'Node.js'] }, { roleName: 'UI designer', count: 1, skills: ['Figma'] }],
            currentMembers: [{ userId: 1, userName: 'Aarav Mehta', role: 'Founder', joinedAt: ago(18) }],
            createdAt: ago(18), updatedAt: ago(18),
        },
        {
            id: 2, creatorId: 2, category: 'Hackathon', mode: 'online', status: 'Open',
            title: 'TransitPulse — live city transit dashboard for a 24h hackathon',
            description: 'A dashboard that mashes GTFS feeds with weather and event data to show where buses bunch and why. We have the data pipeline working; we need frontend and data visualization help to make the story obvious in 60 seconds on stage.',
            deadline: ahead(6), eventLink: 'https://transitpulse.dev/hack', externalLink: null,
            rolesRequired: [{ roleName: 'Frontend engineer', count: 1, skills: ['React', 'D3.js'] }, { roleName: 'Data wrangler', count: 1, skills: ['Python'] }],
            currentMembers: [
                { userId: 2, userName: 'Maya Iyer', role: 'Design + frontend', joinedAt: ago(9) },
                { userId: 4, userName: 'Rohan Kapoor', role: 'Data pipeline', joinedAt: ago(8) },
            ],
            createdAt: ago(14), updatedAt: ago(8),
        },
        {
            id: 3, creatorId: 3, category: 'OpenSource', mode: 'online', status: 'Open',
            title: 'A11yCharts — screen-reader friendly chart library',
            description: 'Most chart libraries hand a screen reader a canvas and a prayer. A11yCharts renders every chart with a semantic table alternative, keyboard-navigable data points, and sensible announcements. We have 400+ weekly downloads and a roadmap of good first issues in React and TypeScript.',
            deadline: null, eventLink: null, externalLink: 'https://github.com/teamup/a11ycharts',
            rolesRequired: [{ roleName: 'React developer', count: 1, skills: ['React', 'TypeScript'] }, { roleName: 'Docs writer', count: 1, skills: ['Technical writing'] }],
            currentMembers: [{ userId: 3, userName: 'Samira Nair', role: 'Maintainer', joinedAt: ago(10) }],
            createdAt: ago(10), updatedAt: ago(4),
        },
        {
            id: 4, creatorId: 4, category: 'ClassProject', mode: 'offline', status: 'Open',
            title: 'StudySphere — peer study groups for CS-101',
            description: 'Course project: a small web app that matches students into weekly study groups based on topic and free slots. Graded on the engineering, not the polish — but we want honest testing and a clean API. Backend skeleton is up; frontend and QA needed.',
            deadline: ahead(20), eventLink: null, externalLink: null,
            rolesRequired: [{ roleName: 'Backend builder', count: 1, skills: ['FastAPI', 'PostgreSQL'] }, { roleName: 'Frontend builder', count: 1, skills: ['React'] }],
            currentMembers: [
                { userId: 4, userName: 'Rohan Kapoor', role: 'API + schema', joinedAt: ago(7) },
                { userId: 6, userName: 'Kabir Menon', role: 'QA + docs', joinedAt: ago(5) },
            ],
            createdAt: ago(7), updatedAt: ago(5),
        },
        {
            id: 5, creatorId: 5, category: 'StartupIdea', mode: 'hybrid', status: 'Open',
            title: 'EcoTrace — personal carbon footprint you can actually act on',
            description: 'EcoTrace turns messy spend data into a weekly footprint and three realistic swaps — not guilt. We validated the idea with 80 surveys on campus. Now we need an ML person to classify transactions and a mobile dev to ship the first app by end of term.',
            deadline: ahead(15), eventLink: null, externalLink: 'https://ecotrace.app',
            rolesRequired: [{ roleName: 'ML engineer', count: 1, skills: ['Python', 'scikit-learn'] }, { roleName: 'Mobile dev', count: 1, skills: ['React Native'] }],
            currentMembers: [{ userId: 5, userName: 'Nisha Shah', role: 'Product', joinedAt: ago(5) }],
            createdAt: ago(5), updatedAt: ago(5),
        },
        {
            id: 6, creatorId: 3, category: 'ClassProject', mode: 'online', status: 'Open',
            title: 'Open design system for student clubs',
            description: 'Every club site reinvents buttons, posters, and forms. We are building a small, opinionated design system (components + Figma kit + writing guidelines) licensed MIT, then shipping one club site on top of it as proof. Great portfolio piece with real users.',
            deadline: ahead(9), eventLink: null, externalLink: null,
            rolesRequired: [{ roleName: 'Visual designer', count: 1, skills: ['Figma'] }, { roleName: 'Copywriter', count: 1, skills: ['Writing'] }],
            currentMembers: [
                { userId: 3, userName: 'Samira Nair', role: 'Design lead', joinedAt: ago(3) },
                { userId: 6, userName: 'Kabir Menon', role: 'Visual designer', joinedAt: ago(2) },
            ],
            createdAt: ago(3), updatedAt: ago(2),
        },
        {
            id: 7, creatorId: 6, category: 'Hackathon', mode: 'offline', status: 'Open',
            title: 'RoboRumble — hardware track team for the inter-college bot fight',
            description: 'We are entering the line-following bot category and the chassis is already built. Need a firmware engineer who enjoys PID tuning and someone who can CAD a better sensor mount in a week. Campus workshop access included.',
            deadline: ahead(4), eventLink: 'https://roborumble.in/register', externalLink: null,
            rolesRequired: [{ roleName: 'Firmware engineer', count: 1, skills: ['C++', 'Arduino'] }, { roleName: 'Mechanical lead', count: 1, skills: ['SolidWorks'] }],
            currentMembers: [{ userId: 6, userName: 'Kabir Menon', role: 'Builder', joinedAt: ago(2) }],
            createdAt: ago(2), updatedAt: ago(2),
        },
        {
            id: 8, creatorId: 1, category: 'OpenSource', mode: 'online', status: 'Closed',
            title: 'icon-fixes — accessibility bugs in a popular icons package',
            description: 'Short, focused drive: close 15 open accessibility issues (focus states, aria-labels, contrast) in an icons package we depend on. Team is complete — follow the issue tracker if you want to learn from the PRs.',
            deadline: null, eventLink: null, externalLink: 'https://github.com/teamup/icon-fixes',
            rolesRequired: [{ roleName: 'React developer', count: 1, skills: ['React', 'Accessibility'] }],
            currentMembers: [
                { userId: 1, userName: 'Aarav Mehta', role: 'Lead', joinedAt: ago(30) },
                { userId: 3, userName: 'Samira Nair', role: 'Reviewer', joinedAt: ago(28) },
            ],
            createdAt: ago(30), updatedAt: ago(26),
        },
    ],
    comments: [
        { id: 1, postId: 1, authorId: 5, body: 'Love the shelter redirect idea — what does the kitchen get out of pre-ordering?', createdAt: ago(11) },
        { id: 2, postId: 1, authorId: 4, body: 'Forecasting is the fun part. I can spare a few evenings if the backend needs help.', createdAt: ago(10) },
        { id: 3, postId: 1, authorId: 1, body: 'Kitchen gets a demand curve instead of a hunch, and less waste margin. Pushing a spec tonight.', createdAt: ago(10) },
        { id: 4, postId: 2, authorId: 6, body: 'Does the GTFS feed update live or is it a daily snapshot?', createdAt: ago(12) },
        { id: 5, postId: 2, authorId: 2, body: 'Live polling every 90s — we cached the slow endpoints for the demo.', createdAt: ago(12) },
        { id: 6, postId: 3, authorId: 1, body: 'Filed two good-first-issues on focus rings. Happy to review PRs.', createdAt: ago(6) },
        { id: 7, postId: 3, authorId: 5, body: 'The table-alternative approach is clever — does it announce row context?', createdAt: ago(5) },
        { id: 8, postId: 4, authorId: 3, body: 'If you need a design sanity check before the demo, ping me.', createdAt: ago(6) },
        { id: 9, postId: 5, authorId: 2, body: 'How do you plan to handle offline spend entry?', createdAt: ago(4) },
        { id: 10, postId: 7, authorId: 4, body: 'PID resources: start conservative on I, tune P last. Do not trust the tutorial defaults.', createdAt: ago(1) },
    ],
    // requesterId / postId / status
    requests: [
        { id: 1, postId: 2, requesterId: 3, role: 'Frontend engineer', message: 'I shipped the feed UI in our class project and know D3 basics — can own the dashboard views.', status: 'pending', createdAt: ago(1), respondedAt: null },
        { id: 2, postId: 5, requesterId: 3, role: 'ML engineer', message: 'Done transaction classification with scikit-learn in a course project; interested in climate data.', status: 'accepted', createdAt: ago(6), respondedAt: ago(5) },
        { id: 3, postId: 7, requesterId: 3, role: 'Firmware engineer', message: 'Arduino regular — line follower firmware feels like a fun week.', status: 'rejected', createdAt: ago(4), respondedAt: ago(4) },
        { id: 4, postId: 3, requesterId: 1, role: 'React developer', message: 'I depend on this library at work. Would love to take the keyboard-navigation issue.', status: 'pending', createdAt: ago(1), respondedAt: null },
        { id: 5, postId: 6, requesterId: 5, role: 'Copywriter', message: 'I write our product docs — happy to draft the component guidelines in plain language.', status: 'pending', createdAt: ago(3), respondedAt: null },
        { id: 6, postId: 6, requesterId: 6, role: 'Visual designer', message: 'Redesigned our club poster series last term; Figma-fluent.', status: 'accepted', createdAt: ago(3), respondedAt: ago(2) },
    ],
    // userId / type / related ids
    notifications: [
        { id: 1, userId: 3, type: 'joinRequest', message: 'Aarav Mehta requested to join A11yCharts — screen-reader friendly chart library', postId: 3, requestId: 4, read: false, createdAt: ago(1) },
        { id: 2, userId: 3, type: 'joinRequest', message: 'Nisha Shah requested to join Open design system for student clubs', postId: 6, requestId: 5, read: false, createdAt: ago(3) },
        { id: 3, userId: 3, type: 'requestAccepted', message: 'You joined EcoTrace — personal carbon footprint tracker', postId: 5, requestId: 2, read: false, createdAt: ago(5) },
        { id: 4, userId: 3, type: 'requestRejected', message: 'Your request to join RoboRumble — hardware track team for the inter-college bot fight was not selected', postId: 7, requestId: 3, read: true, createdAt: ago(4) },
        { id: 5, userId: 3, type: 'requestAccepted', message: 'Kabir Menon joined Open design system for student clubs', postId: 6, requestId: 6, read: true, createdAt: ago(2) },
    ],
};

let nextId = 1000;

// Keep demo mutations alive across reloads (same feel as a real backend).
try {
    if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem(STORE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            for (const key of Object.keys(parsed)) {
                if (key === '__nextId')
                    nextId = parsed.__nextId;
                else if (key in store)
                    store[key] = parsed[key];
            }
        }
    }
}
catch { /* ignore corrupt or unavailable storage */ }
function persistStore() {
    try {
        if (typeof sessionStorage !== 'undefined')
            sessionStorage.setItem(STORE_KEY, JSON.stringify({ ...store, __nextId: nextId }));
    }
    catch { /* quota or private mode */ }
}

// ----------------------------------------------------------------- view maps
function userView(u) {
    if (!u)
        return null;
    const { password, ...rest } = u;
    return clone(rest);
}
function postView(p) {
    if (!p)
        return null;
    const creator = store.users.find((u) => u.id === p.creatorId);
    return clone({ ...p, creator: userView(creator) });
}
function commentView(c) {
    return clone({ id: c.id, author: userView(store.users.find((u) => u.id === c.authorId)), body: c.body, createdAt: c.createdAt });
}
function requestView(r) {
    return clone({
        id: r.id, post: postView(store.posts.find((p) => p.id === r.postId)),
        requester: userView(store.users.find((u) => u.id === r.requesterId)),
        role: r.role, message: r.message, status: r.status, createdAt: r.createdAt, respondedAt: r.respondedAt,
    });
}
function notificationView(n) {
    return clone({ id: n.id, type: n.type, message: n.message, postId: n.postId, requestId: n.requestId, read: n.read, createdAt: n.createdAt });
}
const sortNewest = (a, b) => (a.createdAt < b.createdAt ? 1 : -1);

function notify(userId, type, message, postId, requestId) {
    store.notifications.push({ id: nextId++, userId, type, message, postId, requestId, read: false, createdAt: new Date().toISOString() });
}

// ------------------------------------------------------------------ auth bits
function tokenUser(headers = {}) {
    const auth = headers.Authorization || headers.authorization || '';
    const m = /^Bearer demo\.(\d+)$/.exec(auth);
    if (!m)
        return null;
    return store.users.find((u) => u.id === Number(m[1])) || null;
}
function requireUser(headers) {
    const u = tokenUser(headers);
    if (!u)
        throw new DemoError(401, 'Authentication required');
    return u;
}
function findUserByEmail(email) {
    const e = String(email || '').trim().toLowerCase();
    return store.users.find((u) => u.email.toLowerCase() === e) || null;
}
function prettyName(email) {
    const local = String(email || 'guest').split('@')[0].replace(/[._-]+/g, ' ').trim();
    return local.split(' ').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') || 'Guest User';
}
function authPayload(user) {
    return clone({ user: userView(user), accessToken: `demo.${user.id}` });
}
function userById(id) {
    return store.users.find((u) => u.id === id) || null;
}
function postById(id) {
    return store.posts.find((p) => p.id === id) || null;
}

// --------------------------------------------------------------- mock router
export function demoRequest(method, path, body, headers) {
    const [pathname] = String(path).split('?');
    const get = () => router(method, pathname, body, headers);
    return new Promise((resolve, reject) => {
        // small delay so loading states render like they do with a real network
        setTimeout(() => {
            try {
                const result = get();
                if (method !== 'GET')
                    persistStore();
                resolve(result);
            }
            catch (e) {
                reject(e);
            }
        }, 120 + Math.random() * 180);
    });
}

function router(method, pathname, body, headers) {
    let m;

    // ------------------------------------------------------------------ GET
    if (method === 'GET') {
        if (pathname === '/api/health')
            return clone({ service: 'teamup-api', status: 'ok (offline demo)' });

        if (pathname === '/api/posts') {
            let posts = [...store.posts].sort(sortNewest);
            return clone(posts.map(postView));
        }
        if (pathname === '/api/posts/recommended') {
            const me = tokenUser(headers);
            const mySkills = new Set(((me && me.skills) || []).map((s) => String(s.skill).toLowerCase()));
            const scored = store.posts.map((p) => {
                let score = 0;
                for (const r of p.rolesRequired || [])
                    for (const s of r.skills || [])
                        if (mySkills.has(String(s).toLowerCase()))
                            score += 1;
                return { p, score };
            });
            scored.sort((a, b) => b.score - a.score || sortNewest(a.p, b.p));
            return clone(scored.map((x) => postView(x.p)));
        }
        if ((m = /^\/api\/posts\/(\d+)$/.exec(pathname))) {
            const p = postById(Number(m[1]));
            if (!p)
                throw new DemoError(404, 'Post not found');
            return postView(p);
        }
        if ((m = /^\/api\/posts\/(\d+)\/comments$/.exec(pathname))) {
            const pid = Number(m[1]);
            if (!postById(pid))
                throw new DemoError(404, 'Post not found');
            return clone(store.comments.filter((c) => c.postId === pid).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1)).map(commentView));
        }
        if ((m = /^\/api\/posts\/(\d+)\/requests$/.exec(pathname))) {
            const me = requireUser(headers);
            const p = postById(Number(m[1]));
            if (!p)
                throw new DemoError(404, 'Post not found');
            if (p.creatorId !== me.id)
                throw new DemoError(403, 'Only the post creator can manage requests');
            return clone(store.requests.filter((r) => r.postId === p.id).sort(sortNewest).map(requestView));
        }
        if (pathname === '/api/users')
            return clone(store.users.slice(0, 100).map(userView));
        if (pathname === '/api/users/me')
            return userView(requireUser(headers));
        if ((m = /^\/api\/users\/(\d+)$/.exec(pathname))) {
            const u = userById(Number(m[1]));
            if (!u)
                throw new DemoError(404, 'User not found');
            return userView(u);
        }
        if (pathname === '/api/me/posts') {
            const me = requireUser(headers);
            return clone(store.posts.filter((p) => p.creatorId === me.id).sort(sortNewest).map(postView));
        }
        if (pathname === '/api/me/requests') {
            const me = requireUser(headers);
            return clone(store.requests.filter((r) => r.requesterId === me.id).sort(sortNewest).map(requestView));
        }
        if (pathname === '/api/me/received-requests') {
            const me = requireUser(headers);
            const myPostIds = new Set(store.posts.filter((p) => p.creatorId === me.id).map((p) => p.id));
            return clone(store.requests
                .filter((r) => myPostIds.has(r.postId) && r.status === 'pending')
                .sort(sortNewest).map(requestView));
        }
        if (pathname === '/api/me/notifications') {
            const me = requireUser(headers);
            return clone(store.notifications.filter((n) => n.userId === me.id).sort(sortNewest).map(notificationView));
        }
    }

    // ----------------------------------------------------------------- POST
    if (method === 'POST') {
        if (pathname === '/api/auth/login') {
            const user = findUserByEmail(body && body.email);
            if (!user)
                throw new DemoError(401, 'Invalid email or password');
            return authPayload(user);
        }
        if (pathname === '/api/auth/signup') {
            const email = String((body && body.email) || '').trim().toLowerCase();
            if (!email)
                throw new DemoError(400, 'Email is required');
            let user = findUserByEmail(email);
            if (user)
                throw new DemoError(409, 'Email already registered');
            user = {
                id: nextId++, name: (body && body.name) || prettyName(email), email, password: 'x',
                college: '', major: '', year: '', bio: '', location: '', availability: 'openToJoin',
                skills: [], interests: [], links: null, timeline: [], verified: false, role: 'student',
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            };
            store.users.push(user);
            return authPayload(user);
        }
        if (pathname === '/api/posts') {
            const me = requireUser(headers);
            if (!body || !body.title || !body.description || !body.category)
                throw new DemoError(400, 'Title, description, and category are required');
            const p = {
                id: nextId++, creatorId: me.id, category: body.category, mode: body.mode || 'online',
                status: body.status || 'Open', title: body.title, description: body.description,
                deadline: body.deadline || null, eventLink: body.eventLink || null, externalLink: body.externalLink || null,
                rolesRequired: (body.rolesRequired || []).map((r) => ({ roleName: r.roleName, count: r.count ?? 1, skills: r.skills || [] })),
                currentMembers: [{ userId: me.id, userName: me.name, role: 'Creator', joinedAt: new Date().toISOString() }],
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            };
            store.posts.unshift(p);
            return postView(p);
        }
        if ((m = /^\/api\/posts\/(\d+)\/comments$/.exec(pathname))) {
            const me = requireUser(headers);
            const pid = Number(m[1]);
            if (!postById(pid))
                throw new DemoError(404, 'Post not found');
            if (!body || !body.body || !String(body.body).trim())
                throw new DemoError(400, 'Comment cannot be empty');
            const c = { id: nextId++, postId: pid, authorId: me.id, body: String(body.body).trim(), createdAt: new Date().toISOString() };
            store.comments.push(c);
            return commentView(c);
        }
        if ((m = /^\/api\/posts\/(\d+)\/join$/.exec(pathname))) {
            const me = requireUser(headers);
            const pid = Number(m[1]);
            const p = postById(pid);
            if (!p)
                throw new DemoError(404, 'Post not found');
            if (p.creatorId === me.id)
                throw new DemoError(400, 'You cannot request to join your own post');
            const dup = store.requests.some((r) => r.postId === pid && r.requesterId === me.id && r.status === 'pending');
            if (dup)
                throw new DemoError(409, 'You already have a pending request for this post');
            const r = {
                id: nextId++, postId: pid, requesterId: me.id,
                role: (body && body.role) || '', message: (body && body.message) || '',
                status: 'pending', createdAt: new Date().toISOString(), respondedAt: null,
            };
            store.requests.push(r);
            if (p.creatorId !== me.id)
                notify(p.creatorId, 'joinRequest', `${me.name} requested to join ${p.title}`, pid, r.id);
            return requestView(r);
        }
    }

    // ---------------------------------------------------------------- PATCH
    if (method === 'PATCH') {
        if ((m = /^\/api\/posts\/(\d+)$/.exec(pathname))) {
            const me = requireUser(headers);
            const p = postById(Number(m[1]));
            if (!p)
                throw new DemoError(404, 'Post not found');
            if (p.creatorId !== me.id)
                throw new DemoError(403, 'Only the creator can edit this post');
            if (body.title != null)
                p.title = body.title;
            if (body.description != null)
                p.description = body.description;
            if (body.category != null)
                p.category = body.category;
            if (body.mode != null)
                p.mode = body.mode;
            if (body.status != null)
                p.status = body.status;
            if (body.deadline !== undefined)
                p.deadline = body.deadline;
            if (body.externalLink !== undefined)
                p.externalLink = body.externalLink;
            if (Array.isArray(body.rolesRequired))
                p.rolesRequired = body.rolesRequired.map((r) => ({ roleName: r.roleName, count: r.count ?? 1, skills: r.skills || [] }));
            p.updatedAt = new Date().toISOString();
            return postView(p);
        }
        if ((m = /^\/api\/posts\/(\d+)\/requests\/(\d+)$/.exec(pathname))) {
            const me = requireUser(headers);
            const p = postById(Number(m[1]));
            if (!p)
                throw new DemoError(404, 'Post not found');
            if (p.creatorId !== me.id)
                throw new DemoError(403, 'Only the post creator can manage requests');
            const r = store.requests.find((x) => x.id === Number(m[2]));
            if (!r || r.postId !== p.id)
                throw new DemoError(404, 'Request not found on this post');
            if (r.status !== 'pending')
                throw new DemoError(409, 'This request has already been responded to');
            const action = (body && body.action) || '';
            if (action !== 'accept' && action !== 'reject')
                throw new DemoError(400, "action must be 'accept' or 'reject'");
            const requester = userById(r.requesterId);
            if (action === 'accept') {
                r.status = 'accepted';
                if (requester && !p.currentMembers.some((x) => x.userId === requester.id)) {
                    p.currentMembers.push({ userId: requester.id, userName: requester.name, role: r.role || 'Member', joinedAt: new Date().toISOString() });
                }
                if (requester)
                    notify(requester.id, 'requestAccepted', `You joined ${p.title}`, p.id, r.id);
            }
            else {
                r.status = 'rejected';
                if (requester)
                    notify(requester.id, 'requestRejected', `Your request to join ${p.title} was not selected`, p.id, r.id);
            }
            r.respondedAt = new Date().toISOString();
            p.updatedAt = r.respondedAt;
            return requestView(r);
        }
        if (pathname === '/api/users/me') {
            const me = requireUser(headers);
            if (body.name != null)
                me.name = body.name;
            if (body.college != null)
                me.college = body.college;
            if (body.major != null)
                me.major = body.major;
            if (body.year != null)
                me.year = body.year;
            if (body.bio != null)
                me.bio = body.bio;
            if (body.location != null)
                me.location = body.location;
            if (body.availability != null)
                me.availability = body.availability;
            if (Array.isArray(body.skills))
                me.skills = body.skills.map((s) => ({ skill: s.skill, proficiency: s.proficiency || 'Intermediate' }));
            if (Array.isArray(body.interests))
                me.interests = body.interests;
            if (body.links != null) {
                const links = me.links || { github: null, linkedin: null, portfolio: null, resumeUrl: null };
                if (body.links.github !== undefined)
                    links.github = body.links.github;
                if (body.links.linkedin !== undefined)
                    links.linkedin = body.links.linkedin;
                if (body.links.portfolio !== undefined)
                    links.portfolio = body.links.portfolio;
                if (body.links.resumeUrl !== undefined)
                    links.resumeUrl = body.links.resumeUrl;
                me.links = links;
            }
            me.updatedAt = new Date().toISOString();
            return userView(me);
        }
        if (pathname === '/api/me/notifications/read') {
            const me = requireUser(headers);
            let updated = 0;
            for (const n of store.notifications) {
                if (n.userId === me.id && !n.read) {
                    n.read = true;
                    updated += 1;
                }
            }
            return clone({ updated });
        }
    }

    // --------------------------------------------------------------- DELETE
    if (method === 'DELETE') {
        if ((m = /^\/api\/posts\/(\d+)$/.exec(pathname))) {
            const me = requireUser(headers);
            const p = postById(Number(m[1]));
            if (!p)
                throw new DemoError(404, 'Post not found');
            if (p.creatorId !== me.id)
                throw new DemoError(403, 'Only the creator can delete this post');
            store.posts = store.posts.filter((x) => x.id !== p.id);
            return undefined;
        }
    }

    throw new DemoError(404, `No demo handler for ${method} ${pathname}`);
}
