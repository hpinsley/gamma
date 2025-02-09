export enum WorkflowStage {
    INITIAL = "INITIAL",
    QUESTIONS_AND_ANSWERS = "QUESTIONS_AND_ANSWERS",
    FINAL_PROMPT_GENERATED = "FINAL_PROMPT_GENERATED"
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

export interface Variable {
    display: string;
    description: string;
    revolve: () => string;
}