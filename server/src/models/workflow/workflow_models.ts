export enum WorkflowStage {
    INITIAL = "INITIAL",
    QUESTIONS_AND_ANSWERS = "QUESTIONS_AND_ANSWERS",
}

export interface WorkflowStep {
    description: string;
    stage: WorkflowStage;
    prompt: string;
}


export interface Workflow {
    id: string;
    steps: WorkflowStep[];
}
