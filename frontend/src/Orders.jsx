import { useState, useEffect } from 'react';
import api from './api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Changed default quantity to an empty string so the placeholder text appears
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    quantity: '' 
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const payload = {
        customer_id: parseInt(formData.customer_id),
        items: [
          {
            product_id: parseInt(formData.product_id),
            quantity: parseInt(formData.quantity)
          }
        ]
      };
      
      await api.post('/orders', payload);
      
      // Reset to empty string after submission
      setFormData({ customer_id: '', product_id: '', quantity: '' });
      fetchOrders();
      fetchProducts(); 
    } catch (error) {
      alert("Error placing order: " + (error.response?.data?.detail || "Something went wrong"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to cancel this order? Stock will be restored.")) {
      try {
        await api.delete(`/orders/${id}`);
        fetchOrders();
        fetchProducts(); 
      } catch (error) {
        alert("Error deleting order.");
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Order Management</h2>

      {/* CREATE ORDER FORM */}
      <div style={{ background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: '15px' }}>Place New Order</h3>
        {/* Form layout reverted to match Products/Customers perfectly */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          
          <select 
            name="customer_id" required
            value={formData.customer_id} onChange={handleInputChange}
            style={{ padding: '8px', flex: '1', minWidth: '150px' }}
          >
            <option value="" disabled>Select Customer...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.full_name} (ID: {c.id})</option>
            ))}
          </select>

          <select 
            name="product_id" required
            value={formData.product_id} onChange={handleInputChange}
            style={{ padding: '8px', flex: '1', minWidth: '150px' }}
          >
            <option value="" disabled>Select Product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)} (Stock: {p.stock_quantity})</option>
            ))}
          </select>

          {/* Standard Input matching the rest of the app */}
          <input 
            type="number" name="quantity" placeholder="Quantity" min="1" required
            value={formData.quantity} onChange={handleInputChange} 
            style={{ padding: '8px', flex: '1', minWidth: '100px' }} 
          />

          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Create Order
          </button>
        </form>
      </div>
      
      {/* ORDERS TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Order ID</th>
            <th style={{ padding: '12px' }}>Customer ID</th>
            <th style={{ padding: '12px' }}>Total Amount</th>
            <th style={{ padding: '12px' }}>Date Placed</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{order.id}</td>
              <td style={{ padding: '12px' }}>{order.customer_id}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#27ae60' }}>
                ${order.total_amount.toFixed(2)}
              </td>
              <td style={{ padding: '12px' }}>
                {new Date(order.created_at + 'Z').toLocaleString()}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button 
                  onClick={() => handleDelete(order.id)}
                  style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No orders found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Orders;