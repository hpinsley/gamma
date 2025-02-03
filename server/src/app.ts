import express, { Request, Response } from 'express';
import cors from 'cors';
import promptManRouter from './routers/promptman'; // Adjust the path as necessary
import workflowRouter from './routers/workflow';
import path from 'path';

const app = express();
const port = 8080;

console.log("Server startup");
// Serve static files from the React app
const staticAssets = path.join(__dirname, '../public')
console.log("staticAssets: ", staticAssets);
app.use(express.static(staticAssets));

app.use(cors());
app.use(express.json()); // This line is crucial

app.use('/promptman', promptManRouter);
app.use('/workflows', workflowRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});