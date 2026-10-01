const KEY = 'teamup_saved';
export function getSavedIds() {
    if (typeof window === 'undefined')
        return [];
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(Number).filter((n) => Number.isFinite(n)) : [];
    }
    catch {
        return [];
    }
}
export function toggleSaved(id) {
    const ids = getSavedIds();
    const next = ids.includes(id) ? ids.filter((saved) => saved !== id) : [...ids, id];
    if (typeof window !== 'undefined')
        window.localStorage.setItem(KEY, JSON.stringify(next));
    return next;
}
export function isSaved(id) {
    return getSavedIds().includes(id);
}
