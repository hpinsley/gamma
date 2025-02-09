import React from 'react';
import { Workflow, WorkflowStep, WorkflowStage } from '../../../models/WorkflowModels';


interface WorkflowStepEditProps {
  indexNo: number;
  step: WorkflowStep;
}

const WorkflowStepEdit: React.FC<WorkflowStepEditProps> = ({ indexNo, step }) => {

  const cleanStepPrompt = (prompt:string) => {
    const cleanedPrompt = prompt; // prompt.replace(/\n/g, '<br/>');
    console.log("Cleaned prompt", cleanedPrompt);
    return cleanedPrompt;
  }

  return (
    <div className="workflow-edit-step">
      <h1>Step {indexNo + 1}</h1>
      <h2>Description: {step.description}</h2>
      <h3>Stage: {step.stage}</h3>
      <div>
        <p>{step.prompt}</p>
      </div>
    </div>
  );

};

export default WorkflowStepEdit;