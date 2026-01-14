import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

const Inventory = () => {
    const [formData, setFormData] = useState({
        medicineId: '', name: '', company: '', quantity: '', 
        buyingPrice: '', sellingPrice: '', batchNumber: '', 
        expiryDate: '', receiptNo: '', category: 'General', type: 'Tablet'
    });
    
    const [stockList, setStockList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMedId, setSelectedMedId] = useState(null);
    const [batchList, setBatchList] = useState([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [dailySales, setDailySales] = useState([]);

    const fetchStock = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/medicine/all', {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setStockList(res.data);
        } catch (err) { console.error("Error fetching stock"); }
    }, []);

    const fetchDailySales = useCallback(async () => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const res = await axios.get(`http://localhost:5000/api/sales/history?date=${today}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setDailySales(res.data);
        } catch (err) { console.error("Error fetching daily sales"); }
    }, []);

    useEffect(() => { 
        fetchStock(); 
        fetchDailySales();
    }, [fetchStock, fetchDailySales]);

    const filteredStock = stockList.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.medicineId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // NEW: Function to auto-fill the form for Restocking
    const handleQuickRestock = (item) => {
        setFormData({
            ...formData,
            medicineId: item.medicineId,
            name: item.name,
            company: item.company || '',
            type: item.type || 'Tablet',
            buyingPrice: item.buyingPrice || '',
            sellingPrice: item.sellingPrice || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert(`Form ready to restock: ${item.name}. Just enter the new Batch and Quantity.`);
    };

    const handleViewBatches = async (medId) => {
        setLoadingBatches(true);
        setSelectedMedId(medId);
        try {
            const res = await axios.get(`http://localhost:5000/api/medicine/batches/${medId}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setBatchList(res.data);
        } catch (err) { 
            console.error("Error fetching batches", err);
        } finally {
            setLoadingBatches(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/medicine/add', formData, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            alert(`✅ Stock Restocked for ${formData.name}!`);
            setFormData({
                medicineId: '', name: '', company: '', quantity: '', 
                buyingPrice: '', sellingPrice: '', batchNumber: '', 
                expiryDate: '', receiptNo: '', category: 'General', type: 'Tablet'
            });
            fetchStock();
        } catch (err) {
            alert(err.response?.data?.msg || "❌ Error updating stock.");
        }
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.container}>
                
                {/* Header Area */}
                <div style={styles.header}>
                    <h1 style={styles.mainTitle}>Inventory Management</h1>
                    <p style={styles.subtitle}>Manage stock levels and batch tracking for Polycare.</p>
                </div>

                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    {/* Left: Intake Form (RESTOCK FORM) */}
                    <div style={styles.formCard}>
                        <h2 style={styles.cardTitle}>📦 Stock Entry / Restock</h2>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <label style={styles.label}>Medicine Details</label>
                            <input type="text" placeholder="Medicine ID" value={formData.medicineId} style={styles.input} onChange={e => setFormData({...formData, medicineId: e.target.value})} required />
                            <input type="text" placeholder="Medicine Name" value={formData.name} style={styles.input} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            
                            <div style={{display: 'flex', gap: '10px'}}>
                                <select value={formData.type} style={{...styles.input, flex: 1}} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Capsule">Capsule</option>
                                    <option value="Syrup">Syrup</option>
                                    <option value="Injection">Injection</option>
                                </select>
                                <input type="text" placeholder="Company" value={formData.company} style={{...styles.input, flex: 1}} onChange={e => setFormData({...formData, company: e.target.value})} required />
                            </div>

                            <label style={styles.label}>Batch Info</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder="Batch No" value={formData.batchNumber} style={styles.input} onChange={e => setFormData({...formData, batchNumber: e.target.value})} required />
                                <input type="text" placeholder="Receipt" value={formData.receiptNo} style={styles.input} onChange={e => setFormData({...formData, receiptNo: e.target.value})} required />
                            </div>
                            <input type="date" value={formData.expiryDate} style={styles.input} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />

                            <label style={styles.label}>Quantity & Pricing</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                <input type="number" placeholder="Qty" value={formData.quantity} style={styles.input} onChange={e => setFormData({...formData, quantity: e.target.value})} required />
                                <input type="number" placeholder="Buy" value={formData.buyingPrice} style={styles.input} onChange={e => setFormData({...formData, buyingPrice: e.target.value})} required />
                                <input type="number" placeholder="Sell" value={formData.sellingPrice} style={styles.input} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} required />
                            </div>
                            
                            <button type="submit" style={styles.mainButton}>Confirm Stock Update</button>
                        </form>
                    </div>

                    {/* Right: Master Inventory Overview */}
                    <div style={{ flex: 1, minWidth: '600px' }}>
                        <div style={styles.tableHeader}>
                            <h3 style={styles.tableTitle}>Master Stock List</h3>
                            <input 
                                type="text" 
                                placeholder="🔍 Search medicine..." 
                                style={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Medicine</th>
                                        <th style={styles.th}>Total Stock</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStock.map(item => (
                                        <tr key={item._id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <b style={{color: '#1e3a8a'}}>{item.name}</b> <br/>
                                                <small style={{color: '#64748b'}}>{item.medicineId} | {item.type}</small>
                                            </td>
                                            <td style={styles.td}><b>{item.totalStock}</b> <small>units</small></td>
                                            <td style={styles.td}>
                                                {item.totalStock < 20 ? 
                                                    <span style={styles.lowStockBadge}>Low Stock</span> : 
                                                    <span style={styles.healthyStockBadge}>Healthy</span>}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{display: 'flex', gap: '8px'}}>
                                                    <button onClick={() => handleViewBatches(item.medicineId)} style={styles.batchBtn}>Batches</button>
                                                    {/* THIS IS THE RESTOCK BUTTON THAT NOW WORKS */}
                                                    <button onClick={() => handleQuickRestock(item)} style={styles.restockBtn}>+ Restock</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Batch Modal Content */}
                {selectedMedId && (
                    <div style={styles.batchContainer}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                            <h3 style={{color: '#1e3a8a', margin: 0}}>Batch Details: {selectedMedId}</h3>
                            <button onClick={() => setSelectedMedId(null)} style={styles.closeBtn}>Close ✖</button>
                        </div>
                        <table style={styles.table}>
                            <thead style={{background: '#f8fafc'}}>
                                <tr>
                                    <th style={styles.th}>Batch No</th>
                                    <th style={styles.th}>Qty</th>
                                    <th style={styles.th}>Expiry</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batchList.map(batch => (
                                    <tr key={batch._id} style={styles.tr}>
                                        <td style={styles.td}><code>{batch.batchNumber}</code></td>
                                        <td style={styles.td}>{batch.quantity}</td>
                                        <td style={styles.td}>{new Date(batch.expiryDate).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            {new Date(batch.expiryDate) < new Date() ? 
                                                <span style={{color: '#ef4444', fontWeight: 'bold'}}>Expired</span> : 
                                                <span style={{color: '#10b981', fontWeight: 'bold'}}>Safe</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    container: { padding: '40px', maxWidth: '1400px', margin: 'auto' },
    header: { marginBottom: '30px' },
    mainTitle: { fontSize: '1.8rem', color: '#1e3a8a', fontWeight: '800', margin: 0 },
    subtitle: { color: '#64748b', fontSize: '1rem' },
    formCard: { background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', width: '100%', maxWidth: '420px', border: '1px solid #e2e8f0' },
    cardTitle: { color: '#1e3a8a', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '700' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { fontSize: '0.75rem', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase', marginTop: '10px' },
    input: { padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#fcfdfe' },
    mainButton: { padding: '14px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', marginTop: '15px', fontSize: '1rem' },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    tableTitle: { color: '#1e3a8a', fontWeight: '800', fontSize: '1.2rem', margin: 0 },
    searchInput: { padding: '10px 15px', borderRadius: '12px', border: '1px solid #cbd5e1', width: '280px', outline: 'none' },
    tableWrapper: { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '15px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #f1f5f9', fontWeight: '700' },
    td: { padding: '15px', fontSize: '0.9rem', borderBottom: '1px solid #f8fafc' },
    tr: { transition: '0.2s' },
    lowStockBadge: { background: '#fff1f2', color: '#e11d48', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
    healthyStockBadge: { background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
    batchBtn: { background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' },
    restockBtn: { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' },
    batchContainer: { marginTop: '30px', background: 'white', padding: '25px', borderRadius: '20px', border: '2px solid #e0f2fe' },
    closeBtn: { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }
};

export default Inventory;