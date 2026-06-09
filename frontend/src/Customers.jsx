import { useState, useEffect } from 'react';
import api from './api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    // Strip letters from the phone field
    if (name === 'phone') {
      value = value.replace(/[^0-9+\-\s()]/g, '');
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    //Check for duplicate phone numbers before sending to the backend
    const isDuplicatePhone = customers.some(
      (customer) => customer.phone === formData.phone
    );

    if (isDuplicatePhone) {
      alert("Error: A customer with this phone number already exists!");
      return; // Instantly stop the form submission
    }

    try {
      await api.post('/customers', formData);
      setFormData({ full_name: '', email: '', phone: '' });
      fetchCustomers();
    } catch (error) {
      alert("Error adding customer: " + (error.response?.data?.detail || "Something went wrong"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        alert("Error deleting customer: " + (error.response?.data?.detail || "Make sure this customer doesn't have active orders."));
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Customer Management</h2>

      {/* ADD CUSTOMER FORM */}
      <div style={{ background: 'white', padding: '20px', marginBottom: '20px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: '15px' }}>Add New Customer</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" name="full_name" placeholder="Full Name" required
            value={formData.full_name} onChange={handleInputChange} 
            style={{ padding: '8px', flex: '1', minWidth: '150px' }} 
          />
          <input 
            type="email" name="email" placeholder="Email Address" required
            value={formData.email} onChange={handleInputChange} 
            style={{ padding: '8px', flex: '1', minWidth: '150px' }} 
          />
          <input 
            type="tel" name="phone" placeholder="Phone Number" required
            value={formData.phone} onChange={handleInputChange} 
            style={{ padding: '8px', flex: '1', minWidth: '150px' }} 
          />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add Customer
          </button>
        </form>
      </div>
      
      {/* CUSTOMER TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Full Name</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Phone</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}>{customer.id}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{customer.full_name}</td>
              <td style={{ padding: '12px' }}>{customer.email}</td>
              <td style={{ padding: '12px' }}>{customer.phone}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No customers found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Customers;