import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

const Dashboard = () => {
    const [summary, setSummary] = useState({
        stockInvestment: 0,
        todayRevenue: 0,
        todayProfit: 0,
        itemsSold: 0
    });
    const [profitData, setProfitData] = useState([]);
    const [adminDetailedStock, setAdminDetailedStock] = useState([]); // New state for Admin audit
    const [loading, setLoading] = useState(true);
    
    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('username') || 'Pharmacist';
    
    const today = new Date().toISOString().split('T')[0];

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        
        try {
            setLoading(true);
            
            // 1. Fetch Summary Stats (Revenue, Today's Profit, etc.)
            const resSummary = await axios.get('http://localhost:5000/api/sales/dashboard-stats', config);
            setSummary(resSummary.data);

            // 2. Fetch Itemized Profit Table (Sales performance)
            const resProfit = await axios.get(`http://localhost:5000/api/sales/profit-summary?start=${today}&end=${today}`, config);
            setProfitData(resProfit.data);

            // 3. ADMIN ONLY: Fetch Detailed Financial Audit (Bought vs Sold)
            if (userRole === 'admin') {
                const resAdmin = await axios.get('http://localhost:5000/api/medicine/admin/stock-value', config);
                setAdminDetailedStock(resAdmin.data);
            }
            
            setLoading(false);
        } catch (err) {
            console.error("Connection Error: Is the backend server running?", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [today]);

    const formatKsh = (amount) => `Ksh ${Number(amount || 0).toLocaleString()}`;

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.container}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>
                            {userRole === 'admin' 
                                ? "Welcome, Dr. Rev. Polly Wawira" 
                                : `Welcome, ${userName}`}
                        </h1>
                        <p style={styles.subtitle}>Polycare Chemist Business Overview & Performance.</p>
                    </div>
                    <div style={styles.dateDisplay}>
                        <span style={styles.pulse}>●</span> {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>
                
                {/* Metrics Grid */}
                <div style={styles.grid}>
                    <div style={styles.card}>
                        <div style={{...styles.iconBox, background: '#e0f2fe'}}><span style={{color: '#0284c7'}}>📦</span></div>
                        <h3 style={styles.cardTitle}>Stock Investment</h3>
                        <p style={styles.moneyValue}>{formatKsh(summary.stockInvestment)}</p>
                        <span style={styles.cardDesc}>Capital tied in inventory</span>
                    </div>

                    <div style={{...styles.card, background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', color: 'white', boxShadow: '0 10px 25px -5px rgba(29, 78, 216, 0.3)'}}>
                        <div style={{...styles.iconBox, background: 'rgba(255,255,255,0.15)'}}><span style={{color: 'white'}}>💰</span></div>
                        <h3 style={{...styles.cardTitle, color: '#bfdbfe'}}>Today's Revenue</h3>
                        <p style={{...styles.moneyValue, color: 'white'}}>{formatKsh(summary.todayRevenue)}</p>
                        <span style={{...styles.cardDesc, color: '#dbeafe'}}>Total collections today</span>
                    </div>

                    <div style={styles.card}>
                        <div style={{...styles.iconBox, background: '#eff6ff'}}><span style={{color: '#2563eb'}}>📈</span></div>
                        <h3 style={styles.cardTitle}>Net Profit</h3>
                        <p style={{...styles.moneyValue, color: '#1e40af'}}>{formatKsh(summary.todayProfit)}</p>
                        <span style={styles.cardDesc}>Actual earnings after COGS</span>
                    </div>

                    <div style={styles.card}>
                        <div style={{...styles.iconBox, background: '#fff7ed'}}><span style={{color: '#ea580c'}}>💊</span></div>
                        <h3 style={styles.cardTitle}>Items Sold</h3>
                        <p style={styles.moneyValue}>{summary.itemsSold || 0}</p>
                        <span style={styles.cardDesc}>Unit movement today</span>
                    </div>
                </div>

                <div style={styles.insightsSection}>
                    <div style={styles.insightItem}>
                        <strong>Efficiency Tip:</strong> {summary.todayRevenue > 10000 ? "High traffic. Check front-shelf stock." : "Traffic is steady. Great time for a stock audit."}
                    </div>
                    <div style={{...styles.insightItem, borderLeftColor: '#2563eb'}}>
                        <strong>Profit Margin:</strong> {summary.todayRevenue > 0 ? ((summary.todayProfit / summary.todayRevenue) * 100).toFixed(1) : 0}% return on sales.
                    </div>
                </div>

                {/* ADMIN ONLY: Detailed Financial Audit Table */}
                {userRole === 'admin' && (
                    <div style={{...styles.tableCard, marginBottom: '40px', borderLeft: '10px solid #dc2626'}}>
                        <div style={styles.tableHeader}>
                            <h2 style={{...styles.tableTitle, color: '#b91c1c'}}>💰 Admin Financial Audit (Stock Value)</h2>
                            <span style={styles.adminBadge}>Confidential</span>
                        </div>
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Medicine</th>
                                        <th style={styles.th}>Batch</th>
                                        <th style={styles.th}>Qty</th>
                                        <th style={styles.th}>Bought (Unit)</th>
                                        <th style={styles.th}>Sells (Unit)</th>
                                        <th style={styles.th}>Total Investment</th>
                                        <th style={styles.th}>Potential Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminDetailedStock.length > 0 ? adminDetailedStock.map((item, i) => (
                                        <tr key={i} style={styles.tr}>
                                            <td style={styles.td}><strong>{item.name}</strong></td>
                                            <td style={styles.td}>{item.batchNumber}</td>
                                            <td style={styles.td}><span style={styles.qtyBadge}>{item.quantity}</span></td>
                                            <td style={{...styles.td, color: '#dc2626', fontWeight: 'bold'}}>{formatKsh(item.unitBuyingPrice)}</td>
                                            <td style={{...styles.td, color: '#16a34a', fontWeight: 'bold'}}>{formatKsh(item.unitSellingPrice)}</td>
                                            <td style={styles.td}>{formatKsh(item.totalInvestment)}</td>
                                            <td style={{...styles.td, color: '#2563eb', fontWeight: '900'}}>{formatKsh(item.potentialProfit)}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No stock data available for audit.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* General Sales Performance Table */}
                <div style={styles.tableCard}>
                    <div style={styles.tableHeader}>
                        <h2 style={styles.tableTitle}>Itemized Sales Performance (Today)</h2>
                        <div style={{display: 'flex', gap: '10px'}}>
                             <button style={styles.exportBtn} onClick={fetchDashboardData}>Refresh</button>
                             <button style={styles.exportBtn} onClick={() => window.print()}>Generate Report</button>
                        </div>
                    </div>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Drug Name</th>
                                    <th style={styles.th}>Qty Sold</th>
                                    <th style={styles.th}>Revenue</th>
                                    <th style={styles.th}>Profit</th>
                                    <th style={styles.th}>Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profitData.length > 0 ? profitData.map((item, i) => (
                                    <tr key={i} style={styles.tr}>
                                        <td style={styles.td}><strong>{item.name}</strong></td>
                                        <td style={styles.td}><span style={styles.qtyBadge}>{item.totalQty}</span></td>
                                        <td style={styles.td}>{formatKsh(item.totalRevenue)}</td>
                                        <td style={styles.td}><span style={styles.profitText}>+{formatKsh(item.totalProfit)}</span></td>
                                        <td style={styles.td}>{item.totalRevenue > 0 ? ((item.totalProfit / item.totalRevenue) * 100).toFixed(1) : 0}%</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                                            {loading ? "Crunching numbers..." : "No sales data recorded for today yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: '100vh', background: '#f1f5f9' },
    container: { padding: '40px', maxWidth: '1280px', margin: 'auto', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    title: { fontSize: '2.2rem', color: '#1e3a8a', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' },
    subtitle: { color: '#475569', margin: '5px 0 0 0', fontSize: '1rem', fontWeight: '500' },
    dateDisplay: { background: 'white', padding: '12px 20px', borderRadius: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: '#1e3a8a', fontWeight: '700', fontSize: '0.9rem', border: '1px solid #e2e8f0' },
    pulse: { color: '#3b82f6', marginRight: '10px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '35px' },
    card: { background: 'white', padding: '28px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' },
    iconBox: { width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '22px' },
    cardTitle: { fontSize: '0.85rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px 0' },
    moneyValue: { fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' },
    cardDesc: { fontSize: '0.8rem', color: '#94a3b8' },
    insightsSection: { display: 'flex', gap: '20px', marginBottom: '40px' },
    insightItem: { flex: 1, background: '#fff', padding: '20px 25px', borderRadius: '18px', borderLeft: '8px solid #1d4ed8', fontSize: '0.95rem', color: '#334155', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    tableCard: { background: 'white', borderRadius: '28px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    tableTitle: { fontSize: '1.4rem', color: '#1e3a8a', fontWeight: '900', margin: 0 },
    adminBadge: { background: '#fee2e2', color: '#dc2626', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' },
    exportBtn: { background: '#eff6ff', color: '#1d4ed8', border: '2px solid #dbeafe', padding: '10px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '18px', textAlign: 'left', background: '#f8fafc', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800', borderBottom: '2px solid #f1f5f9' },
    td: { padding: '20px 18px', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#1e293b' },
    qtyBadge: { background: '#dbeafe', color: '#1e40af', padding: '5px 14px', borderRadius: '25px', fontWeight: '900', fontSize: '0.85rem' },
    profitText: { color: '#059669', fontWeight: '900' }
};

export default Dashboard;