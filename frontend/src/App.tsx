import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from './components/Landing';
import Room from './components/Room';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room" element={<Room />} />
        <Route path="/contact" element={<h1>Contact Us</h1>} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App  