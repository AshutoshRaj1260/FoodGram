import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import axios from 'axios'

// Configure axios to always send credentials with requests
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
    <App />
)
