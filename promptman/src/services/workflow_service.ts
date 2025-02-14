import { PROMPTMAN_SERVICE_URL } from '../config';
import { Workflow, Variable, WorkflowStage } from '../models/WorkflowModels';


const variables:Variable[] = [
      { display: "userObjective", description: "The user's objective", revolve: () => "${userObjective}" }
    , { display: "qaJson", description: "The users answers", revolve: () => "${qaJson}" }
    , { display: "finalInstructions", description: "Suggested final instructions to build prompt", 
      revolve: () => `With all this information, I'd like you to construct the perfect PROMPT for the user to copy and paste into gpt.
Be sure to include somewhere in the prompt, "go back and forth with me until we have generated a response that helps me achieve my goal"
      ` }
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

export function getStages() : WorkflowStage[]
{
  return [
    WorkflowStage.INITIAL,
    WorkflowStage.QUESTIONS_AND_ANSWERS,
    WorkflowStage.FINAL_PROMPT_GENERATED
  ];
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

export const saveConfigAsyncAsync = async (): Promise<any> => {
  const url = `${PROMPTMAN_SERVICE_URL}/workflows/save-config`;
  const response = await fetch(url, { method: 'POST' });
  console.log("setDefaultWorkflow response", response.status);
  const model = await response.json();
  return model;
}

export const addWorkflowAsync = async (workflow: Workflow): Promise<Workflow> => {

    const bodyString = JSON.stringify(workflow);

    const url = `${PROMPTMAN_SERVICE_URL}/workflows`;
    console.log(`POST url: ${url}`);

    const request = new Request(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString,
    });

    const response = await fetch(request);
    const responseModel: Workflow = await response.json();
    return responseModel;
}

export const updateWorkflowAsync = async (updatedWorkflow: Workflow): Promise<Workflow> => {

  const bodyString = JSON.stringify(updatedWorkflow);

  const url = `${PROMPTMAN_SERVICE_URL}/workflows/${updatedWorkflow.id}`;
  console.log(`PUT url: ${url}`);

  const request = new Request(url, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
    },
    body: bodyString,
  });

  const response = await fetch(request);
  const responseModel: Workflow = await response.json();
  return responseModel;
}
