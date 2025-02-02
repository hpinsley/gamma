import express, { Router, Request, Response } from 'express';
import Utils from '../common/utils';
import OpenAI from 'openai';
import { ProcessUserAnswersRequestBody, Options, CategoryQuestionsAndAnswers} from '../models/PromptModels';
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
  
    const prompt = generateInitialPrompt(objective, workflow, WorkflowStage.INITIAL);


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

      res.json(responseText);  
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
      console.log(`First category is ${req.body.qa[0].category}`);

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
       const nextPrompt = generateNextPrompt(userObjective, qaWithEmptyCategoriesRemoved, options)
       
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

 const generateInitialPrompt = (objective:string, workflow: Workflow, stage:WorkflowStage): string => {
  const relevantStep = workflow.steps.find(step => step.stage === stage);
  if (!relevantStep) {
    throw new Error(`No step found for stage ${stage}`);
  }

  const templateString = relevantStep.prompt;
  const prompt = templateString.replace('${userObjective}', objective);
  return prompt;
}

const generateNextPrompt = (userObjective: string, qaWithEmptyCategoriesRemoved: CategoryQuestionsAndAnswers[], options: Options|undefined): string => {
  // Implement the logic for generating the next prompt based on the filtered QA and options
      const qaJson = JSON.stringify(qaWithEmptyCategoriesRemoved, null, 2);
      const prompt = `I originally asked you ${userObjective}
You asked me some follow-up questions that you felt you needed to provide me with a detailed plan. The entire goal of this is to create the "perfect chatgpt prompt" for the user to copy and paste into chatgpt so they get the best and most helpful response based on their initial objective. 
Here are questions you asked me and the answers I provided in json format:
${qaJson}
With all this information, I'd like you to construct the perfect PROMPT for the user to copy and paste into gpt. Be sure to include somewhere in the prompt, "go back and forth with me until we have generated a response that helps me achieve my goal"
`;

      return prompt;
}

export default promptManRouter;