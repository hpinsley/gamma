import React from 'react';
// import logo from './logo.svg';
import './App.css';
import PromptMan from './PromptMan';

function App() {
  
  function logDetailedPlan(question: string, detailedPlan: string) {
    console.log(`Detailed Plan for question ${question} is ${detailedPlan}`);
  }

  return (
      <PromptMan onDetailPlanGenerated={logDetailedPlan} />
  );
}

export default App;
