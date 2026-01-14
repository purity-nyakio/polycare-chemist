import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            {/* Background Decorative Circles */}
            <div style={styles.circle1}></div>
            <div style={styles.circle2}></div>

            <div style={styles.hero}>
                <div style={styles.badge}>your trusted chemist</div>
                <h1 style={styles.title}>Polycare Chemist</h1>
                <p style={styles.subtitle}>
                    Precision Inventory & Sales Management. <br/>
                    Optimized for Local Pharmaceutical Operations <b> welcome</b>.
                </p>
                
                <div style={styles.buttonGroup}>
                    <button onClick={() => navigate('/login')} style={styles.btnPrimary}>
                        Go to Staff Portal
                    </button>
                    <button onClick={() => navigate('/register')} style={styles.btnSecondary}>
                        Register New Staff
                    </button>
                </div>

            
            </div>
            
            <footer style={styles.footer}>
                © 2024 Polycare Management System • Nairobi, Kenya
            </footer>
        </div>
    );
};

const styles = {
    container: { 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        background: '#f8fafc', // Clean clinical white/blue background
        color: '#1e293b', 
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
        position: 'relative'
    },
    circle1: { position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: '#e0f2fe', zIndex: 1 },
    circle2: { position: 'absolute', bottom: '-10%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: '#f1f5f9', zIndex: 1 },
    hero: { 
        textAlign: 'center', 
        padding: '60px', 
        borderRadius: '24px', 
        background: 'white', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        zIndex: 10,
        maxWidth: '700px'
    },
    badge: { background: '#dcfce7', color: '#2405f0ff', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' },
    title: { fontSize: '3.5rem', marginBottom: '10px', color: '#0f172a', letterSpacing: '-1px' },
    subtitle: { fontSize: '1.2rem', marginBottom: '40px', color: '#64748b', lineHeight: '1.6' },
    buttonGroup: { display: 'flex', gap: '15px', justifyContent: 'center' },
    btnPrimary: { padding: '16px 32px', fontSize: '1rem', cursor: 'pointer', border: 'none', borderRadius: '12px', background: '#0284c7', color: 'white', fontWeight: 'bold', transition: '0.3s' },
    btnSecondary: { padding: '16px 32px', fontSize: '1rem', cursor: 'pointer', border: '2px solid #e2e8f0', borderRadius: '12px', background: 'transparent', color: '#475569', fontWeight: 'bold' },
    features: { display: 'flex', gap: '30px', justifyContent: 'center', marginTop: '50px', borderTop: '1px solid #f1f5f9', paddingTop: '30px' },
    featureItem: { fontSize: '0.9rem', color: '#94a3b8', fontWeight: '600' },
    footer: { position: 'absolute', bottom: '20px', fontSize: '0.8rem', color: '#94a3b8' }
};

export default Home;