import axios from 'axios';

const api = axios.create({
  
  baseURL: 'https://inventory-system-okjm.onrender.com', 
});

export default api;