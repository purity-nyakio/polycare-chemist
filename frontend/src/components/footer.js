import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                {/* Left: Branding & Rights */}
                <div style={styles.section}>
                    <span style={styles.brand}>Polycare Chemist</span>
                    <span style={styles.divider}>|</span>
                    <span style={styles.copyright}>© {currentYear} All Rights Reserved</span>
                </div>
                
                {/* Center: Developer Credit */}
                <div style={styles.centerSection}>
                    <span style={styles.devLabel}>Developed & Maintained by</span>
                    <span style={styles.developerName}>Purecare Technologies</span>
                    <div style={styles.versionTag}>v2.0.1 - Secure Engine</div>
                </div>

                {/* Right: Admin Credit */}
                <div style={styles.section}>
                    <span style={styles.admin}>
                        Admin: <strong>Dr. Rev. Polly Wawira</strong>
                    </span>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        background: '#ffffff',
        borderTop: '2px solid #f1f5f9',
        padding: '25px 0',
        color: '#64748b',
        fontSize: '0.85rem',
        marginTop: 'auto', 
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    section: {
        display: 'flex',
        alignItems: 'center',
    },
    centerSection: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
    },
    brand: {
        fontWeight: '800',
        color: '#1e3a8a',
        letterSpacing: '0.02em',
    },
    divider: {
        margin: '0 10px',
        color: '#cbd5e1',
    },
    devLabel: {
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#94a3b8',
    },
    developerName: {
        fontWeight: '700',
        color: '#0f172a',
        fontSize: '0.9rem',
    },
    versionTag: {
        fontSize: '0.7rem',
        color: '#3b82f6',
        background: '#eff6ff',
        padding: '2px 10px',
        borderRadius: '10px',
        marginTop: '2px',
    },
    admin: {
        color: '#475569',
    }
};

export default Footer;