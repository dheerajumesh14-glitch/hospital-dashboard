import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const USERS = [
  { id: 1, name: 'Deepa Menon',    role: 'nurse',        password: 'nurse123',    ward: '4B' },
  { id: 2, name: 'Dr. Srikanth',   role: 'doctor',       password: 'doctor123',   ward: '4B' },
  { id: 3, name: 'Anita Sharma',   role: 'wardmanager',  password: 'ward123',     ward: '4B' },
  { id: 4, name: 'Rajesh Kumar',   role: 'admin',        password: 'admin123',    ward: 'ALL' },
  { id: 5, name: 'Preethi Nair',   role: 'pharmacist',   password: 'pharma123',   ward: 'ALL' },
  { id: 6, name: 'Suman Reddy',    role: 'receptionist', password: 'recept123',   ward: 'ALL' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hospital_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (name, password) => {
    const found = USERS.find(
      u =>
        u.name.toLowerCase() === name.toLowerCase() &&
        u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem('hospital_user', JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid name or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hospital_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);