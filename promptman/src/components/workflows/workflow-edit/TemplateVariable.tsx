import React, {useState} from 'react';
import { Variable } from '../../../models/WorkflowModels';

interface TemplateVariableProps {
  variable: Variable,
  disabled: boolean,
  onInsertVariable: (v:Variable) => void;
}

const TemplateVariable: React.FC<TemplateVariableProps> = ({ variable, disabled, onInsertVariable }) => {
  return (
    // Prevent from obtaining the focus so we can stay in the textarea
    <button tabIndex={-1} disabled={disabled} className='insert-variable-btn' onClick={() => onInsertVariable(variable)}>{'Insert ' + variable.description}</button>
  )

};

export default TemplateVariable;