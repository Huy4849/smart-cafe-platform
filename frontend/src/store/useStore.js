import { create } from 'zustand';

// Try to initialize from localStorage
const initialToken = localStorage.getItem('token') || null;
const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const useStore = create((set) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
  theme: localStorage.getItem('theme') || 'light',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return { theme: newTheme };
  }),
}));

export default useStore;
