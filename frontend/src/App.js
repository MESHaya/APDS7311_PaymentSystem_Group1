//import logo from './logo.svg';
import './App.css';
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Register from './components/register';
import Login from './components/login';
import Payment from "./components/payment";

function App() {
  return(
    <Router>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path="/dashboard" element={<Payment />} />
      </Routes>
    </Router>
  );
}

export default App;