export default function MessageList({ messages, loggedUser }) {
    if (messages.length === 0) {
        return (
            <div className="message-list empty">
                <p>Сообщений пока нет. Напишите первым!</p>
            </div>
        );
    }

    return (
        <div className="message-list">
            {messages.map(msg => {
                const isOwn = msg.sender === loggedUser.id;
                
                return (
                    
                    <div key={msg.message_id} className={`msg ${isOwn ? 'msg-own' : ''}`}>
                        <div className="bubble">{msg.text}</div>
                    </div>
                );
            })}
        </div>
    );
}