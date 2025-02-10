import React, {useState} from 'react';
import { Variable } from '../../../models/WorkflowModels';

interface TemplateVariableProps {
  variable: Variable,
  onInsertVariable: (v:Variable) => void;
}

const TemplateVariable: React.FC<TemplateVariableProps> = ({ variable, onInsertVariable }) => {
  return (
      <button className='insert-variable-btn' onClick={() => onInsertVariable(variable)}>{'Insert ' + variable.description}</button>
  )

};

export default TemplateVariable;