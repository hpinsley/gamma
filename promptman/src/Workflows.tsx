import React, { useEffect } from 'react';
import { getDefaultWorkflowIdAsync } from './services/workflow_service';

interface WorkflowProps {
}

const Workflows: React.FC<WorkflowProps> = () => {
  const [defaultWorkflowId, setDefaultWorkflowId] = React.useState('');

  useEffect(() => {
      getDefaultWorkflowIdAsync()
        .then((defaultWorkflowId) => setDefaultWorkflowId(defaultWorkflowId));
  }, []);

  return (
    <div>
      <h1>Workflows</h1>
      <p>Default Workflow ID: {defaultWorkflowId}</p>
    </div>
  );

};

export default Workflows;