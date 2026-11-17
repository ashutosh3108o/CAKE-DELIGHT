import React, { useState } from 'react';
import { CakeSlice, UserRound, LockKeyhole, ArrowRight, ArrowLeft } from 'lucide-react';
import './Login.css';

function LoginPage({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    onLogin();
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <button className="login-back" onClick={onBack}>
          <ArrowLeft size={17} /> Back to Home
        </button>

        <div className="login-logo">
          <CakeSlice size={35} />
        </div>

        <h1>Welcome Back!</h1>

        <p className="login-subtitle">
          Sign in to explore the delicious world of Cake Delight.
        </p>

        <form onSubmit={handleSubmit}>

          <label>Username</label>
          <div className="login-input">
            <UserRound size={19} />
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <label>Password</label>
          <div className="login-input">
            <LockKeyhole size={19} />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit">
            Sign In <ArrowRight size={19} />
          </button>

        </form>

        <div className="login-footer">
          © 2026 Cake Delight. Made with love.
        </div>

      </div>

    </div>
  );
}

export default LoginPage;
