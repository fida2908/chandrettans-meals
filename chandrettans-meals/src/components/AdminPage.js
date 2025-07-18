import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("time", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);

      // Count number of orders per item
      const itemCounts = {};
      data.forEach(order => {
        const key = order.item.toLowerCase();
        itemCounts[key] = (itemCounts[key] || 0) + Number(order.quantity || 1);
      });
      setCounts(itemCounts);
    });

    // Fetch current stock
    const fetchStock = async () => {
      const docRef = doc(db, "stock", "current");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStock(docSnap.data());
      }
    };
    fetchStock();

    return unsubscribe;
  }, []);

  return (
    <div style={{ backgroundColor: '#e6ffe6', minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ backgroundColor: '#006400', color: 'white', padding: '10px 20px', textAlign: 'center' }}>
        🍛 Chandrettan's Meals - Admin Panel
      </header>

      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
        
        {/* Today's Orders */}
        <div style={{ flex: '1 1 500px', backgroundColor: 'white', border: '2px solid #FFD700', borderRadius: '8px', padding: '15px', maxWidth: '600px' }}>
          <h5 className="mb-3">📋 Today's Orders</h5>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>College ID</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.collegeId}</td>
                  <td>{order.item}</td>
                  <td>{order.quantity}</td>
                  <td>{order.time?.toDate?.().toLocaleTimeString?.() || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stock / Remaining Count */}
        <div style={{ flex: '1 1 300px', backgroundColor: 'white', border: '2px solid #FFD700', borderRadius: '8px', padding: '15px', maxWidth: '300px' }}>
          <h5 className="mb-3">📦 Stock & Status</h5>
          {stock ? (
            <ul className="list-group">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                🍛 Meals 
                <span>{counts['meal'] >= stock.meals ? 'Finished' : stock.meals - (counts['meal'] || 0)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                ☕ Chai 
                <span>{counts['chai'] >= stock.chai ? 'Finished' : stock.chai - (counts['chai'] || 0)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                🥟 Pazhampori 
                <span>{counts['pazhampori'] >= stock.pazhampori ? 'Finished' : stock.pazhampori - (counts['pazhampori'] || 0)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                🥟 Samosa 
                <span>{counts['samosa'] >= stock.samosa ? 'Finished' : stock.samosa - (counts['samosa'] || 0)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                🥟 Cutlet 
                <span>{counts['cutlet'] >= stock.cutlet ? 'Finished' : stock.cutlet - (counts['cutlet'] || 0)}</span>
              </li>
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
