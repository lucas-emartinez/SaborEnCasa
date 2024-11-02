import { useState, useCallback } from "react";

export const useFetch = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (url: string, options: RequestInit) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            setData(result);
            return result; // Return the data directly
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(String(error));
            }
            throw error; // Re-throw the error
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, fetchData };
};