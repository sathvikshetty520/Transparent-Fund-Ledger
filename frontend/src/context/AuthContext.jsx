import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/services';
import { TOKEN_KEY } from '../api/client';
import { normalizeUser } from '../utils/normalize';

const AuthContext = createContext(null);

// Backend may answer { user } or { data: { user } } or the user itself
const readUser = (d) => d?.user ?? d?.data?.user ?? d?.data ?? d;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load: if a token is saved, ask the backend who we are
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    api
      .getMe()
      .then((d) => setUser(normalizeUser(readUser(d))))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const d = await api.login({ email, password });
    const inner = d?.data ?? d;
    const token = inner?.token ?? inner?.accessToken ?? d?.token;
    if (!token) throw new Error('Login worked but the server did not send a token.');
    localStorage.setItem(TOKEN_KEY, token);

    let rawUser = inner?.user ?? d?.user;
    if (!rawUser) rawUser = readUser(await api.getMe());
    const me = normalizeUser(rawUser);
    setUser(me);
    return me;
  }

  async function register(form) {
    await api.register(form); // role is only CONTRIBUTOR or ORGANIZER (chosen in the form)
    return login(form.email, form.password);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
