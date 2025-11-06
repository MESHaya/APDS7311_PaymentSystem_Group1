//import logo from './logo.svg';
import './App.css';
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Register from './components/register';
import Login from './components/login';
import Payment from "./components/payment";
import StaffLogin from "./components/staffLogin";
import StaffRegister from "./components/staffRegister";
import StaffDashboard from "./components/staffDashboard";

function App() {
  return(
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path='/' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path="/dashboard" element={<Payment />} />
        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/register" element={<StaffRegister />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;