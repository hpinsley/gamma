import express, { Router, Request, Response } from 'express';
import { getDefaultWorkflow, getWorkflows, getDefaultWorkflowId, setDefaultWorkflowId } from '../services/workflow_manager';
import { Workflow, WorkflowStage } from '../models/workflow/workflow_models';

const workflowRouter = Router();


workflowRouter.get('/', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const workflows = getWorkflows();
    res.json(workflows);
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

workflowRouter.get('/default-workflow/id', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const defaultWorkflowId = getDefaultWorkflowId();
    res.type("text/plain");
    res.send(defaultWorkflowId);
  });

workflowRouter.get('/default-workflow', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const defaultWorkflow = getDefaultWorkflow();
    res.json(defaultWorkflow);
  });
  

export default workflowRouter;