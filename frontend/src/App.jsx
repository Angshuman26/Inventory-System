import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard'; 
import Products from './Products';
import Orders from './Orders';
import Customers from './Customers';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navigation Bar */}
        <nav className="navbar">
          <h2>Inventory System</h2>
          <ul className="nav-links">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/customers">Customers</Link></li>
            <li><Link to="/orders">Orders</Link></li>
          </ul>
        </nav>

        {/* Page Content */}
        <main className="main-content">
          <Routes>
            {/* <-- 2. Render Dashboard on the root path --> */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} /> 
            <Route path="/customers" element={<Customers />} /> 
            <Route path="/orders" element={<Orders />} /> 
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;