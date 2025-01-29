import { Router, Request, Response } from 'express';

const promptManRouter = Router();

promptManRouter.get('/', (req: Request, res: Response) => {
    res.send('Hello from PromptMan!');
  });
  
// promptManRouter.get('/', (req: Request, res: Response) => {
//   res.send('List of users');
// });

// promptManRouter.post('/', (req: Request, res: Response) => {
//   // Logic to add a new user
//   res.send('User added');
// });

// promptManRouter.get('/:id', (req: Request, res: Response) => {
//   const { id } = req.params;
//   // Logic to fetch a user by id
//   res.send(`User with id ${id}`);
// });

export default promptManRouter;