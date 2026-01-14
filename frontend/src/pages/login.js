import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        role: 'pharmacist' // Default role
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
            
            // 1. Save data to localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('username', res.data.username);

            // 2. Redirect based on role chosen
            if (res.data.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/sales'); // Pharmacists go straight to the Sales/POS page
            }
        } catch (err) {
            setError(err.response?.data?.msg || "Login Failed! Please check your credentials.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginCard}>
                <h2 style={styles.title}>Polycare Chemist</h2>
                <p style={styles.subtitle}>Staff Portal Login</p>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>Login As:</label>
                    <select 
                        name="role" 
                        value={credentials.role} 
                        onChange={handleChange} 
                        style={styles.select}
                    >
                        <option value="pharmacist">Pharmacist</option>
                        <option value="admin">Administrator</option>
                    </select>

                    <input 
                        type="text" 
                        name="username" 
                        placeholder="Username" 
                        style={styles.input} 
                        onChange={handleChange} 
                        required 
                    />
                    
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        style={styles.input} 
                        onChange={handleChange} 
                        required 
                    />

                    <button type="submit" style={styles.button}>Enter System</button>
                </form>

                {error && <p style={styles.error}>{error}</p>}
                
                <p style={styles.footer}>Polycare Management System v1.0 • KES Enabled</p>
            </div>
        </div>
    );
};

// --- Styles ---
const styles = {
    container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' },
    loginCard: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '380px', textAlign: 'center' },
    title: { color: '#2c3e50', marginBottom: '5px', fontSize: '1.8rem' },
    subtitle: { color: '#7f8c8d', marginBottom: '25px', fontSize: '0.9rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' },
    label: { fontSize: '0.8rem', fontWeight: 'bold', color: '#34495e' },
    select: { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', background: '#f9f9f9', cursor: 'pointer' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
    button: { padding: '14px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' },
    error: { color: '#e74c3c', marginTop: '15px', fontSize: '0.85rem', fontWeight: 'bold' },
    footer: { marginTop: '30px', fontSize: '0.7rem', color: '#bdc3c7' }
};

export default Login;