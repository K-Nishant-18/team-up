const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
const TOKEN_KEY = 'teamup_token';
export function getToken() {
    if (typeof window === 'undefined')
        return null;
    return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
    if (typeof window === 'undefined')
        return;
    if (token)
        window.localStorage.setItem(TOKEN_KEY, token);
    else
        window.localStorage.removeItem(TOKEN_KEY);
}
export function loggedIn() {
    return Boolean(getToken());
}
async function request(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const token = getToken();
    if (token)
        headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!response.ok) {
        let message = 'Request failed';
        try {
            const data = await response.json();
            if (data && data.message)
                message = data.message;
        }
        catch {
            // ignore parse errors, keep default message
        }
        throw new ApiError(response.status, message);
    }
    if (response.status === 204)
        return undefined;
    return (await response.json());
}
export const api = {
    health: () => request('/api/health'),
    login: (email, password) => request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }),
    signup: (name, email, password) => request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    }),
    getPosts: (params = {}) => {
        const query = new URLSearchParams();
        if (params.search)
            query.set('search', params.search);
        if (params.category)
            query.set('category', params.category);
        if (params.mode)
            query.set('mode', params.mode);
        if (params.status)
            query.set('status', params.status);
        const qs = query.toString();
        return request(`/api/posts${qs ? `?${qs}` : ''}`);
    },
    getRecommendedPosts: () => request('/api/posts/recommended'),
    getPost: (id) => request(`/api/posts/${id}`),
    getComments: (id) => request(`/api/posts/${id}/comments`),
    addComment: (id, body) => request(`/api/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),
    submitJoinRequest: (id, body) => request(`/api/posts/${id}/join`, { method: 'POST', body: JSON.stringify(body) }),
    getPostRequests: (id) => request(`/api/posts/${id}/requests`),
    respondToRequest: (postId, requestId, action) => request(`/api/posts/${postId}/requests/${requestId}`, { method: 'PATCH', body: JSON.stringify({ action }) }),
    getMyRequests: () => request('/api/me/requests'),
    getMyPosts: () => request('/api/me/posts'),
    getReceivedRequests: () => request('/api/me/received-requests'),
    getNotifications: () => request('/api/me/notifications'),
    markNotificationsRead: () => request('/api/me/notifications/read', { method: 'PATCH' }),
    createPost: (body) => request('/api/posts', { method: 'POST', body: JSON.stringify(body) }),
    updatePost: (id, body) => request(`/api/posts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deletePost: (id) => request(`/api/posts/${id}`, { method: 'DELETE' }),
    getUsers: (params = {}) => {
        const query = new URLSearchParams();
        if (params.year)
            query.set('year', params.year);
        if (params.availability)
            query.set('availability', params.availability);
        if (params.skill)
            query.set('skill', params.skill);
        const qs = query.toString();
        return request(`/api/users${qs ? `?${qs}` : ''}`);
    },
    getUser: (id) => request(`/api/users/${id}`),
    getMe: () => request('/api/users/me'),
    updateMe: (body) => request('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
};
export function initialsOf(name) {
    if (!name)
        return '?';
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .slice(0, 2)
        .join('');
}
const AVAILABILITY_LABELS = {
    openToJoin: 'Open to join',
    lookingForTeammates: 'Looking for teammates',
    notAvailable: 'Not available',
};
export function availabilityLabel(value) {
    return (value && AVAILABILITY_LABELS[value]) || value || 'Open to join';
}
const MODE_LABELS = {
    online: 'Online',
    offline: 'Offline',
    hybrid: 'Hybrid',
};
export function modeLabel(value, location) {
    const base = (value && MODE_LABELS[value]) || value || 'Online';
    return value === 'offline' && location ? `${base} · ${location}` : base;
}
export function categoryLabel(value) {
    if (!value)
        return 'PROJECT';
    return ((value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .toUpperCase()
        .replace('OPEN SOURCE', 'OPEN SOURCE')));
}
const PALETTE = ['#20304f', '#c65d3d', '#5279a8', '#6f8662', '#866f9b', '#bf713e', '#738a75', '#f16d3d'];
export function colorFor(seed) {
    const s = seed ?? '?';
    let hash = 0;
    for (let i = 0; i < s.length; i++)
        hash = (hash + s.charCodeAt(i)) % PALETTE.length;
    return PALETTE[hash];
}
export function formatDeadline(value) {
    if (!value)
        return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
