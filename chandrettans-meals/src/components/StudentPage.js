import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function StudentPage() {
  const [collegeId, setCollegeId] = useState('');
  const [item, setItem] = useState('Meal');
  const [snack, setSnack] = useState('pazhampori');
  const [quantity, setQuantity] = useState(1);
  const [timeSlot, setTimeSlot] = useState('10:30 AM Break');
  const [message, setMessage] = useState('');
  const [stock, setStock] = useState(null);
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();

  const selectedItemKey = item === "Snacks" ? snack : item.toLowerCase();

  useEffect(() => {
    const fetchStock = async () => {
      const docRef = doc(db, "stock", "current");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStock(docSnap.data());
      }
    };
    fetchStock();

    const q = query(collection(db, "orders"), orderBy("time", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const itemCounts = {};
      data.forEach(order => {
        const key = order.item.toLowerCase();
        itemCounts[key] = (itemCounts[key] || 0) + Number(order.quantity || 1);
      });
      setCounts(itemCounts);
    });

    return unsubscribe;
  }, []);

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!stock) {
      setMessage("⚠️ Stock data not loaded yet.");
      return;
    }

    // Compute remainingCount inside the function from latest state
    const orderedSoFar = counts[selectedItemKey] || 0;
    const currentStock = stock[selectedItemKey] || 0;
    const remainingCount = Math.max(currentStock - orderedSoFar, 0);

    if (remainingCount <= 0) {
      setMessage(`❌ ${selectedItemKey.charAt(0).toUpperCase() + selectedItemKey.slice(1)} is finished!`);
      return;
    }

    if (Number(quantity) > remainingCount) {
      setMessage(`❌ Only ${remainingCount} left for ${selectedItemKey}!`);
      return;
    }

    try {
      await addDoc(collection(db, "orders"), {
        collegeId,
        item: item === "Snacks" ? snack : item,
        quantity: Number(quantity),
        timeSlot,
        time: serverTimestamp()
      });
      setMessage("✅ Order placed!");
      setCollegeId('');
      setQuantity(1);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error placing order");
    }
  };

  const handleAdminLogin = () => {
    navigate('/admin-login');
  };

  // Compute display remaining count to show in UI
  const orderedSoFar = counts[selectedItemKey] || 0;
  const displayRemaining = stock ? Math.max(stock[selectedItemKey] - orderedSoFar, 0) : null;

  return (
    <div style={{ backgroundColor: '#e6ffe6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#006400', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="https://img.icons8.com/emoji/48/000000/bento-box-emoji.png" alt="logo" style={{ height: '40px' }} />
        <button onClick={handleAdminLogin} className="btn btn-light">Admin Login</button>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <form onSubmit={placeOrder} style={{ width: '100%', maxWidth: '400px' }}>
          <input
            value={collegeId}
            onChange={e => setCollegeId(e.target.value)}
            placeholder="College ID"
            required
            className="form-control mb-2"
          />
          <select
            value={item}
            onChange={e => setItem(e.target.value)}
            className="form-control mb-2"
          >
            <option>Meal</option>
            <option>Chai</option>
            <option>Snacks</option>
          </select>
          {item === "Snacks" && (
            <select
              value={snack}
              onChange={e => setSnack(e.target.value)}
              className="form-control mb-2"
            >
              <option value="pazhampori">Pazhampori</option>
              <option value="samosa">Samosa</option>
              <option value="cutlet">Cutlet</option>
            </select>
          )}
          <select
            value={timeSlot}
            onChange={e => setTimeSlot(e.target.value)}
            className="form-control mb-2"
          >
            <option>10:30 AM Break</option>
            <option>1:00 PM Lunch</option>
          </select>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            min="1"
            required
            className="form-control mb-2"
          />
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={displayRemaining !== null && displayRemaining <= 0}
          >
            Place Order
          </button>
          <p className="mt-2 text-center">{message}</p>

          {/* Stock info */}
          {stock ? (
            <div className="mt-3 text-center" style={{ fontSize: '0.85rem', color: '#333' }}>
              🍛 Meals: {Math.max(stock.meals - (counts['meal'] || 0), 0)} |
              ☕ Chai: {Math.max(stock.chai - (counts['chai'] || 0), 0)} |
              🥟 Pazhampori: {Math.max(stock.pazhampori - (counts['pazhampori'] || 0), 0)} |
              Samosa: {Math.max(stock.samosa - (counts['samosa'] || 0), 0)} |
              Cutlet: {Math.max(stock.cutlet - (counts['cutlet'] || 0), 0)}
            </div>
          ) : (
            <div className="mt-3 text-center" style={{ fontSize: '0.85rem', color: '#333' }}>
              Loading stock...
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#006400', color: 'white', textAlign: 'center', padding: '8px' }}>
        Cooked with love ❤️
      </footer>
    </div>
  );
}
