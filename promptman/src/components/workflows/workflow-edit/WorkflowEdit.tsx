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

  const moveStep = (step:WorkflowStep, curIndex:number, direction: number) => {
    console.log(`Moving step ${step.description} at index ${curIndex} amount: ${direction}`);

    if (!workflow) {
      console.error("No workflow is defined in updateWorkflowStep")
      return;
    }

    let newIndex = curIndex + direction;
    if (newIndex < 0 || newIndex >= workflow.steps.length) {
      console.log("Cannot move in that direction");
      return;
    }

    console.log("updating");
    
    // First remove the step from where it is and then insert it at the step
    const updatedWorkflow:Workflow = {...workflow, 
        steps: workflow.steps.filter((step, stepIndex) => (stepIndex !== curIndex))
    }

    updatedWorkflow.steps.splice(newIndex, 0, step);
    setWorkflow(updatedWorkflow)
  }

  const displayStepsBeingEdited = () => {
    if (stepsBeingEdited.length === 0) {
      return null;
    }
    
    const stepDescriptions = stepsBeingEdited.map(s => s.description).join(",");
    return (<span>&nbsp; &nbsp; Steps: {stepDescriptions}</span>)
  }

  const displayStep = (index:number, step:WorkflowStep) => {
    return (
      <tr key={index}>
        <td>
          <WorflowStepEdit key={index} indexNo={index} step={step} 
              onStepChange={(updatedStep:WorkflowStep) => updateWorkflowStep(index, updatedStep)} 
              onIsEditingChange={noteWorkflowStepIsEditingState}
              onMoveStepUp={(step, index) => moveStep(step, index, -1)}
              onMoveStepDown={(step, index) => moveStep(step, index, 1)}
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
      <h2>
        Editing {workflowId}
        { displayStepsBeingEdited() }
      </h2>
      { displayButtons() }
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