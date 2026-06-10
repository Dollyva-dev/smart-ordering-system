import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  username: string | null;
  setAuth: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null,
  username: typeof window !== 'undefined' ? localStorage.getItem('adminUsername') : null,
  setAuth: (token, username) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUsername', username);
    set({ token, username });
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    set({ token: null, username: null });
  },
}));
