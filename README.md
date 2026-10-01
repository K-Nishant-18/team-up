# 🤝 TeamUp

> Find the right people, build the right team.

TeamUp is a full-stack collaboration platform where students and builders discover teammates, post projects, and ship together — from idea to hackathon to open source.

![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-22-ED8B00?logo=openjdk&logoColor=white)
![H2](https://img.shields.io/badge/database-H2%20(in--memory)-1B6B93?logo=h2&logoColor=white)

---

## ✨ Features

| | |
|---|---|
| 🔐 **Auth** | Sign up, log in, and password recovery with JWT sessions |
| 📝 **Project posts** | Publish opportunities with roles, skills, deadlines, and mode (online / offline / hybrid) |
| 🔎 **Discovery** | Search and filter the feed by category, mode, and status — plus personalized recommendations |
| 🙋 **Join requests** | Apply to roles on a team; creators accept or reject with a message trail |
| 💬 **Comments** | Discuss projects inline on every post detail page |
| 📊 **Dashboard** | At-a-glance view of your posts, requests, and activity |
| 🔔 **Notifications** | In-app notifications with one-click mark-as-read |
| 👤 **Profiles** | Rich profiles with skills, availability, timeline, and external links — fully editable |
| 👥 **Directory & teams** | Browse people by year, availability, and skill; explore active teams |
| 🔖 **Saved posts** | Star posts for later (persisted locally) |
| 📱 **Responsive** | Blueprint-inspired design system that adapts from desktop to mobile |

## 🛠️ Tech stack

**Frontend** — Vite 7 · React 19 · React Router 7 · Tailwind CSS 4 · lucide-react
**Backend** — Spring Boot 3.3 · Spring Security · Spring Data JPA · JJWT · H2 (in-memory)
**Tooling** — pnpm · Vite plugins (`@vitejs/plugin-react`, `@tailwindcss/vite`)

## 🚀 Getting started

### Prerequisites

- Node.js ≥ 20 and [pnpm](https://pnpm.io)
- JDK 22 (backend bundles the Maven wrapper — no Maven install needed)

### 1. Run the backend (port `4000`)

```bash
cd backend
./mvnw spring-boot:run      # Windows: mvnw.cmd spring-boot:run
```

H2 is in-memory with `create-drop` and a data seeder, so you get demo users and posts on every boot. Console: [http://localhost:4000/h2-console](http://localhost:4000/h2-console) (JDBC URL `jdbc:h2:mem:teamup`, user `sa`, empty password).

### 2. Run the frontend (port `5173`)

```bash
pnpm install
pnpm dev
```

The API base URL defaults to `http://localhost:4000`. To point elsewhere, create a `.env`:

```bash
echo "VITE_API_URL=http://localhost:4000" > .env
```

### 3. Production build

```bash
pnpm build       # type-check-free Vite build → dist/
pnpm preview     # serve dist/ locally
```

## 📁 Project structure

```
team-up/
├── src/
│   ├── components/
│   │   └── platform-shell.jsx     # Sidebar + topbar app shell
│   ├── lib/
│   │   ├── api.js                 # Typed REST client & view models
│   │   ├── use-fetch.js           # Data-fetching hook
│   │   └── saved.js               # Saved-posts localStorage store
│   ├── pages/                     # 14 routed screens
│   ├── App.jsx                    # Route table + scroll restore
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Tailwind v4 theme & design tokens
├── backend/
│   └── src/main/java/com/teamup/
│       ├── controller/            # REST controllers
│       ├── config/                # Security config, data seeder
│       ├── security/              # JWT service & filter
│       └── post/ user/ comment/ request/   # Domain models + repos
├── index.html
├── vite.config.js
└── package.json
```

## 🗺️ Routes

| Path | Screen |
|---|---|
| `/` | Landing page |
| `/posts` | Posts feed with search & filters |
| `/posts/:id` | Post detail, comments, join request |
| `/create-post` | Publish a project |
| `/dashboard` | Your activity overview |
| `/requests` | Sent & received join requests |
| `/notifications` | Notifications |
| `/teams` | Teams directory |
| `/profiles` | People directory |
| `/profile` · `/profile/edit` | Your profile · profile editor |
| `/login` · `/signup` · `/forgot-password` | Auth screens |

## 🔌 API overview

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `POST` | `/auth/login` · `/auth/signup` | Authenticate, returns user + JWT |
| `GET` | `/posts` · `/posts/recommended` | Feed, filters (`search`, `category`, `mode`, `status`), recommendations |
| `GET/POST` | `/posts/:id` · `/posts/:id/comments` | Read/create posts, list/add comments |
| `POST` | `/posts/:id/join` | Submit a join request |
| `GET/PATCH` | `/posts/:id/requests[/:requestId]` | Review and accept/reject requests |
| `GET` | `/me/posts` · `/me/requests` · `/me/received-requests` | Your content |
| `GET/PATCH` | `/me/notifications[/read]` | Notifications & mark read |
| `GET/PATCH` | `/users` · `/users/:id` · `/users/me` | Directory & profile |
| `POST/PATCH/DELETE` | `/posts` (create/update/delete) | Manage your posts |

Authenticated requests need `Authorization: Bearer <token>`.

## 🎨 Design system

Theme tokens live in `src/index.css` via Tailwind v4's `@theme`:

| Token | Value | Role |
|---|---|---|
| `ink` | `#17233d` | Primary text / dark surfaces |
| `paper` / `paper-deep` | `#f3efe4` / `#e8e1d2` | Page background |
| `line` | `#c9c2b3` | Hairline borders |
| `orange` | `#e56e3c` | Accent / primary action |
| `muted` · `green` · `blue` | `#6f746f` · `#5f7d67` · `#5279a8` | Secondary signals |

Plus reusable `blueprint` utilities for the grid-paper background and a mobile-first breakpoint scale (`max-[1050px]`, `max-[720px]`).

---

Made with ❤️ — issues and PRs welcome.
