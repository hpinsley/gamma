import express, { Router, Request, Response } from 'express';
import { exportToWorkflowJsonFormat, deleteWorkflow, upsertWorkflow, find_workflow_by_id, getDefaultWorkflow, getWorkflows, getDefaultWorkflowId, setDefaultWorkflowId } from '../services/workflow_manager';
import { Workflow, WorkflowStage } from '../models/workflow/workflow_models';

const workflowRouter = Router();


workflowRouter.get('/', async (req: any, res: any) => {
  // Access the 'objective' from the request body
  const workflows = getWorkflows();
  res.json(workflows);
});

workflowRouter.post('/save-config', async (req: any, res: any) => {
  // Access the 'objective' from the request body
  const result = exportToWorkflowJsonFormat();
  res.json(result);
});

workflowRouter.post('/', async (req: express.Request<{}, Workflow, Workflow>, res: any) => {

  const newWorkflow = req.body;
  const newWorkflowId = newWorkflow.id;
  if (!newWorkflowId) {
    res.status(400).json({ 'message': 'No workflow id specified.'});
    return;
  }

  const existingWorkflow = find_workflow_by_id(newWorkflowId);
  if (existingWorkflow) {
    res.status(400).json({ 'message': `Workflow ${newWorkflowId} already exists.`});
    return;
  }
  
  upsertWorkflow(newWorkflow);
  res.json(newWorkflow)
});

workflowRouter.get('/default-workflow', async (req: any, res: any) => {
  // Access the 'objective' from the request body
  const defaultWorkflow = getDefaultWorkflow();
  res.json(defaultWorkflow);
});

workflowRouter.post('/default-workflow/id/:newDefaultWorkflowId', async (req, res) => {
  // Extract the 'newDefaultWorkflowId' from the request parameters
  const newDefaultWorkflowId = req.params.newDefaultWorkflowId;
  const succeeded = setDefaultWorkflowId(newDefaultWorkflowId);

  if (!succeeded) {
    res.status(404).send(`Workflow with ID ${newDefaultWorkflowId} not found`);
    return;
  }

  res.status(200).send(`Default workflow ID set to ${newDefaultWorkflowId}`);
});

workflowRouter.get('/default-workflow/id', async (req: any, res: any) => {
  // Access the 'objective' from the request body
  const defaultWorkflowId = getDefaultWorkflowId();
  res.type("text/plain");
  res.send(defaultWorkflowId);
});

workflowRouter.get('/:workflowId', async (req: any, res: any) => {
  // Access the 'objective' from the request body
  const workflowId = req.params.workflowId
  const workflow = find_workflow_by_id(workflowId);
  if (!workflow) {
    res.status(404).json({ message: `Workflow with ID ${workflowId} not found` });
    return;
  }

  res.json(workflow)
});

workflowRouter.put('/:workflowId', async (req: express.Request<{ workflowId: string }, Workflow, Workflow>, res: any) => {
  const workflowId = req.params.workflowId
  if (!workflowId) {
    res.status(400).json({ message: ':workflowId is required' })
    return;
  }

  const updatedWorkflow = req.body;
  if (updatedWorkflow.id !== workflowId) {
    res.status(400).json({ 'message': 'Workflow id in route does not match body'});
    return;
  }

  const existingWorkflow = find_workflow_by_id(workflowId);
  if (!existingWorkflow) {
    res.status(404).json({ message: `Workflow with ID ${workflowId} not found` });
    return;
  }

  upsertWorkflow(updatedWorkflow);
  res.json(updatedWorkflow)
});

workflowRouter.delete('/:workflowId', async (req: express.Request<{ workflowId: string }, any, any>, res: any) => {
  const workflowId = req.params.workflowId
  if (!workflowId) {
    res.status(400).json({ message: ':workflowId is required' })
    return;
  }

  const existingWorkflow = find_workflow_by_id(workflowId);
  if (!existingWorkflow) {
    res.status(404).json({ message: `Workflow with ID ${workflowId} not found` });
    return;
  }

  if (workflowId === getDefaultWorkflowId()) {
      res.status(400).json({ message: 'You may not delete the default workflow' })
      return;
  }

  deleteWorkflow(existingWorkflow.id);
  res.status(200).json({ message: `Workflow with ID ${workflowId} removed.` });
});


export default workflowRouter;