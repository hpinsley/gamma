import React, { useEffect } from 'react';
import { getDefaultWorkflowIdAsync, getAllWorkflowsAsync } from './services/workflow_service';
import { Workflow } from './models/WorkflowModels';
import WorkflowDisplay from './WorkflowDisplay';

interface WorkflowsProps {
}

const Workflows: React.FC<WorkflowsProps> = () => {
  const [defaultWorkflowId, setDefaultWorkflowId] = React.useState('');
  const [workflowIds, setWorkflowIds] = React.useState<string[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState<string>('');
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow | undefined>(undefined);

  useEffect(() => {
      getDefaultWorkflowIdAsync()
        .then((defaultWorkflowId) => {
          setDefaultWorkflowId(defaultWorkflowId)
          getAllWorkflowsAsync()
                .then((workflows) => {
                    const workflowIds = workflows.map(w => w.id);
                    setWorkflowIds(workflowIds);
                    setWorkflows(workflows)
                    setSelectedWorkflowId(defaultWorkflowId);
                    const selectedWorkflow = workflows.find((workflow) => workflow.id === defaultWorkflowId);
                    setSelectedWorkflow(selectedWorkflow);
                });
          });
  }, []);

  const selectWorkflow = (workflowId:string) : void => {
    setSelectedWorkflowId(workflowId);
    const workflow = workflows.find((workflow) => workflow.id === workflowId);
    setSelectedWorkflow(workflow);
  }

  return (
    <div id="workflows-container">
      <h1>Workflows</h1>
      <p>Default Workflow ID: <b>{defaultWorkflowId}</b></p>
      <hr/>
      <p id="workflow-caveats">Select a workflow to view its definition.  Note that you cannot onChange
        a workflow definition here.  If we want additional workflows, they have to be added
        to data/workflow.json for now until we provision some sort of external persistence
        layer.
      </p>
      <select id="workflow-select" onChange={(e) => selectWorkflow(e.currentTarget.value)} defaultValue={defaultWorkflowId}>
      { workflowIds.map((workflowId) => <option key={workflowId}>{workflowId}</option>) }
      </select>
      <hr/>
      <WorkflowDisplay workflow={selectedWorkflow} />
    </div>
  );

};

export default Workflows;