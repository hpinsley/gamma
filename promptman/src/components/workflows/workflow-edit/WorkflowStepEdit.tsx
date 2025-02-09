import React, {useState} from 'react';
import { Workflow, WorkflowStep, WorkflowStage } from '../../../models/WorkflowModels';


interface WorkflowStepEditProps {
  indexNo: number;
  step: WorkflowStep;
  onStepChange: (workflowStep:WorkflowStep) => void;
}

const WorkflowStepEdit: React.FC<WorkflowStepEditProps> = ({ indexNo, step, onStepChange }) => {

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [description, setDescription] = useState<string>(step.description);

  const normalDisplay = () => {
    return (
      <div className="workflow-edit-step">
        <h1>Step {indexNo + 1}</h1>
        <h2><button className='edit-step-btn' onClick={() => setIsEditing(true)}>Edit Step</button></h2>
        <h2>Description: {step.description}</h2>
        <h3>Stage: {step.stage}</h3>
        <div>
          <p>{step.prompt}</p>
        </div>
      </div>
    );
  }

  const onSaveStepEdits = () => {
    const updatedWorkflow = { ...step, description: description }
    onStepChange(updatedWorkflow);
    setIsEditing(false);
  }

  const onCancelStepEdits = () => {
    setIsEditing(false);
  }
  
  const displayEditDispositionButtons = () => (
    <div>
      <button id="save-workflow-step-edits" onClick={onSaveStepEdits}>Save Step Changes</button>
      <button id="cancel-workflow-step-edits" onClick={onCancelStepEdits}>Cancel Step Changes</button>
    </div>
  )

  const editDisplay = () => {
    return (
      <div className="workflow-edit-step">
        <h1>Step {indexNo + 1}</h1>
        <h2>Description:
          <input type='text' value={description} onChange={(ev => setDescription(ev.target.value))} />
        </h2>
        <h3>Stage: {step.stage}</h3>
        <div>
          <p>{step.prompt}</p>
        </div>
        {displayEditDispositionButtons()}
      </div>
    );
  }

  if (isEditing) {
    return editDisplay();
  }
  else {
    return normalDisplay();
  }
};

export default WorkflowStepEdit;