import { PROMPTMAN_SERVICE_URL } from '../config';
import { Workflow } from '../models/WorkflowModels';

export const getDefaultWorkflowIdAsync = async (): Promise<string> => {
    const url = `${PROMPTMAN_SERVICE_URL}/workflows/default-workflow/id`;
    console.log(`url: ${url}`);

    const response = await fetch(url);
    const defaultWorkflowId = await response.text();
    return defaultWorkflowId;
};

export const getAllWorkflowIdsAsync = async (): Promise<string[]> => {
  const url = `${PROMPTMAN_SERVICE_URL}/workflows`;
  console.log(`url: ${url}`);

  const response = await fetch(url);
  const workflows:Workflow[] = await response.json();
  const workflowIds = workflows.map(w => w.id);
  return workflowIds;
};

export const getAllWorkflowsAsync = async (): Promise<Workflow[]> => {
  const url = `${PROMPTMAN_SERVICE_URL}/workflows`;
  console.log(`url: ${url}`);

  const response = await fetch(url);
  const workflows:Workflow[] = await response.json();
  return workflows;
};

export const setDefaultWorkflowIdAsync = async (workflowId: string): Promise<void> => {
    const url = `${PROMPTMAN_SERVICE_URL}/workflows/default-workflow/id/${workflowId}`;
    const response = await fetch(url, { method: 'POST' });
    console.log("setDefaultWorkflow response", response.status);
}
