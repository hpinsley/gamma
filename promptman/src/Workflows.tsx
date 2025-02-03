import React, { useEffect } from 'react';
import { getDefaultWorkflowIdAsync, getAllWorkflowIdsAsync } from './services/workflow_service';

interface WorkflowProps {
}

const Workflows: React.FC<WorkflowProps> = () => {
  const [defaultWorkflowId, setDefaultWorkflowId] = React.useState('');
  const [workflowIds, setWorkflowIds] = React.useState<string[]>([]);

  useEffect(() => {
      getDefaultWorkflowIdAsync()
        .then((defaultWorkflowId) => setDefaultWorkflowId(defaultWorkflowId));

      getAllWorkflowIdsAsync()
        .then((workflowIds) => setWorkflowIds(workflowIds));
      
  }, []);

  return (
    <div>
      <h1>Workflows</h1>
      <p>Default Workflow ID: {defaultWorkflowId}</p>
      <ul>
        { workflowIds.map((workflowId) => <li key={workflowId}>{workflowId}</li>) }
      </ul>
    </div>
  );

};

export default Workflows;