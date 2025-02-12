import React, { useState, useEffect, useRef } from 'react';
import { WorkflowStep, Variable, WorkflowStage } from '../../../models/WorkflowModels';
import { getVariableList } from '../../../services/workflow_service'
import TemplateVariable from './TemplateVariable';
import { getStages } from '../../../services/workflow_service';

interface WorkflowStepEditProps {
  indexNo: number;
  step: WorkflowStep;
  onStepChange: (workflowStep: WorkflowStep) => void;
  onIsEditingChange: (workflowStep: WorkflowStep, isEditing: boolean) => void;
}

const WorkflowStepEdit: React.FC<WorkflowStepEditProps> = ({ indexNo, step, onStepChange, onIsEditingChange }) => {

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [description, setDescription] = useState<string>(step.description);
  const [selectedStage, setSelectedStage] = useState<WorkflowStage>(step.stage);
  const [prompt, setPrompt] = useState<string>(step.prompt)
  const [variables, _] = useState<Variable[]>(getVariableList())
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectableStages = getStages();

  const normalDisplay = () => {

    return (
      <div className="workflow-edit-step">
        <h1>Step {indexNo + 1}</h1>
        <h2><button className='edit-step-btn' onClick={startEditing}>Edit Step</button></h2>
        <h2>Description: {step.description}</h2>
        <h3>Stage: {step.stage}</h3>
        <textarea value={prompt} readOnly={true} />
      </div>
    );
  }

  const startEditing = () => {
    setIsEditing(true);
    onIsEditingChange(step, true)

  }

  const stopEditing = () => {
    setIsEditing(false);
    onIsEditingChange(step, false);
  }

  const onSaveStepEdits = () => {
    const updatedWorkflow = { ...step, description: description, prompt: prompt, stage: selectedStage }
    onStepChange(updatedWorkflow);
    stopEditing();
  }

  const onCancelStepEdits = () => {
    stopEditing();
    setDescription(step.description);
    setSelectedStage(step.stage);
    setPrompt(step.prompt);  
  }

  const displayEditDispositionButtons = () => (
    <div>
      <button id="save-workflow-step-edits" onClick={onSaveStepEdits}>Save Step Changes</button>
      <button id="cancel-workflow-step-edits" onClick={onCancelStepEdits}>Cancel Step Changes</button>
    </div>
  )

  const insertTextAtCursor = (insertText: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = prompt.slice(0, start) + insertText + prompt.slice(end);
      setPrompt(newText);

      // Move the cursor to the end of the inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
      }, 0);
    }
  };

  const displayVariables = () => {
    return (
      <div className='variable-list'>
        {variables.map((v, i) => <TemplateVariable key={i} variable={v} onInsertVariable={v => insertTextAtCursor(v.revolve())} />)}
      </div>
    );
  }

  const editStage = () => {
    return (
      <div>
        <label>Stage:
          <select onChange={(e) => setSelectedStage(e.currentTarget.value as WorkflowStage)} value={selectedStage}>
            {selectableStages.map((stage, index) => <option key={index}>{stage}</option>)}
          </select>
        </label>
      </div>

    )
  }

  const editDisplay = () => {
    return (
      <div className="workflow-edit-step editing">
        <div className='step-index'>Step {indexNo + 1}</div>
        <div className='description'>
          <label>Description
          <input className='step-description' type='text' value={description} onChange={(ev => setDescription(ev.target.value))} />
          </label>
        </div>
        {editStage()}
        <div className='prompt-entry'>
          <label>Prompt Template
          <textarea ref={textareaRef} value={prompt} onChange={ev => setPrompt(ev.target.value)} />
          </label>
          </div>
        {displayVariables()}
        {displayEditDispositionButtons()}
      </div>
    );
  }

  if (isEditing) {
    return editDisplay();
  }
  else {
    return normalDisplay();
  }
};

export default WorkflowStepEdit;