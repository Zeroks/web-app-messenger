import { useAuth } from './context/useAuth';
import FormForData from './components/FormForData';
import ChatPage from './components/ChatPage';
import './App.css';

function App() {
  const { loggedUser } = useAuth();

  if (!loggedUser) {
    return <FormForData />;
  }

  return <ChatPage />;
}

export default App;
