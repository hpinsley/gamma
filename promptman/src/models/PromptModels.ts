import { WorkflowStage } from "./WorkflowModels";

export interface CategoryQuestions {
    category: string;
    questions: string[];
}

export interface QuestionAndAnswer {
    question: string;
    answer: string;
}

export interface CategoryQuestionsAndAnswers {
    category: string;
    questionsAndAnswers: QuestionAndAnswer[];
}

export interface Options {
    removeEmptyQuestions: true
}

export interface ProcessUserAnswersRequestBody {
    userObjective: string; // or the appropriate type
    qa: CategoryQuestionsAndAnswers[];
    options?: Options;
}

export interface InitialPromptRequest {
    objective: string;
}

export interface PromptResponse {
    userObjective: string;
    nextStage: WorkflowStage;
    nextStepIndex: number;
    categoryQuesions: CategoryQuestions[]     
}

export interface ExecuteStepRequest {
    userObjective: string; // or the appropriate type
    stepToExecute: number;
    priorQA?: CategoryQuestionsAndAnswers[];
    currentQA?: CategoryQuestionsAndAnswers[];
    options?: Options | undefined;
}

export interface ExecuteStepResponse {
    userObjective: string;
    stage: WorkflowStage;
    nextStepIndex: number;
    categoryQuesions?: CategoryQuestions[]
    finalPrompt?: string;     
}
