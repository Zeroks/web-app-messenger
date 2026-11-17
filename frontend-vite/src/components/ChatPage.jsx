import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import ContactList from './ContactList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatPage.css';

export default function ChatPage() {
    const { loggedUser, logout } = useAuth();
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!selectedContact) {
            setMessages([]);
            return;
        }
        const dialogId = [loggedUser.id, selectedContact.id].sort().join('_');
        fetch(`http://localhost:5000/messages/${dialogId}`)
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(err => console.error('Ошибка загрузки сообщений:', err));
    }, [selectedContact, loggedUser.id]);

    const handleSendMessage = async (text) => {
        if (!selectedContact) return;
        const dialogId = [loggedUser.id, selectedContact.id].sort().join('_');
        const newMessage = { sender: loggedUser.id, text: text };

        try {
            const response = await fetch(`http://localhost:5000/messages/${dialogId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage)
            });
            const data = await response.json();
            setMessages(prev => [...prev, {
                message_id: data.message_id,
                sender: loggedUser.id,
                text: text
            }]);
        } catch (error) {
            console.error('Ошибка отправки:', error);
        }
    };

    return (
        <div className={`chat-layout ${selectedContact ? 'chat-open' : ''}`}>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="brand-logo">ml</div>
                        <span className="sidebar-title">Messenger</span>
                    </div>
                <button className="logout-btn" onClick={logout}>Выйти</button>
                </div>
                <ContactList onSelectContact={setSelectedContact} />
            </aside>

            <main className="chat-area">
                {selectedContact ? (
                    <div className="chat-active">
                        <header className="chat-header">
                            <button className="back-btn" onClick={() => setSelectedContact(null)}>
                                ←
                            </button>
                            <h2>{selectedContact.name}</h2>
                        </header>
                        
                        <MessageList messages={messages} loggedUser={loggedUser} />
                        
                        <MessageInput onSend={handleSendMessage} disabled={false} />
                    </div>
                ) : (
                    <div className="chat-empty">
                        <p>Выберите контакт, чтобы начать диалог</p>
                    </div>
                )}
            </main>
        </div>
    );
}