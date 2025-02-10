import express, { Router, Request, Response } from 'express';
import { upsertWorkflow, find_workflow_by_id, getDefaultWorkflow, getWorkflows, getDefaultWorkflowId, setDefaultWorkflowId } from '../services/workflow_manager';
import { Workflow, WorkflowStage } from '../models/workflow/workflow_models';

const workflowRouter = Router();


workflowRouter.get('/', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const workflows = getWorkflows();
    res.json(workflows);
  });

  workflowRouter.get('/default-workflow', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const defaultWorkflow = getDefaultWorkflow();
    res.json(defaultWorkflow);
  });
  
  workflowRouter.get('/default-workflow/id', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const defaultWorkflowId = getDefaultWorkflowId();
    res.type("text/plain");
    res.send(defaultWorkflowId);
  });

workflowRouter.get('/:workflowId', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const workflowId = req.params.workflowId
    const workflow = find_workflow_by_id(workflowId);
    if (!workflow) {
      res.status(404).json({ message: `Workflow with ID ${workflowId} not found` });
      return;
    }
    
    res.json(workflow)
});

workflowRouter.put('/:workflowId', async (req: express.Request<{workflowId:string}, Workflow, Workflow>, res:any) => {
  const workflowId = req.params.workflowId
  if (!workflowId) {
    res.status(400).json({ message: ':workflowId is required'})
    return;
  }

  const workflow = find_workflow_by_id(workflowId);
  if (!workflow) {
    res.status(404).json({ message: `Workflow with ID ${workflowId} not found` });
    return;
  }
  
  res.json(workflow)
});

export default workflowRouter;