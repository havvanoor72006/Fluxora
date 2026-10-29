
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setMessage(error ? error.message : 'Login successful!');
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setMessage(
      error
        ? error.message
        : 'Account created! Check your email if confirmation is required.'
    );
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'Arial' }}>
      <h1>Fluxora</h1>
      <p>Sign in or create your account</p>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', padding: 12, marginBottom: 12 }}
      />

      <input
        type="password"
        placeholder="Password (at least 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', padding: 12, marginBottom: 12 }}
      />

      <button onClick={signIn}>Log in</button>{' '}
      <button onClick={signUp}>Sign up</button>

      <p>{message}</p>
    </div>
  );
}
