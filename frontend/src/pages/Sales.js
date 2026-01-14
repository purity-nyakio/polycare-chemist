import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

const Sales = () => {
    const [medicines, setMedicines] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
    const [selectedMedId, setSelectedMedId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [status, setStatus] = useState({ msg: '', isError: false });
    
    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('username') || 'Pharmacist';

    const fetchStock = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/medicine/all', {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setMedicines(res.data);
        } catch (err) { console.error("Stock fetch failed"); }
    };

    const fetchSalesHistory = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/sales/history?date=${selectedDate}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setSalesHistory(res.data);
        } catch (err) { 
            console.error("History fetch failed"); 
            setSalesHistory([]); 
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchStock();
        fetchSalesHistory();
    }, [fetchSalesHistory]);

    const handleQuickUnit = (val) => {
        setQuantity(val);
    };

    const selectedMedData = medicines.find(m => m.medicineId === selectedMedId);
    const pricePreview = selectedMedData ? (selectedMedData.sellingPrice * parseFloat(quantity)).toFixed(2) : "0.00";

    const handleSale = async (e) => {
        e.preventDefault();
        if (parseFloat(quantity) <= 0) {
            setStatus({ msg: "❌ Quantity must be greater than 0", isError: true });
            return;
        }

        const saleData = { 
            medicineId: selectedMedId, 
            quantitySold: parseFloat(quantity), 
            pharmacistName: userName
        };

        try {
            await axios.post('http://localhost:5000/api/sales/checkout', saleData, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setStatus({ msg: `✅ Sold! Total: KES ${pricePreview}`, isError: false });
            setSelectedMedId('');
            setQuantity(1);
            fetchStock();
            fetchSalesHistory(); 
        } catch (err) {
            setStatus({ msg: "❌ " + (err.response?.data?.msg || "Sale failed"), isError: true });
        }
    };

    const deleteSale = async (id) => {
        if (!window.confirm("Reverse this sale? Stock will be returned.")) return;
        try {
            await axios.delete(`http://localhost:5000/api/sales/${id}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            fetchSalesHistory();
            fetchStock();
        } catch (err) { alert(err.response?.data?.msg); }
    };

    const filteredSales = salesHistory.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.pharmacistName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const dailyTotal = salesHistory.reduce((acc, curr) => acc + curr.totalSellingPrice, 0);
    const dailyProfit = salesHistory.reduce((acc, curr) => acc + curr.profit, 0);

    // Grouping logic for the Itemized Report
    const itemizedData = Object.values(filteredSales.reduce((acc, sale) => {
        if (!acc[sale.name]) {
            acc[sale.name] = { name: sale.name, qty: 0, revenue: 0, profit: 0 };
        }
        acc[sale.name].qty += sale.quantitySold;
        acc[sale.name].revenue += sale.totalSellingPrice;
        acc[sale.name].profit += sale.profit;
        return acc;
    }, {}));

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.container}>
                
                {/* Header Section */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.mainTitle}>POS Terminal</h1>
                        <p style={styles.welcomeText}>Welcome, {userRole === 'admin' ? 'Dr. Rev. Polly Wawira' : userName}</p>
                    </div>
                    <div style={styles.dateSelector}>
                        <label style={styles.smallLabel}>Transaction Date</label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.dateInput} />
                    </div>
                </div>

                {/* Dashboard Highlights */}
                <div style={styles.statsBar}>
                    <div style={styles.statBox}>
                        <span style={styles.statLabel}>DAILY REVENUE</span>
                        <span style={styles.statValue}>KES {dailyTotal.toLocaleString()}</span>
                    </div>
                    <div style={{...styles.statBox, borderLeft: '1px solid rgba(255,255,255,0.2)'}}>
                        <span style={styles.statLabel}>NET PROFIT</span>
                        <span style={{...styles.statValue, color: '#4ade80'}}>KES {dailyProfit.toLocaleString()}</span>
                    </div>
                </div>

                {/* Sell Section */}
                {selectedDate === new Date().toISOString().split('T')[0] && (
                    <div style={styles.checkoutCard}>
                        <h3 style={styles.cardTitle}>New Transaction</h3>
                        <form onSubmit={handleSale} style={styles.formRow}>
                            <div style={{ flex: 3 }}>
                                <label style={styles.smallLabel}>Search Medicine</label>
                                <select value={selectedMedId} onChange={(e) => setSelectedMedId(e.target.value)} required style={styles.select}>
                                    <option value="">Choose medicine...</option>
                                    {medicines.map(m => (
                                        <option key={m.medicineId} value={m.medicineId} disabled={m.totalStock <= 0}>
                                            {m.name} — (In Stock: {m.totalStock}) — KES {m.sellingPrice}/-
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: 1 }}>
                                <label style={styles.smallLabel}>Quantity</label>
                                <div style={styles.qtyContainer}>
                                    <input 
                                        type="number" 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(e.target.value)} 
                                        step="0.5" 
                                        min="0.5" 
                                        style={styles.input} 
                                    />
                                    <div style={styles.quickQty}>
                                        <button type="button" onClick={() => handleQuickUnit(0.5)} style={styles.qtyBtn}>½</button>
                                        <button type="button" onClick={() => handleQuickUnit(1)} style={styles.qtyBtn}>1</button>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" style={styles.checkoutBtn}>
                                Complete Sale <br/>
                                <span style={{fontSize: '1.1rem'}}>KES {pricePreview}</span>
                            </button>
                        </form>
                        {status.msg && <div style={{ ...styles.status, backgroundColor: status.isError ? '#fee2e2' : '#f0fdf4', color: status.isError ? '#ef4444' : '#16a34a' }}>{status.msg}</div>}
                    </div>
                )}

                {/* Itemized Profit Report Section */}
                <div style={{...styles.tableCard, marginBottom: '30px', borderTop: '4px solid #16a34a'}}>
                    <div style={styles.tableHeader}>
                        <h3 style={styles.tableTitle}>Itemized Profit Performance (Today)</h3>
                        <button onClick={() => window.print()} style={styles.printBtn}>Generate Report</button>
                    </div>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Drug Name</th>
                                <th style={styles.th}>Qty Sold</th>
                                <th style={styles.th}>Revenue</th>
                                <th style={styles.th}>Profit</th>
                                <th style={styles.th}>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemizedData.map((item, idx) => (
                                <tr key={idx} style={styles.tr}>
                                    <td style={styles.td}><b>{item.name}</b></td>
                                    <td style={styles.td}>{item.qty}</td>
                                    <td style={styles.td}>KES {item.revenue.toFixed(2)}</td>
                                    <td style={styles.td}><b style={{color: '#16a34a'}}>KES {item.profit.toFixed(2)}</b></td>
                                    <td style={styles.td}>{((item.profit / item.revenue) * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                            {itemizedData.length === 0 && (
                                <tr><td colSpan="5" style={{...styles.td, textAlign: 'center', color: '#64748b'}}>No data for selected date</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Sales Log */}
                <div style={styles.tableCard}>
                    <div style={styles.tableHeader}>
                        <h3 style={styles.tableTitle}>Transaction Log</h3>
                        <input 
                            type="text" 
                            placeholder="🔍 Filter logs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Medicine Name</th>
                                <th style={styles.th}>Qty</th>
                                <th style={styles.th}>Total (KES)</th>
                                <th style={styles.th}>Staff</th>
                                {userRole === 'admin' && <th style={styles.th}>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(s => (
                                <tr key={s._id} style={styles.tr}>
                                    <td style={styles.td}><b>{s.name}</b></td>
                                    <td style={styles.td}><span style={styles.qtyBadge}>{s.quantitySold}</span></td>
                                    <td style={styles.td}><b>{s.totalSellingPrice.toFixed(2)}</b></td>
                                    <td style={styles.td}>{s.pharmacistName}</td>
                                    {userRole === 'admin' && (
                                        <td style={styles.td}>
                                            <button onClick={() => deleteSale(s._id)} style={styles.voidBtn}>Void Sale</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#f8fafc', minHeight: '100vh' },
    container: { padding: '30px', maxWidth: '1300px', margin: 'auto', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' },
    mainTitle: { fontSize: '2rem', color: '#1e3a8a', fontWeight: '900', margin: 0 },
    welcomeText: { color: '#64748b', margin: '5px 0 0 0', fontWeight: '500' },
    dateSelector: { textAlign: 'right' },
    dateInput: { padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '5px', outline: 'none' },
    statsBar: { display: 'flex', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', padding: '25px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.2)' },
    statBox: { flex: 1, padding: '0 25px', display: 'flex', flexDirection: 'column' },
    statLabel: { color: '#bfdbfe', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' },
    statValue: { color: 'white', fontSize: '1.6rem', fontWeight: '900', marginTop: '5px' },
    checkoutCard: { background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', marginBottom: '30px' },
    cardTitle: { margin: '0 0 20px 0', fontSize: '1.1rem', color: '#1e3a8a', fontWeight: '800' },
    formRow: { display: 'flex', gap: '20px', alignItems: 'flex-end' },
    select: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fcfdfe', fontSize: '0.95rem' },
    qtyContainer: { display: 'flex', gap: '5px' },
    input: { width: '80px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', textAlign: 'center' },
    quickQty: { display: 'flex', flexDirection: 'column', gap: '2px' },
    qtyBtn: { padding: '2px 8px', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700', color: '#1d4ed8' },
    checkoutBtn: { flex: 1.5, background: '#1e3a8a', color: 'white', border: 'none', padding: '12px', borderRadius: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 10px rgba(30, 58, 138, 0.3)' },
    smallLabel: { display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' },
    status: { marginTop: '15px', padding: '12px', borderRadius: '10px', fontWeight: '600', textAlign: 'center' },
    tableCard: { background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    tableHeader: { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tableTitle: { margin: 0, fontSize: '1.1rem', color: '#1e3a8a', fontWeight: '800' },
    searchInput: { padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '300px', outline: 'none' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { background: '#f8fafc' },
    th: { padding: '15px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' },
    td: { padding: '18px 15px', borderBottom: '1px solid #f8fafc', fontSize: '0.9rem', color: '#334155' },
    qtyBadge: { background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '12px', fontWeight: '800' },
    voidBtn: { background: 'none', border: '1px solid #fee2e2', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' },
    printBtn: { background: '#1e293b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }
};

export default Sales;