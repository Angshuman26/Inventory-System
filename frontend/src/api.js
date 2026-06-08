import axios from 'axios';

const api = axios.create({
  // This points exactly to your running FastAPI server
  baseURL: 'http://127.0.0.1:8000', 
});

export default api;