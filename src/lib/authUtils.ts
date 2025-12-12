// Auth utility functions for managing authentication state

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) return false;

    // Check if token is expired
    try {
        const payload = getUserFromToken();
        if (!payload) return false;

        // Check expiry
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            // Do not auto-logout; just report unauthenticated
            return false;
        }

        return true;
    } catch (error) {
        // Do not auto-logout on decode errors; just report unauthenticated
        return false;
    }
};

export const getUserFromToken = (): { id: string; exp?: number } | null => {
    const token = getToken();
    if (!token) return null;

    try {
        // Decode JWT without verification (payload is in the middle part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const logout = (): void => {
    localStorage.removeItem('token');
    // Redirect to home page
    window.location.href = '/';
};

export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};
