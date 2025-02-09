import React from 'react';

interface WorkflowEditProps {
  workflowId: string;
}

const WorkflowEdit: React.FC<WorkflowEditProps> = ({ workflowId }) => {

  if (!workflowId) {
    return null;
  }

  return (
    <div className="workflow-edit-container">
      <h1>
        Editing {workflowId}
      </h1>
    </div>
  );
};

export default WorkflowEdit;