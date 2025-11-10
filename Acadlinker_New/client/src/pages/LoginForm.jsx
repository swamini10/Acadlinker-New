// src/pages/LoginForm.jsx

import React, { useState } from 'react';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import InputField from '../components/InputField';

const LoginForm = ({ onViewChange }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        const result = await login(formData);

        if (!result.success) {
            setStatus(result.message || 'Login failed. Check your credentials.');
        }
        // If successful, the AuthContext updates and App.jsx handles the redirect
        setLoading(false);
    };

    return (
        <Card
            title="Sign In"
            footer={(
                <>
                    New user?{' '}
                    <button
                        onClick={() => onViewChange('register')}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Create an account
                    </button>
                </>
            )}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <InputField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {status && <p className="text-sm text-red-600 text-center">{status}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                    {loading ? 'Logging In...' : 'Login'}
                </button>
            </form>
        </Card>
    );
};

export default LoginForm;