import { useState } from 'react';
import { useAuth } from "../context/useAuth";
import './FormForData.css';

const API_URL = 'http://192.168.0.195:5000';

export default function FormForData() {
    const { login } = useAuth();
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [hobby, setHobby] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoginMode = mode === 'login';

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setPassword('');
        setError('');
    };

    const validateForm = () => {
        if (!name.trim()) {
            return 'Введите имя пользователя.';
        }
        if (!password) {
            return 'Введите пароль.';
        }
        if (!isLoginMode) {
            const numericAge = Number(age);
            if (numericAge < 12 || numericAge > 125) {
                return 'Возраст должен быть от 12 до 125.';
            }
            if (!hobby.trim()) {
                return 'Укажите хотя бы одно хобби.';
            }
        }
        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            let user;

            if (isLoginMode) {
                const response = await fetch('http://localhost:5000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.trim(), password }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Ошибка входа');
                }
                user = data;
            } else {
                const hobbies = hobby.split(',').map(item => item.trim()).filter(Boolean);

                const response = await fetch('http://localhost:5000/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name.trim(),
                        age: Number(age),
                        hobby: hobbies,
                        password,
                    }),
                });

                const id = await response.text();
                if (!response.ok) {
                    throw new Error(id || 'Ошибка регистрации');
                }

                user = {
                    id,
                    name: name.trim(),
                    age: Number(age),
                    hobby: hobbies,
                };
            }

            login(user);
        } catch (requestError) {
            setError(requestError.message || 'Не удалось выполнить запрос.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="auth-title">
                <div className="brand-mark" aria-hidden="true">ml</div>
                <h1 id="auth-title">mlmessenger</h1>
                <p className="auth-subtitle">
                    {isLoginMode
                        ? 'Войдите, чтобы продолжить общение'
                        : 'Создайте аккаунт, чтобы начать общение'}
                </p>

                <div className="auth-switch" aria-label="Выбор действия">
                    <button
                        type="button"
                        className={isLoginMode ? 'active' : ''}
                        aria-pressed={isLoginMode}
                        onClick={() => switchMode('login')}
                    >
                        Вход
                    </button>
                    <button
                        type="button"
                        className={!isLoginMode ? 'active' : ''}
                        aria-pressed={!isLoginMode}
                        onClick={() => switchMode('register')}
                    >
                        Регистрация
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <label>
                        <span>Имя</span>
                        <input
                            type="text"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            placeholder="Например, daniil"
                            autoComplete="username"
                            autoFocus
                            required
                        />
                    </label>

                    <label>
                        <span>Пароль</span>
                        <input
                            type="password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            placeholder="Минимум 4 символа"
                            autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                            required
                        />
                    </label>

                    {!isLoginMode && (
                        <>
                            <label>
                                <span>Возраст</span>
                                <input
                                    type="number"
                                    min="12"
                                    max="125"
                                    value={age}
                                    onChange={event => setAge(event.target.value)}
                                    placeholder="От 12 до 125"
                                    autoComplete="off"
                                    required
                                />
                            </label>

                            <label>
                                <span>Хобби</span>
                                <input
                                    type="text"
                                    value={hobby}
                                    onChange={event => setHobby(event.target.value)}
                                    placeholder="Кино, музыка, спорт"
                                    autoComplete="off"
                                    required
                                />
                            </label>

                            <p className="field-hint">Если хобби несколько, перечислите их через запятую.</p>
                        </>
                    )}

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="submit-button"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Отправка...'
                            : isLoginMode
                                ? 'Войти'
                                : 'Зарегистрироваться'}
                    </button>
                </form>

                <button
                    type="button"
                    className="mode-link"
                    onClick={() => switchMode(isLoginMode ? 'register' : 'login')}
                >
                    {isLoginMode
                        ? 'Нет аккаунта? Зарегистрироваться'
                        : 'Уже есть аккаунт? Войти'}
                </button>
            </section>
        </main>
    );
}
