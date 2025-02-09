import React from 'react';
import { WorkflowStep } from '../../../models/WorkflowModels';


interface WorkflowStepDisplayProps {
  indexNo: number;
  step: WorkflowStep;
}

const WorkflowStepDisplay: React.FC<WorkflowStepDisplayProps> = ({ indexNo, step }) => {

  return (
    <div className="workflow-step">
      <h1>Step {indexNo + 1}</h1>
      <h2>Description: {step.description}</h2>
      <h3>Stage: {step.stage}</h3>
      <div>
        <textarea readOnly={true} value={step.prompt} />
      </div>
    </div>
  );

};

export default WorkflowStepDisplay;