import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

const AuditHistory = () => {
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/audit/logs', {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            // Sort by date newest first just in case backend didn't
            const sortedLogs = res.data.sort((a, b) => 
                new Date(b.createdAt || b.timestamp || b.date) - new Date(a.createdAt || a.timestamp || a.date)
            );
            setLogs(sortedLogs);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching audit trail:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        (log.medicineName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.pharmacistName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.action?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (log.batchNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    // Summary Stats
    const salesCount = filteredLogs.filter(l => l.action === 'SALE').length;
    const restockCount = filteredLogs.filter(l => l.action === 'RESTOCK').length;

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.container}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>System Audit Trail</h1>
                        <p style={styles.subtitle}>Real-time tracking of every stock movement.</p>
                    </div>
                    <button onClick={fetchLogs} style={styles.refreshBtn}>
                        {loading ? '⌛ Loading...' : '🔄 Refresh Logs'}
                    </button>
                </header>

                {/* Summary Ribbon */}
                <div style={styles.summaryRibbon}>
                    <div style={styles.summaryBox}>
                        <span style={styles.summaryLabel}>TOTAL ACTIONS</span>
                        <span style={styles.summaryValue}>{filteredLogs.length}</span>
                    </div>
                    <div style={styles.summaryBox}>
                        <span style={styles.summaryLabel}>SALES LOGGED</span>
                        <span style={{...styles.summaryValue, color: '#16a34a'}}>{salesCount}</span>
                    </div>
                    <div style={styles.summaryBox}>
                        <span style={styles.summaryLabel}>RESTOCKS LOGGED</span>
                        <span style={{...styles.summaryValue, color: '#2563eb'}}>{restockCount}</span>
                    </div>
                </div>

                <div style={styles.searchBar}>
                    <input 
                        type="text" 
                        placeholder="🔍 Search medicine, staff, or batch number..." 
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Date & Time</th>
                                <th style={styles.th}>User</th>
                                <th style={styles.th}>Action</th>
                                <th style={styles.th}>Medicine</th>
                                <th style={styles.th}>Batch</th>
                                <th style={styles.th}>Change</th>
                                <th style={styles.th}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length > 0 ? filteredLogs.map(log => {
                                const logDate = new Date(log.createdAt || log.timestamp || log.date);
                                return (
                                    <tr key={log._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{fontSize: '0.85rem', fontWeight: '600'}}>
                                                {logDate.toLocaleDateString('en-KE')}
                                            </div>
                                            <div style={{fontSize: '0.75rem', color: '#64748b'}}>
                                                {logDate.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td style={styles.td}><b>{log.pharmacistName}</b></td>
                                        <td style={styles.td}>
                                            <span style={log.action === 'SALE' ? styles.badgeSale : (log.action === 'RESTOCK' ? styles.badgeRestock : styles.badgeGeneric)}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{log.medicineName}</td>
                                        <td style={styles.td}><code style={styles.code}>{log.batchNumber || '—'}</code></td>
                                        <td style={{
                                            ...styles.td, 
                                            color: log.quantityChanged < 0 ? '#dc2626' : '#16a34a', 
                                            fontWeight: '800'
                                        }}>
                                            {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                                        </td>
                                        <td style={styles.tdSmall}>{log.details}</td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                                        {loading ? "Fetching records..." : "No matching audit records found."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: '100vh', background: '#f8fafc' },
    container: { padding: '30px', maxWidth: '1400px', margin: 'auto', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    title: { fontSize: '1.8rem', color: '#1e3a8a', margin: 0, fontWeight: '800' },
    subtitle: { color: '#64748b', margin: '5px 0 0 0' },
    summaryRibbon: { display: 'flex', gap: '20px', marginBottom: '25px' },
    summaryBox: { flex: 1, background: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    summaryLabel: { display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', marginBottom: '5px' },
    summaryValue: { fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' },
    refreshBtn: { padding: '10px 20px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.2s' },
    searchBar: { marginBottom: '20px' },
    searchInput: { width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' },
    tableContainer: { background: 'white', borderRadius: '15px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
    th: { padding: '18px 15px', color: '#475569', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: '0.2s' },
    td: { padding: '15px', fontSize: '0.9rem', color: '#1e293b' },
    tdSmall: { padding: '15px', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' },
    code: { background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', color: '#475569' },
    badgeSale: { background: '#dcfce7', color: '#15803d', padding: '5px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' },
    badgeRestock: { background: '#dbeafe', color: '#1d4ed8', padding: '5px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' },
    badgeGeneric: { background: '#f1f5f9', color: '#475569', padding: '5px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' }
};

export default AuditHistory;