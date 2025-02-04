import React, { useEffect } from 'react';
import { getDefaultWorkflowIdAsync, getAllWorkflowsAsync } from './services/workflow_service';
import { Workflow } from './models/WorkflowModels';


interface WorkflowProps {
}

const Workflows: React.FC<WorkflowProps> = () => {
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
    const selectedWorkflow = workflows.find((workflow) => workflow.id === workflowId);
    setSelectedWorkflow(selectedWorkflow);
  }

  return (
    <div>
      <h1>Workflows</h1>
      <p>Default Workflow ID: {defaultWorkflowId}</p>
      <select onChange={(e) => selectWorkflow(e.currentTarget.value)} defaultValue={defaultWorkflowId}>
      { workflowIds.map((workflowId) => <option key={workflowId}>{workflowId}</option>) }
      </select>
      <hr/>
      <span>{selectedWorkflow && selectedWorkflow.id}</span>
    </div>
  );

};

export default Workflows;