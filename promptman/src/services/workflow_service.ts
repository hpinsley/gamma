import { PROMPTMAN_SERVICE_URL } from '../config';
import { Workflow, Variable } from '../models/WorkflowModels';


const variables:Variable[] = [
      { display: "userObjective", description: "The user's objective", revolve: () => "${userObjective}" }
    , { display: "qaJson", description: "The users answers", revolve: () => "${qaJson}" }
    , { display: "initialTemplate", description: "The JSON format template to give the AI", 
        revolve: () => `[
  {
    "category": "Category Name",
    "questions": [
      "Question 1",
      "Question 2",
      "Question 3"
    ]
  }
]
` }
];

export function getVariableList() : Variable[]
{
  return variables;
}

export const getDefaultWorkflowIdAsync = async (): Promise<string> => {
    const url = `${PROMPTMAN_SERVICE_URL}/workflows/default-workflow/id`;
    console.log(`url: ${url}`);

    const response = await fetch(url);
    const defaultWorkflowId = await response.text();
    return defaultWorkflowId;
};

export const getWorkflowByIdAsync = async (workflowId: string): Promise<Workflow|undefined> => {
  const url = `${PROMPTMAN_SERVICE_URL}/workflows/${workflowId}`;
  console.log(`url: ${url}`);

  const response = await fetch(url);
  const workflow:Workflow = await response.json();
  return workflow
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
