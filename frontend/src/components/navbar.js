import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Retrieve user data for the dynamic profile display
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username') || 'User';
    const profilePic = localStorage.getItem('profilePic'); // Base64 string from DB

    const logout = () => {
        localStorage.clear();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={styles.nav}>
            {/* Brand / Logo Section */}
            <div style={styles.brand} onClick={() => navigate(role === 'admin' ? '/dashboard' : '/sales')}>
                <div style={styles.logoIcon}>💊</div>
                <span style={styles.logoText}>Polycare <span style={{fontWeight: '300'}}>Chemist</span></span>
            </div>

            {/* Navigation Links Section */}
            <div style={styles.navLinks}>
                <Link to={role === 'admin' ? '/dashboard' : '/sales'} 
                      style={{...styles.link, ...(isActive('/dashboard') || isActive('/sales') ? styles.activeLink : {})}}>
                    Dashboard
                </Link>
                
                <Link to="/inventory" 
                      style={{...styles.link, ...(isActive('/inventory') ? styles.activeLink : {})}}>
                    Inventory
                </Link>

                <Link to="/sales" 
                      style={{...styles.link, ...(isActive('/sales') ? styles.activeLink : {})}}>
                    Sales
                </Link>

                {role === 'admin' && (
                    <Link to="/audit" 
                          style={{...styles.link, ...(isActive('/audit') ? styles.activeLink : {})}}>
                        Audit Logs
                    </Link>
                )}

                {/* Profile Link added to main navigation */}
                <Link to="/profile" 
                      style={{...styles.link, ...(isActive('/profile') ? styles.activeLink : {})}}>
                    Profile
                </Link>
            </div>

            {/* User Auth Section with Avatar */}
            <div style={styles.auth}>
                <div style={styles.userInfo} onClick={() => navigate('/profile')} title="View Profile">
                    <span style={styles.roleTag}>{role?.toUpperCase()}</span>
                    
                    {/* Dynamic Avatar: Shows photo if exists, else shows initial */}
                    <div style={styles.avatarCircle}>
                        {profilePic ? (
                            <img src={profilePic} alt="User" style={styles.avatarImg} />
                        ) : (
                            <span style={styles.initial}>{username[0]?.toUpperCase()}</span>
                        )}
                    </div>
                </div>
                <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </div>
        </nav>
    );
};

// --- Modern Clinical Styles ---
const styles = {
    nav: {
        background: '#ffffff',
        padding: '0 40px',
        height: '70px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        fontFamily: "'Inter', sans-serif"
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer'
    },
    logoIcon: {
        fontSize: '1.5rem',
        background: '#e0f2fe',
        padding: '5px',
        borderRadius: '8px'
    },
    logoText: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#0f172a',
        letterSpacing: '-0.5px'
    },
    navLinks: {
        display: 'flex',
        gap: '5px'
    },
    link: {
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
        padding: '8px 16px',
        borderRadius: '8px',
        transition: 'all 0.2s ease'
    },
    activeLink: {
        color: '#0284c7',
        background: '#f0f9ff',
    },
    auth: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        padding: '5px 10px',
        borderRadius: '30px',
        transition: 'background 0.2s',
        ":hover": { background: '#f8fafc' }
    },
    roleTag: {
        fontSize: '0.65rem',
        background: '#f1f5f9',
        padding: '4px 10px',
        borderRadius: '20px',
        color: '#475569',
        fontWeight: '700',
        border: '1px solid #e2e8f0'
    },
    avatarCircle: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: '#0284c7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: '2px solid #e0f2fe'
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    initial: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1rem'
    },
    logoutBtn: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '8px 18px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'opacity 0.2s'
    }
};

export default Navbar;