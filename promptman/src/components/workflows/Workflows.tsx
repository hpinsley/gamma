import React, { useEffect } from 'react';
import { saveConfigAsyncAsync, addWorkflowAsync, getDefaultWorkflowIdAsync, getAllWorkflowsAsync, setDefaultWorkflowIdAsync } from '../../services/workflow_service';
import { Workflow } from '../../models/WorkflowModels';
import WorkflowDisplay from './workflow-display/WorkflowDisplay';
import { useNavigate } from 'react-router-dom';

interface WorkflowsProps {
  selectedWorkflowId?: string;
}

const Workflows: React.FC<WorkflowsProps> = ({selectedWorkflowId}) => {
  const [defaultWorkflowId, setDefaultWorkflowId] = React.useState('');
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow | undefined>(undefined);

  const navigate = useNavigate();

  useEffect(() => {
      getDefaultWorkflowIdAsync()
        .then((defaultWorkflowId) => {
          setDefaultWorkflowId(defaultWorkflowId)
          const workflowIdToSelect = selectedWorkflowId ? selectedWorkflowId : defaultWorkflowId;

          getAllWorkflowsAsync()
                .then((workflows) => {
                    setWorkflows(workflows)
                    const selectedWorkflow = workflows.find((workflow) => workflow.id === workflowIdToSelect);
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

  const saveConfig = () => {
    saveConfigAsyncAsync()
      .then(saveMessage => alert(saveMessage.message));
  }

  const duplicateWorkflow = async (sourceWorkflow: Workflow) : Promise<void> => {
    const sourceWorkflowId =sourceWorkflow.id;
    const newId = prompt(`Copy workflow ${sourceWorkflowId} to what new id?`);
    if (!newId) {
      return;
    }

    const newWorkflow = {...sourceWorkflow, id: newId}
    const createdWorkflow = await addWorkflowAsync(newWorkflow);
    console.log(`Created workflow ${createdWorkflow.id}`);

    // Refetch the workflows
    const workflows = await getAllWorkflowsAsync();
    setWorkflows(workflows)
    setSelectedWorkflow(workflows.find(w => w.id === newId));
  }

  return (
    <div id="workflows-container">
      <h1>Workflows
        &nbsp;
        <button id='save-workflow-config-btn' onClick={saveConfig}>Save Config</button>
      </h1>
      <p>Default Workflow ID: <b>{defaultWorkflowId}</b></p>
      <hr/>
      <p id="workflow-caveats">Select a workflow to view its definition.  <b>If you change any workflow
        definitions, it will save in server memory.  However, if the server restarts, it will revert to
          JSON file.  There is a Save Config button if you want to overwrite that (which will need a server
          recompile)</b>
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