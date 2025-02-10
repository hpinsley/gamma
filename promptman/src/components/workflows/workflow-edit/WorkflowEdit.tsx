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

  const displayStep = (index:number, step:WorkflowStep) => {
    return (
      <tr key={index}>
        <td>
          <WorflowStepEdit key={index} indexNo={index} step={step} onStepChange={(updatedStep:WorkflowStep) => updateWorkflowStep(index, updatedStep)} />
        </td>
      </tr>
    )
  }

  const displayButtons = () => (
    <div>
      <button id="save-workflow-edits" onClick={onSave}>Save Workflow</button>
      <button id="cancel-workflow-edits" onClick={onCancel}>Cancel</button>
    </div>
  )

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
      <table>
        <tbody>
          {  workflow.steps.map((step, index) => displayStep(index, step)) }
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowEdit;