import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Routes instead of Switch
import CardPage from './components/CardPage.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:username" element={<CardPage />} /> {/* Use element instead of component */}
      </Routes>
    </Router>
  );
}

export default App;
