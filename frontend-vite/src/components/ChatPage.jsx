import { useAuth } from "../context/useAuth";
import './ChatPage.css';

export default function ChatPage() {
    const { loggedUser, logout } = useAuth();

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1>💬 Мессенджер</h1>
                <div className="user-info">
                    <span>Вы: {loggedUser.name}</span>
                    <button onClick={logout}>Выйти</button>
                </div>
            </header>
            <main className="chat-main">
                <p>Чат скоро появится... (здесь будет список контактов и сообщения)</p>
            </main>
        </div>
    );
}