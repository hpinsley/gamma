import React, {useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Workflow, WorkflowStep } from '../../../models/WorkflowModels';
import WorflowStepEdit from './WorkflowStepEdit'
import {getWorkflowByIdAsync, updateWorkflowAsync} from '../../../services/workflow_service';

interface WorkflowEditProps {
  workflowId: string;
}

const WorkflowEdit: React.FC<WorkflowEditProps> = ({ workflowId }) => {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow|undefined>(undefined);
  const [stepsBeingEdited, setStepsBeingEdited] = useState<WorkflowStep[]>([]);

  useEffect(() => {
      getWorkflowByIdAsync(workflowId)
        .then(workflow => {
          setWorkflow(workflow);
        })
    }, [workflowId]);

  const routeToWorkflows = () : void => {
    const route = `/workflows/${workflowId}`;
    console.log(`Navigating to ${route}`)
    navigate(route);
  }

  const onSave = async () : Promise<void> => {
    if (workflow === undefined) {
      console.error("onSave invoked in WorkflowEdit without a workflow");
      return;
    }

    const updatedWorkflow = await updateWorkflowAsync(workflow);
    console.log(`Updated workflow ${updatedWorkflow.id}`);
    routeToWorkflows();
  }

  const onCancel = () => {
    routeToWorkflows();
  }

  const noteWorkflowStepIsEditingState = (step: WorkflowStep, isEditing: boolean) => {
    console.log (`Step ${step.description} editing state is now ${isEditing}`);
    const newList = stepsBeingEdited.filter(s => s !== step);
    if (isEditing) {
      newList.push(step);
    }
    setStepsBeingEdited(newList);
  }

  const updateWorkflowStep = (index: number, updatedWorkflowStep: WorkflowStep) => {
    if (!workflow) {
      console.error("No workflow is defined in updateWorkflowStep")
      return;
    }

    console.log("updating");
    const updatedWorkflow:Workflow = {...workflow, 
        steps: workflow.steps.map((step, stepIndex) => (stepIndex === index) ? updatedWorkflowStep : step)
    }
    
    setWorkflow(updatedWorkflow)
  }

  const displayStepsBeingEdited = () => {
    const elements = stepsBeingEdited.map(s => (<li><span>Editing step: </span><b>{s.description}</b></li>))
    return (<ul>{elements}</ul>)
  }

  const displayStep = (index:number, step:WorkflowStep) => {
    return (
      <tr key={index}>
        <td>
          <WorflowStepEdit key={index} indexNo={index} step={step} 
              onStepChange={(updatedStep:WorkflowStep) => updateWorkflowStep(index, updatedStep)} 
              onIsEditingChange={noteWorkflowStepIsEditingState}
              />
        </td>
      </tr>
    )
  }

  const displayButtons = () => {
    // If we are in the process of editing steps, we hide the save and cancel button until they save or cancel each step

    if (stepsBeingEdited.length > 0) {
      return;
    }
    return (
    <div>
      <button id="save-workflow-edits" onClick={onSave}>Save Workflow</button>
      <button id="cancel-workflow-edits" onClick={onCancel}>Cancel</button>
    </div>
    );
  };

  // Main render is here

  if (!workflowId) {
    return null;
  }

  if (!workflow) {
    return null;
  }
  
  return (
    
    <div className="workflow-edit-container">
      <h1>
        Editing {workflowId}
      </h1>
      { displayButtons() }
      { displayStepsBeingEdited() }
      <div className="workflow-edit-steps-container">
        <table>
          <tbody>
            {  workflow.steps.map((step, index) => displayStep(index, step)) }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkflowEdit;