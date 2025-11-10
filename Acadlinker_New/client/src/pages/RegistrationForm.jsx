// src/pages/RegistrationForm.jsx

import React, { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import InputField from '../components/InputField';

const RegistrationForm = ({ onViewChange }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '', email: '', mobile_no: '', password: '', confirm_password: ''
    });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        if (formData.password !== formData.confirm_password) {
            setStatus('Error: Passwords do not match.');
            setLoading(false);
            return;
        }

        const result = await register(formData);

        if (result.success) {
            setStatus('Registration successful! Redirecting to login...');
            setTimeout(() => onViewChange('login'), 1500);
        } else {
            setStatus(result.message || 'Registration failed.');
        }
        setLoading(false);
    };

    return (
        <Card
            title="Create Account"
            footer={(
                <>
                    Already have an account?{' '}
                    <button
                        onClick={() => onViewChange('login')}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Sign in
                    </button>
                </>
            )}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required />
                <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <InputField label="Mobile Number (Optional)" name="mobile_no" value={formData.mobile_no} onChange={handleChange} />
                <InputField label="Password (Min 6 chars)" name="password" type="password" value={formData.password} onChange={handleChange} required />
                <InputField label="Confirm Password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required />

                {status && <p className={`text-sm text-center ${status.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>{status}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-150"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <UserPlus className="h-5 w-5 mr-2" />}
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
        </Card>
    );
};

export default RegistrationForm;