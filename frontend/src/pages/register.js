import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        phoneNumber: '',
        password: '',
        role: 'pharmacist' // Default role
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            alert("Registration Successful! Please Login.");
            navigate('/login');
        } catch (err) {
            alert("Registration Failed: " + (err.response?.data?.msg || "Error"));
        }
    };

    return (
        <div>
            {/* Show Navbar only if logged in, otherwise just show the form */}
            {localStorage.getItem('token') && <Navbar />}
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={{color: '#2c3e50'}}>Register New Staff</h2>
                    <p style={{fontSize: '0.8rem', color: '#666'}}>Polycare Chemist Management</p>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <input type="text" placeholder="Username" style={styles.input} onChange={e => setFormData({...formData, username: e.target.value})} required />
                        <input type="text" placeholder="Full Name" style={styles.input} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                        <input type="text" placeholder="Phone (e.g. 0712345678)" style={styles.input} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} required />
                        <input type="password" placeholder="Password" style={styles.input} onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <select style={styles.input} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="pharmacist">Pharmacist</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" style={styles.button}>Create Account</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh', backgroundColor: '#f4f7f6' },
    card: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' },
    button: { padding: '12px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Register;