import express, { Router, Request, Response } from 'express';
import Utils from '../common/utils';
import OpenAI from 'openai';
import { ProcessUserAnswersRequestBody, Options, CategoryQuestionsAndAnswers, CategoryQuestions} from '../models/PromptModels';
import { getDefaultWorkflow } from '../services/workflow_manager';
import { Workflow, WorkflowStage } from '../models/workflow/workflow_models';

const promptManRouter = Router();


promptManRouter.post('/process-objective', async (req:any, res:any) => {
    // Access the 'objective' from the request body
    const { objective } = req.body;
  
    const workflow = getDefaultWorkflow();
    if (!workflow) {
      return res.status(500).json({ error: 'Default workflow not found' });
    }
    
    console.log(`Workflow is ${workflow.id} with ${workflow.steps.length} steps`);

    // You should validate the 'objective' variable here
    if (typeof objective !== 'string') {
      // If 'objective' is not a string or not provided, send a 400 Bad Request response
      return res.status(400).json({ error: 'Objective must be a string' });
    }
  
    // Respond with JSON
    // res.json({ message: 'Received objective', objective: objective });
  
    const prompt = generateStagePrompt(objective, [], workflow, WorkflowStage.INITIAL);
    const client = Utils.getOpenAIClient();
  
    try {
      const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o',
       });
  
      let responseText = response.choices[0].message.content || "";
      // Clean up the response text to remove any extraneous formatting
      responseText = responseText
                      .replace(/```json/g, '')
                      .replace(/```/g, '')
                      .replace(/\n/g, '');

      // res.set('Content-Type', 'application/json');
      const parsed:CategoryQuestions[] = JSON.parse(responseText)
      res.json(parsed);  
    }
    catch (error) {

      console.error(error);
      res.json(error);
    }
  });

  
 promptManRouter.post('/process-user-answers', async (req: express.Request<{}, {}, ProcessUserAnswersRequestBody>, res:any) => {
    // Access the 'objective' from the request body
    
    try {
      console.log(`Your initial objective was ${req.body.userObjective}`);

       const userObjective = req.body.userObjective;
       const qaListByCategory = req.body.qa;
       const options = req.body.options;

       const qaWithNonAnswersRemoved = qaListByCategory.map(categoryQuestionsAndAnswers => (
              {...categoryQuestionsAndAnswers,
                  questionsAndAnswers: 
                    categoryQuestionsAndAnswers.questionsAndAnswers.filter(qa => qa.answer)
                  }
                ));

       const qaWithEmptyCategoriesRemoved = qaWithNonAnswersRemoved.filter(categoryQuestionsAndAnswers => categoryQuestionsAndAnswers.questionsAndAnswers.length > 0);
       const workflow = getDefaultWorkflow();
       if (!workflow) {
         return res.status(500).json({ error: 'Default workflow not found' });
       }
       
       console.log(`Workflow is ${workflow.id} with ${workflow.steps.length} steps`);
       
       const nextPrompt = generateStagePrompt(userObjective, qaWithEmptyCategoriesRemoved, workflow, WorkflowStage.QUESTIONS_AND_ANSWERS);
       console.log(nextPrompt);

       const client = Utils.getOpenAIClient();
  
      const response = await client.chat.completions.create({
          messages: [{ role: 'user', content: nextPrompt }],
          model: 'gpt-4o',
        });
        console.log(response);
      let responseText = response.choices[0].message.content || "";
      res.send(responseText);
    }
    catch (error) {
      console.error(error);
      res.json(error);
    }
  });

 const generateStagePrompt = (objective:string, qa: CategoryQuestionsAndAnswers[], workflow: Workflow, stage:WorkflowStage): string => {
  const relevantStep = workflow.steps.find(step => step.stage === stage);
  if (!relevantStep) {
    throw new Error(`No step found for stage ${stage}`);
  }

  const templateString = relevantStep.prompt;
  let prompt = templateString.replace('${userObjective}', objective);
  if (qa.length > 0) {
    const qaJson = JSON.stringify(qa, null, 2);
    prompt = prompt.replace('${qaJson}', qaJson);
  }

  return prompt;
}

export default promptManRouter;