import React from 'react';
import { Workflow, WorkflowStep } from './models/WorkflowModels';
import WorkflowStepDisplay from './WorkflowStepDisplay';

interface WorkflowDisplayProps {
  workflow?: Workflow;
  isDefault: boolean;
  setAsDefault: (workflowId: string) => void;
}

const WorkflowDisplay: React.FC<WorkflowDisplayProps> = ({ isDefault, workflow, setAsDefault }) => {

  if (!workflow) {
    return null;
  }

  const displayStep = (index:number, step:WorkflowStep) => {
    return (
      <tr key={index}>
        <td>
          <WorkflowStepDisplay key={index} indexNo={index} step={step} />
        </td>
      </tr>
    )
  }

  return (
    <div className="workflow-container">
      <h1>
        {workflow.id}
        {!isDefault && (<button className="set-as-default" onClick={() => setAsDefault(workflow.id)}>Set as Default</button>)}
      </h1>
      <table>
        <tbody>
          {   workflow.steps.map((step, index) => displayStep(index, step)) }
        </tbody>
      </table>
    </div>
  );

};

export default WorkflowDisplay;