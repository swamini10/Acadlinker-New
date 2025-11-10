// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Input = ({ label, name, type = 'text', value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1 w-full border px-3 py-2 rounded-lg"
    />
  </div>
);

const AuthPage = () => {
  const { login, register } = useAuth();
  const [view, setView] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const result = view === 'login'
      ? await login(form)
      : await register(form);
    setMsg(result.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="mb-8 flex items-center space-x-2">
        <Home className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold">Acadlinker</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl w-96 space-y-4">
        {view === 'register' && (
          <Input label="Full Name" name="full_name" value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        )}
        <Input label="Email" name="email" type="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" name="password" type="password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

        {msg && <p className="text-center text-sm text-red-500">{msg}</p>}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> :
            (view === 'login' ? <><LogIn className="h-5 w-5 mr-2" /> Login</> :
              <><UserPlus className="h-5 w-5 mr-2" /> Register</>)}
        </button>
      </form>

      <p className="mt-4 text-sm">
        {view === 'login' ? (
          <>New user? <button onClick={() => setView('register')} className="text-indigo-600">Register</button></>
        ) : (
          <>Already have an account? <button onClick={() => setView('login')} className="text-indigo-600">Login</button></>
        )}
      </p>
    </div>
  );
};

export default AuthPage;
