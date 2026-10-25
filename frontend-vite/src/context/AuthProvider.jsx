import { useState } from 'react';
import { AuthContext } from './auth-context';
export function AuthProvider({ children }) {
    const [loggedUser, setLoggedUser] = useState(() => {
        const saved = localStorage.getItem('loggedUser');
        return saved ? JSON.parse(saved) : null;
    });
    const login = (userData) => {
    setLoggedUser(userData);
    localStorage.setItem('loggedUser', JSON.stringify(userData));
    };
    const logout = () => {
    setLoggedUser(null);
    localStorage.removeItem('loggedUser');
    };
    return (
    <AuthContext.Provider value={{ loggedUser, login, logout }}>
        {children}
    </AuthContext.Provider>
    );
}