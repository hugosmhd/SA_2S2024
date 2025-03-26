import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Cart from './components/Cart';
import PurchaseReport from './components/PurchaseReport';
import { Pagos } from './components/Pagos';

import { ModalProviderBooks } from './components/context/ModalContext';
import Home from './components/Home';
import Register from './components/Registrer';
import Profile from './components/Profile';
import DashboardCliente from './components/DashboardCliente';
import CuponesList from './components/CuponesList';
import Compras from './components/Compras';
import Devoluciones from './components/Devoluciones';
import DashboardAdmin from './components/DashboardAdmin';
import AdminPanel from './components/AdminPane';
import AdminApi from './components/AdminApi';

const apiUrl = import.meta.env.VITE_API_URL;

function App() {
  console.log(apiUrl, "");
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/" element={
          <ModalProviderBooks>
          <Dashboard />
          </ModalProviderBooks>
          } 
        /> */}
        {/* <Route path="/cart" element={<Cart />} />
        <Route path="/report" element={<PurchaseReport />} />
         */}
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/listado-devoluciones" element={<Devoluciones />} />
        <Route path="/cupones" element={<CuponesList />} />
        <Route path="/dash-proveedor" element={
          <ModalProviderBooks>
            <Dashboard /> 
          </ModalProviderBooks>

        }/>

<Route path="/admin" element={<AdminPanel />} />
<Route path="/api" element={<AdminApi />} />

<Route path="/dash-cliente" element={
          <ModalProviderBooks>
            <DashboardCliente /> 
          </ModalProviderBooks>

        }/>
        <Route path="/cart" element={<Cart />} />
        <Route path="/devoluciones" element={<Compras />} />

         <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      
      
      </Routes>
    </Router>
  );
}

export default App;

