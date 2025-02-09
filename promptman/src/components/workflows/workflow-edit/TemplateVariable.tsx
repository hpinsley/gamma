import React, {useState} from 'react';
import { Variable } from '../../../models/WorkflowModels';

interface TemplateVariableProps {
  variable: Variable
}

const TemplateVariable: React.FC<TemplateVariableProps> = ({ variable }) => {
  return (
      <button className='insert-variable-btn'>{'Insert ' + variable.description}</button>
  )

};

export default TemplateVariable;