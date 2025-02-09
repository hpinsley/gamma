import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';

// import logo from './logo.svg';
import './App.css';
import PromptMan from './components/prompt-gen/PromptMan';
import Workflows from './components/workflows/Workflows';
import WorkflowEdit from './components/workflows/workflow-edit/WorkflowEdit';

function App() {
  
  function logDetailedPlan(question: string, detailedPlan: string) {
    console.log(`Detailed Plan for question ${question} is ${detailedPlan}`);
  }

  const WorkflowEditWrapper = () => {
    const { workflowId } = useParams<{ workflowId: string }>();
    return <WorkflowEdit workflowId={workflowId!} />;
  };

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
        <Route path="/workflows/edit/:workflowId" element={<WorkflowEditWrapper />} />

      </Routes>
    </Router>
  );
}

export default App;
