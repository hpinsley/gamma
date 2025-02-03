import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// import logo from './logo.svg';
import './App.css';
import PromptMan from './PromptMan';
import Workflows from './Workflows';

function App() {
  
  function logDetailedPlan(question: string, detailedPlan: string) {
    console.log(`Detailed Plan for question ${question} is ${detailedPlan}`);
  }

  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Prompt Man</Link>
          </li>
          <li>
            <Link to="/workflows">Workflows</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<PromptMan onDetailPlanGenerated={logDetailedPlan} />} />
        <Route path="/workflows" element={<Workflows />} />
      </Routes>
    </Router>
  );
}

export default App;
