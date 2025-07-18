import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("time", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);

      const itemCounts = {};
      data.forEach(order => {
        const key = order.item?.toLowerCase();
        itemCounts[key] = (itemCounts[key] || 0) + Number(order.quantity || 1);
      });
      setCounts(itemCounts);
    });

    const fetchStock = async () => {
      const stockRef = doc(db, "stock", "current");
      const stockSnap = await getDoc(stockRef);
      if (stockSnap.exists()) {
        setStock(stockSnap.data());
      }
    };
    fetchStock();

    return unsubscribe;
  }, []);

  // Separate orders by timeSlot
  const breakOrders = orders.filter(order => order.timeSlot === "10:30 AM Break");
  const lunchOrders = orders.filter(order => order.timeSlot === "1:00 PM Lunch");

  // Handlers
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  // A helper to show status text with color
  const renderStatus = (status) => {
    if (status === "accepted") return <span style={{ color: "green" }}>✔ Accepted</span>;
    if (status === "cancelled") return <span style={{ color: "red" }}>✖ Cancelled</span>;
    return <span style={{ color: "gray" }}>⏳ Pending</span>;
  };

  return (
    <div style={{ backgroundColor: '#e6ffe6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#006400', color: 'white', padding: '10px 20px', textAlign: 'center' }}>
        🍛 Chandrettan's Meals - Admin Panel
      </header>

      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '20px', padding: '10px' }}>
        {/* 10:30 AM Break Orders */}
        <div style={{ flex: '1 1 500px', backgroundColor: 'white', border: '2px solid #FFD700', borderRadius: '8px', padding: '15px', maxWidth: '600px' }}>
          <h5 className="mb-3">☕ Orders - 10:30 AM Break</h5>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>College ID</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {breakOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.collegeId}</td>
                  <td>{order.item}</td>
                  <td>{order.quantity}</td>
                  <td>{order.time?.toDate?.().toLocaleTimeString?.() || 'N/A'}</td>
                  <td>{renderStatus(order.status)}</td>
                  <td>
                    <button onClick={() => handleStatusChange(order.id, "accepted")} className="btn btn-success btn-sm me-1">Accept</button>
                    <button onClick={() => handleStatusChange(order.id, "cancelled")} className="btn btn-danger btn-sm">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 1:00 PM Lunch Orders */}
        <div style={{ flex: '1 1 500px', backgroundColor: 'white', border: '2px solid #FFD700', borderRadius: '8px', padding: '15px', maxWidth: '600px' }}>
          <h5 className="mb-3">🍛 Orders - 1:00 PM Lunch</h5>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>College ID</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lunchOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.collegeId}</td>
                  <td>{order.item}</td>
                  <td>{order.quantity}</td>
                  <td>{order.time?.toDate?.().toLocaleTimeString?.() || 'N/A'}</td>
                  <td>{renderStatus(order.status)}</td>
                  <td>
                    <button onClick={() => handleStatusChange(order.id, "accepted")} className="btn btn-success btn-sm me-1">Accept</button>
                    <button onClick={() => handleStatusChange(order.id, "cancelled")} className="btn btn-danger btn-sm">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stock & Remaining */}
        <div style={{ flex: '1 1 300px', backgroundColor: 'white', border: '2px solid #FFD700', borderRadius: '8px', padding: '15px', maxWidth: '300px' }}>
          <h5 className="mb-3">📦 Stock & Status</h5>
          {stock ? (
            <ul className="list-group">
              {['meal', 'chai', 'pazhampori', 'samosa', 'cutlet'].map(key => (
                <li key={key} className="list-group-item d-flex justify-content-between align-items-center">
                  {key === 'meal' && '🍛 Meals'}
                  {key === 'chai' && '☕ Chai'}
                  {key === 'pazhampori' && '🥟 Pazhampori'}
                  {key === 'samosa' && '🥟 Samosa'}
                  {key === 'cutlet' && '🥟 Cutlet'}
                  <span>
                    {counts[key] >= stock[key] ? 'Finished' : stock[key] - (counts[key] || 0)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading stock...</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#006400', color: 'white', textAlign: 'center', padding: '8px', marginTop: 'auto' }}>
        Cooked with love ❤️
      </footer>
    </div>
  );
}
