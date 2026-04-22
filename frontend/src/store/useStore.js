import { create } from 'zustand';

// Try to initialize from localStorage
const initialToken = localStorage.getItem('token') || null;
const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const initialTheme = localStorage.getItem('theme') || 'light';
const initialLanguage = localStorage.getItem('language') || 'vi';
const initialNotifications = localStorage.getItem('notifications') 
  ? JSON.parse(localStorage.getItem('notifications')) 
  : { email: true, deadline: true, status: true };

if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const useStore = create((set) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  language: initialLanguage,
  notifications: initialNotifications,
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
  theme: initialTheme,
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return { theme: newTheme };
  }),
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },
  toggleNotification: (key) => set((state) => {
    const newNotifications = { ...state.notifications, [key]: !state.notifications[key] };
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
    return { notifications: newNotifications };
  }),
}));

export default useStore;
