import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, doc, getDoc, query, orderBy, onSnapshot, updateDoc,
  runTransaction, serverTimestamp, where
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function StudentPage() {
  const [collegeId, setCollegeId] = useState('MDL22CS'); // hardcoded ID
  const [item, setItem] = useState('Meal');
  const [snack, setSnack] = useState('pazhampori');
  const [quantity, setQuantity] = useState(1);
  const [timeSlot, setTimeSlot] = useState('10:30 AM Break');
  const [message, setMessage] = useState('');
  const [stock, setStock] = useState(null);
  const [counts, setCounts] = useState({});
  const [myOrders, setMyOrders] = useState([]); // ✅ student’s own orders

  const navigate = useNavigate();

  const selectedItemKey = item === "Snacks" ? snack : item.toLowerCase();

  useEffect(() => {
    // Fetch stock once
    const fetchStock = async () => {
      const docRef = doc(db, "stock", "current");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStock(docSnap.data());
      }
    };
    fetchStock();

    // Live orders count (all)
    const q = query(collection(db, "orders"), orderBy("time", "desc"));
    const unsubscribeAll = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const itemCounts = {};
      data.forEach(order => {
        const key = order.item?.toLowerCase();
        itemCounts[key] = (itemCounts[key] || 0) + Number(order.quantity || 1);
      });
      setCounts(itemCounts);
    });

    // Live orders for this student
    const studentQuery = query(
      collection(db, "orders"),
      where("collegeId", "==", collegeId),
      orderBy("time", "desc")
    );
    const unsubscribeMine = onSnapshot(studentQuery, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyOrders(data);
    });

    return () => {
      unsubscribeAll();
      unsubscribeMine();
    };
  }, [collegeId]); // re-run if collegeId changes

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!stock) {
      setMessage("⚠️ Stock data not loaded yet.");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const stockRef = doc(db, "stock", "current");
        const stockDoc = await transaction.get(stockRef);
        if (!stockDoc.exists()) throw "Stock document missing!";

        const stockData = stockDoc.data();
        const totalStock = stockData[selectedItemKey] || 0;
        const ordered = counts[selectedItemKey] || 0;
        const remaining = Math.max(totalStock - ordered, 0);

        if (remaining <= 0) throw `❌ ${selectedItemKey} is finished!`;
        if (Number(quantity) > remaining) throw `❌ Only ${remaining} left!`;

        const newOrderRef = doc(collection(db, "orders"));
        transaction.set(newOrderRef, {
          collegeId,
          item: item === "Snacks" ? snack : item,
          quantity: Number(quantity),
          timeSlot,
          time: serverTimestamp(),
          status: "Order Placed",  // ✅ new field
          gotIt: false            // ✅ new field
        });
      });

      setMessage("✅ Order placed!");
      setQuantity(1);
    } catch (error) {
      console.error('Order error:', error);
      setMessage(typeof error === 'string' ? error : "❌ Failed to place order");
    }
  };

  const markGotIt = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { gotIt: true });
    } catch (err) {
      console.error("Failed to mark got it", err);
    }
  };

  const handleAdminLogin = () => {
    navigate('/admin-login');
  };

  const orderedSoFar = counts[selectedItemKey] || 0;
  const displayRemaining = stock ? Math.max(stock[selectedItemKey] - orderedSoFar, 0) : null;

  return (
    <div style={{ backgroundColor: '#e6ffe6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#006400', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="https://img.icons8.com/emoji/48/000000/bento-box-emoji.png" alt="logo" style={{ height: '40px' }} />
        <button onClick={handleAdminLogin} className="btn btn-light">Admin Login</button>
      </header>

      {/* Order Form */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'start', padding: '20px', flexWrap: 'wrap', gap: '20px' }}>
        <form onSubmit={placeOrder} style={{ width: '100%', maxWidth: '400px' }}>
          <input
            value={collegeId}
            onChange={e => setCollegeId(e.target.value)}
            placeholder="College ID"
            required
            className="form-control mb-2"
          />
          <select value={item} onChange={e => setItem(e.target.value)} className="form-control mb-2">
            <option>Meal</option>
            <option>Chai</option>
            <option>Snacks</option>
          </select>
          {item === "Snacks" && (
            <select value={snack} onChange={e => setSnack(e.target.value)} className="form-control mb-2">
              <option value="pazhampori">Pazhampori</option>
              <option value="samosa">Samosa</option>
              <option value="cutlet">Cutlet</option>
            </select>
          )}
          <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="form-control mb-2">
            <option>10:30 AM Break</option>
            <option>1:00 PM Lunch</option>
          </select>
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" required className="form-control mb-2" />
          <button type="submit" className="btn btn-success w-100" disabled={displayRemaining !== null && displayRemaining <= 0}>Place Order</button>
          <p className="mt-2 text-center">{message}</p>
          {stock ? (
            <div className="mt-3 text-center" style={{ fontSize: '0.85rem', color: '#333' }}>
              🍛 Meals: {Math.max(stock.meals - (counts['meal'] || 0), 0)} |
              ☕ Chai: {Math.max(stock.chai - (counts['chai'] || 0), 0)} |
              🥟 Pazhampori: {Math.max(stock.pazhampori - (counts['pazhampori'] || 0), 0)} |
              Samosa: {Math.max(stock.samosa - (counts['samosa'] || 0), 0)} |
              Cutlet: {Math.max(stock.cutlet - (counts['cutlet'] || 0), 0)}
            </div>
          ) : (
            <div className="mt-3 text-center" style={{ fontSize: '0.85rem', color: '#333' }}>Loading stock...</div>
          )}
        </form>

        {/* ✅ My Orders List */}
        <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
          <h5>📋 My Orders</h5>
          {myOrders.length === 0 ? <p>No orders yet.</p> : (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Got it?</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.item}</td>
                    <td>{order.quantity}</td>
                    <td>{order.status}</td>
                    <td>
                      {order.gotIt ? '✅' : (
                        <button onClick={() => markGotIt(order.id)} className="btn btn-sm btn-outline-success">Mark</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <footer style={{ backgroundColor: '#006400', color: 'white', textAlign: 'center', padding: '8px' }}>
        Cooked with love ❤️
      </footer>
    </div>
  );
}
