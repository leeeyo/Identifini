import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CardPage from './components/CardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:username" element={<CardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
