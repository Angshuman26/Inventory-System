import axios from 'axios';

const api = axios.create({
  // This points exactly to your running FastAPI server
  baseURL: 'https://inventory-system-okjm.onrender.com', 
});

export default api;