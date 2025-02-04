import React from 'react';
import { Workflow, WorkflowStep, WorkflowStage } from './models/WorkflowModels';


interface WorkflowStepDisplayProps {
  indexNo: number;
  step: WorkflowStep;
}

const WorkflowStepDisplay: React.FC<WorkflowStepDisplayProps> = ({ indexNo, step }) => {

  const cleanStepPrompt = (prompt:string) => {
    const cleanedPrompt = prompt; // prompt.replace(/\n/g, '<br/>');
    console.log("Cleaned prompt", cleanedPrompt);
    return cleanedPrompt;
  }

  return (
    <div className="workflow-step">
      <h2>Description: {step.description}</h2>
      <h2>Stage: {step.stage}</h2>
      <div>
        <textarea>{cleanStepPrompt(step.prompt)}</textarea>
      </div>
    </div>
  );

};

export default WorkflowStepDisplay;