import { useState, useEffect } from 'react';
import api from './api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockProducts: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data simultaneously to load the dashboard as fast as possible
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers'),
          api.get('/orders')
        ]);

        const products = productsRes.data;
        // Business logic: Flag anything with fewer than 5 items in stock
        const lowStock = products.filter(p => p.stock_quantity < 5);

        setStats({
          totalProducts: products.length,
          totalCustomers: customersRes.data.length,
          totalOrders: ordersRes.data.length,
          lowStockProducts: lowStock
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Shared styling for the metric cards to keep the UI clean
  const cardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flex: '1',
    minWidth: '200px',
    textAlign: 'center'
  };

  if (isLoading) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Dashboard</h2>

      {/* TOP ROW: METRIC CARDS */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <div style={{ ...cardStyle, borderTop: '5px solid #3498db' }}>
          <h3 style={{ color: '#7f8c8d', fontSize: '1.1rem', marginBottom: '10px' }}>Total Products</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>{stats.totalProducts}</p>
        </div>
        
        <div style={{ ...cardStyle, borderTop: '5px solid #27ae60' }}>
          <h3 style={{ color: '#7f8c8d', fontSize: '1.1rem', marginBottom: '10px' }}>Total Customers</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>{stats.totalCustomers}</p>
        </div>

        <div style={{ ...cardStyle, borderTop: '5px solid #8e44ad' }}>
          <h3 style={{ color: '#7f8c8d', fontSize: '1.1rem', marginBottom: '10px' }}>Total Orders</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>{stats.totalOrders}</p>
        </div>
      </div>

      {/* BOTTOM SECTION: LOW STOCK ALERTS */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Stock Detail</h3>
        
        {stats.lowStockProducts.length === 0 ? (
          <p style={{ color: '#27ae60', fontWeight: 'bold' }}>All products are sufficiently stocked!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', color: '#2c3e50' }}>Product Name</th>
                <th style={{ padding: '12px', color: '#2c3e50' }}>SKU</th>
                <th style={{ padding: '12px', color: '#2c3e50' }}>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {stats.lowStockProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{product.name}</td>
                  <td style={{ padding: '12px' }}>{product.sku}</td>
                  <td style={{ padding: '12px', color: '#e74c3c', fontWeight: 'bold' }}>{product.stock_quantity} remaining</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;