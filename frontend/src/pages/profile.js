import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

const Profile = () => {
    const fileInputRef = useRef(null);
    const [user, setUser] = useState({
        username: '',
        fullName: '',
        phoneNumber: '',
        email: '',
        year: '',
        role: '',
        profilePic: ''
    });
    
    // Track both passwords separately
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch data from localStorage and also try to get fresh data from server
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { 'x-auth-token': token }
                });
                setUser(res.data);
            } catch (err) {
                // Fallback to localStorage if server fetch fails
                setUser({
                    username: localStorage.getItem('username') || 'User',
                    role: localStorage.getItem('role') || 'staff',
                    fullName: localStorage.getItem('fullName') || 'Polycare Staff',
                    phoneNumber: localStorage.getItem('phoneNumber') || '',
                    email: localStorage.getItem('email') || '',
                    year: localStorage.getItem('year') || '2024',
                    profilePic: localStorage.getItem('profilePic') || ''
                });
            }
        };
        fetchUserData();
    }, []);

    const handlePhotoClick = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (optional but recommended: e.g., < 2MB)
            if (file.size > 2000000) {
                setMessage("❌ Image too large. Please select a smaller photo.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({ ...user, profilePic: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage("Updating...");
        
        const token = localStorage.getItem('token');

        // Validation: Current password is required for security updates
        if (!currentPassword) {
            setMessage("❌ Current password is required to save changes.");
            return;
        }

        try {
            const res = await axios.put('http://localhost:5000/api/auth/profile', 
                { 
                    fullName: user.fullName, 
                    phoneNumber: user.phoneNumber, 
                    email: user.email,
                    year: user.year,
                    profilePic: user.profilePic, 
                    currentPassword: currentPassword, // Sent to backend for verification
                    password: newPassword // The new password if provided
                },
                { headers: { 'x-auth-token': token } }
            );
            
            // Update local storage with new info
            localStorage.setItem('fullName', user.fullName);
            localStorage.setItem('phoneNumber', user.phoneNumber);
            localStorage.setItem('email', user.email);
            localStorage.setItem('year', user.year);
            localStorage.setItem('profilePic', user.profilePic);
            
            setMessage("✅ Profile updated successfully!");
            setCurrentPassword(''); // Reset password fields
            setNewPassword('');
        } catch (err) {
            // Display the specific error message from your backend
            const errorMsg = err.response?.data?.msg || "Update failed.";
            setMessage(`❌ ${errorMsg}`);
        }
    };

    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.avatarWrapper} onClick={handlePhotoClick} title="Click to change photo">
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" style={styles.profileImg} />
                            ) : (
                                <div style={styles.avatar}>{user.username[0]?.toUpperCase()}</div>
                            )}
                            <div style={styles.cameraOverlay}>📷 Change</div>
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            onChange={handleFileChange} 
                        />

                        <h2 style={{margin: '10px 0 5px'}}>{user.username}</h2>
                        <span style={styles.badge}>{user.role?.toUpperCase()}</span>
                    </div>

                    <form onSubmit={handleUpdate} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input 
                                type="text" 
                                style={styles.input} 
                                value={user.fullName} 
                                onChange={(e) => setUser({...user, fullName: e.target.value})} 
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input 
                                type="email" 
                                style={styles.input} 
                                value={user.email} 
                                onChange={(e) => setUser({...user, email: e.target.value})} 
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <input 
                                type="text" 
                                style={styles.input} 
                                value={user.phoneNumber} 
                                onChange={(e) => setUser({...user, phoneNumber: e.target.value})} 
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Year</label>
                            <input 
                                type="text" 
                                style={styles.input} 
                                value={user.year} 
                                onChange={(e) => setUser({...user, year: e.target.value})} 
                            />
                        </div>

                        <hr style={{border: '0', borderTop: '1px solid #eee', margin: '15px 0'}} />

                        <div style={styles.inputGroup}>
                            <label style={{...styles.label, color: '#e74c3c'}}>Current Password (Required)</label>
                            <input 
                                type="password" 
                                placeholder="Enter to confirm changes"
                                style={{...styles.input, borderColor: currentPassword ? '#ddd' : '#fab1a0'}} 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)} 
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>New Password (Optional)</label>
                            <input 
                                type="password" 
                                placeholder="Leave blank to keep current"
                                style={styles.input} 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} 
                            />
                        </div>

                        <button type="submit" style={styles.button}>Save All Changes</button>
                    </form>
                    {message && <p style={{...styles.message, color: message.includes('✅') ? '#2ecc71' : '#e74c3c'}}>{message}</p>}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', padding: '40px 20px' },
    card: { background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '450px', textAlign: 'center' },
    header: { marginBottom: '20px' },
    avatarWrapper: { 
        position: 'relative', 
        width: '110px', 
        height: '110px', 
        margin: '0 auto', 
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: '50%',
        border: '3px solid #007bff'
    },
    avatar: { width: '100%', height: '100%', background: '#4db8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white' },
    profileImg: { width: '100%', height: '100%', objectFit: 'cover' },
    cameraOverlay: { 
        position: 'absolute', 
        bottom: 0, 
        width: '100%', 
        background: 'rgba(0,0,0,0.6)', 
        color: 'white', 
        fontSize: '0.7rem', 
        padding: '4px 0',
        fontWeight: 'bold'
    },
    badge: { background: '#f8f9fa', padding: '5px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#6c757d', border: '1px solid #dee2e6' },
    form: { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '0.75rem', fontWeight: 'bold', color: '#555', textTransform: 'uppercase' },
    input: { padding: '11px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none' },
    button: { padding: '14px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold', fontSize: '1rem' },
    message: { marginTop: '15px', fontSize: '0.9rem', fontWeight: '600' }
};

export default Profile;