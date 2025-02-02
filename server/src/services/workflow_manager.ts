import { Workflow, WorkflowStep, WorkflowStage } from "../models/workflow/workflow_models";
import * as fs from 'fs';
import { get } from "http";
import * as path from 'path';

const workflowsFilePath = path.join(__dirname, '../data/workflows.json');
let workflowsData: any;
let defaultWorkflowId: string = 'none';
let workflows: Workflow[] = [];

try {
    const rawData = JSON.parse(fs.readFileSync(workflowsFilePath, 'utf-8'));
    defaultWorkflowId = rawData.default;
    console.log(workflowsData);

    workflows = rawData.workflows.map(
        (workflow: any): Workflow => ({
            id: workflow.id,
            steps: workflow.steps.map((step: any): WorkflowStep => ({
                description: step.description,
                stage: step.stage,
                prompt: step.promptLines.join('\n') // Assuming you want to use the actual prompt from the data
            }))
        })
    );
    console.log(workflows);                            
}
catch (error) {
    console.error(error);
}


export function getDefaultWorkflowId(): string {
    return defaultWorkflowId;
}

export function getDefaultWorkflow(): Workflow | undefined {
    const workflowId = getDefaultWorkflowId();
    const workflow = find_workflow_by_id(workflowId);
    return workflow;
}

export function find_workflow_by_id(id: string): Workflow | undefined {
    return workflows.find(workflow => workflow.id === id);
}
