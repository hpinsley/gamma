import express, { Router, Request, Response } from 'express';
import { getDefaultWorkflow, getWorkflows, getDefaultWorkflowId } from '../services/workflow_manager';
import { Workflow, WorkflowStage } from '../models/workflow/workflow_models';

const workflowRouter = Router();


workflowRouter.get('/', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const workflows = getWorkflows();
    res.json(workflows);
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