import express, { Router, Request, Response } from 'express';
import Utils from '../common/utils';
import { ExecuteStepRequest, InitialPromptRequest, ExecuteStepResponse, ProcessUserAnswersRequestBody, Options, CategoryQuestionsAndAnswers, CategoryQuestions } from '../models/PromptModels';
import { getDefaultWorkflow } from '../services/workflow_manager';
import { Workflow, WorkflowStage, WorkflowStep } from '../models/workflow/workflow_models';

const promptManRouter = Router();

promptManRouter.post('/process-step', async (req: express.Request<{}, ExecuteStepResponse, ExecuteStepRequest>,
  res: any) => {

  const request = req.body;

  const userObjective = request.userObjective;
  const qa = request.qa ? request.qa : []

  const workflow = getDefaultWorkflow();
  if (!workflow) {
    return res.status(500).json({ error: 'Default workflow not found' });
  }

  console.log(`Workflow is ${workflow.id} with ${workflow.steps.length} steps`);
  console.log(`The user's objective is "${userObjective}"`);

  const currentStep = request.stepToExecute;
  if (currentStep < 0 || currentStep > workflow.steps.length - 1) {
    return res.status(400).json({ error: `Invalid step index.  Acceptable values are 0..${workflow.steps.length - 1} for workflow ${workflow.id}` });
  }

  const workflowStep = workflow.steps[currentStep];
  console.log(`Current step ${currentStep} is stage ${workflowStep.stage} - ${workflowStep.description}`);

  const nextStep = currentStep + 1;
  var nextWorkflowStep:WorkflowStep | undefined = undefined;

  if (nextStep > workflow.steps.length - 1) {
    nextWorkflowStep = undefined;
    console.log(`No more steps after ${currentStep}`);
  }
  else {
    nextWorkflowStep = workflow.steps[nextStep];
    console.log(`Next step ${nextWorkflowStep} is stage ${nextWorkflowStep.stage} - ${nextWorkflowStep.description}`);
  }

  const prompt = generateStagePrompt(userObjective, qa, workflow, workflowStep);
  const client = Utils.getOpenAIClient();

  try {
    const aiResponse = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o',
    });

    let responseText = aiResponse.choices[0].message.content || "";

    console.log('Initial prompt response before cleaning:', responseText);

    // Clean up the response text to remove any extraneous formatting
    responseText = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\n/g, '');

    if (nextWorkflowStep) {
        const categoryQuestions: CategoryQuestions[] = JSON.parse(responseText);
        const response: ExecuteStepResponse = {
          userObjective: userObjective,
          stage: nextWorkflowStep.stage,
          categoryQuesions: categoryQuestions,
          nextStepIndex: nextStep
        };
    
        res.json(response);
    }
    else {
      const finalPrompt = responseText
      const response: ExecuteStepResponse = {
        userObjective: userObjective,
        stage: WorkflowStage.FINAL_PROMPT_GENERATED,
        categoryQuesions: [],
        finalPrompt: finalPrompt,
        nextStepIndex: currentStep + 1
      };
  
      res.json(response);
    }
  }
  catch (error) {
    console.error(error);
    res.json(error);
  }
});

const generateStagePrompt = (objective: string, qa: CategoryQuestionsAndAnswers[], workflow: Workflow, step: WorkflowStep): string => {

  const templateString = step.prompt;
  console.log(`Template string is ${templateString}`);

  let prompt = templateString.replace('${userObjective}', objective);
  if (qa.length > 0) {
    const qaJson = JSON.stringify(qa, null, 2);
    prompt = prompt.replace('${qaJson}', qaJson);
  }

  return prompt;
}

export default promptManRouter;