import React from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkflowEditProps {
  workflowId: string;
}

const WorkflowEdit: React.FC<WorkflowEditProps> = ({ workflowId }) => {
  const navigate = useNavigate();

  const routeToWorkflows = () : void => {
    const route = `/workflows`;
    console.log(`Navigating to ${route}`)
    navigate(route);
  }

  const onSave = () => {
    routeToWorkflows();
  }

  const onCancel = () => {
    routeToWorkflows();
  }

  const displayButtons = () => (
    <div>
      <button id="save-workflow-edits" onClick={onSave}>Save</button>
      <button id="cancel-workflow-edits" onClick={onCancel}>Cancel</button>
    </div>
  )

  if (!workflowId) {
    return null;
  }

  return (
    <div className="workflow-edit-container">
      <h1>
        Editing {workflowId}
      </h1>
      { displayButtons() }
    </div>
  );
};

export default WorkflowEdit;