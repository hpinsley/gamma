import React, { useEffect } from 'react';
import { getDefaultWorkflowIdAsync, getAllWorkflowsAsync, setDefaultWorkflowIdAsync } from '../../services/workflow_service';
import { Workflow } from '../../models/WorkflowModels';
import WorkflowDisplay from './workflow-display/WorkflowDisplay';
import { useNavigate } from 'react-router-dom';

interface WorkflowsProps {
}

const Workflows: React.FC<WorkflowsProps> = () => {
  const [defaultWorkflowId, setDefaultWorkflowId] = React.useState('');
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow | undefined>(undefined);

  const navigate = useNavigate();

  useEffect(() => {
      getDefaultWorkflowIdAsync()
        .then((defaultWorkflowId) => {
          setDefaultWorkflowId(defaultWorkflowId)
          getAllWorkflowsAsync()
                .then((workflows) => {
                    setWorkflows(workflows)
                    const selectedWorkflow = workflows.find((workflow) => workflow.id === defaultWorkflowId);
                    setSelectedWorkflow(selectedWorkflow);
                });
          });
  }, []);

  const changeDefaultWorkflow = async (workflowId:string) : Promise<void> => {
    const selectedWorkflow = workflows.find((workflow) => workflow.id === workflowId);
    if (selectedWorkflow)
    {
      await setDefaultWorkflowIdAsync(workflowId);
      setDefaultWorkflowId(workflowId);
      setSelectedWorkflow(selectedWorkflow);
    }
  }

  const selectWorkflow = (workflowId:string) : void => {
    const workflow = workflows.find((workflow) => workflow.id === workflowId);
    setSelectedWorkflow(workflow);
  }

  const showDropdownList = () => {
    if (!selectedWorkflow) {
      return null;
    }

    return (
      <select id="workflow-select" onChange={(e) => selectWorkflow(e.currentTarget.value)} value={selectedWorkflow.id}>
      { workflows.map((workflow) => <option key={workflow.id}>{workflow.id}</option>) }
      </select>
    );
  }

  const routeToEditWorkflow = (workflow: Workflow) : void => {
    const route = `/workflows/${workflow.id}/edit`;
    console.log(`Navigating to ${route}`)
    navigate(route);
  }

  const duplicateWorkflow = (sourceWorkflow: Workflow) : void => {
    const sourceWorkflowId =sourceWorkflow.id;
    const newId = prompt(`Copy workflow ${sourceWorkflowId} to what new id?`);
    alert(newId);
  }

  return (
    <div id="workflows-container">
      <h1>Workflows</h1>
      <p>Default Workflow ID: <b>{defaultWorkflowId}</b></p>
      <hr/>
      <p id="workflow-caveats">Select a workflow to view its definition.  <b>Note that you cannot change
        or add a workflow definition here</b>.  If we want additional workflows, they have to be added
        to data/workflow.json for now until we provision some sort of external persistence
        layer.
      </p>
      { showDropdownList() }
      <hr/>
      <WorkflowDisplay 
        setAsDefault={changeDefaultWorkflow}
        onEdit={routeToEditWorkflow}
        onCopy={(workflow) => duplicateWorkflow(workflow)}
        isDefault={selectedWorkflow !== undefined && defaultWorkflowId === selectedWorkflow.id} 
        workflow={selectedWorkflow} />
    </div>
  );

};

export default Workflows;