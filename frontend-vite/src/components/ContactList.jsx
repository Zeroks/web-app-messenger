import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import './ContactList.css';

export default function ContactList({ onSelectContact }) {
    const { loggedUser } = useAuth();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const fetchDialogs = () => {
        fetch(`http://localhost:5000/dialogs/${loggedUser.id}`)
            .then(res => res.json())
            .then(data => {
                if (!query) setUsers(data);
            })
            .catch(err => console.error('Ошибка загрузки диалогов:', err));
    };

    useEffect(() => {
        fetchDialogs();
        const interval = setInterval(fetchDialogs, 3000);
        return () => clearInterval(interval);
    }, [loggedUser.id, query]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            fetchDialogs();
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`http://localhost:5000/users?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                const filtered = data.filter(user => user.id !== loggedUser.id);
                setUsers(filtered);
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        fetchDialogs();
    };

    return (
        <div className="contact-list-container">
            <form className="search-form" onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Поиск или список диалогов..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button type="button" className="clear-btn" onClick={clearSearch}>
                            ✕
                        </button>
                    )}
                </div>
                <button type="submit" disabled={isSearching}>
                    {isSearching ? '...' : 'Найти'}
                </button>
            </form>

            <div className="contacts">
                {users.length === 0 && query && !isSearching && (
                    <p className="no-results">Никого не найдено</p>
                )}
                {users.length === 0 && !query && (
                    <p className="no-results">У вас пока нет диалогов.</p>
                )}

                {users.map(user => (
                    <div 
                        key={user.id} 
                        className="contact-item"
                        onClick={() => onSelectContact(user)}
                    >
                        <div className="avatar">{user.name[0].toUpperCase()}</div>
                        <div className="user-info">
                            <span className="name">{user.name}</span>
                            <span className="age">{user.age} лет</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}