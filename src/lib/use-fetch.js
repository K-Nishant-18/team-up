import { useEffect, useState } from 'react';
export function useFetch(fetcher, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let active = true;
        setLoading(true);
        fetcher()
            .then((result) => {
            if (active) {
                setData(result);
                setError(null);
            }
        })
            .catch((err) => {
            if (active)
                setError(err);
        })
            .finally(() => {
            if (active)
                setLoading(false);
        });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return { data, loading, error };
}
