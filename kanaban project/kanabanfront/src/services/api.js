import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Defensive check: Force HTTPS for production Railway URL if it comes in as HTTP
if (baseURL.includes('up.railway.app') && baseURL.startsWith('http://')) {
    console.warn("Forcing HTTPS on Backend URL");
    baseURL = baseURL.replace('http://', 'https://');
}

const api = axios.create({
    baseURL: baseURL,
});

// Add auth token to requests
// Note: We need to get the session from Supabase and pass the access token
import { supabase } from '../lib/supabase';

api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export default api;
