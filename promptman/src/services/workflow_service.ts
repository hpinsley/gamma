import { PROMPTMAN_SERVICE_URL } from '../config';

export const getDefaultWorkflowIdAsync = async (): Promise<string> => {
    const url = `${PROMPTMAN_SERVICE_URL}/workflows/default-workflow/id`;
    console.log(`url: ${url}`);

    const response = await fetch(url);
    const defaultWorkflowId = await response.text();
    return defaultWorkflowId;
};
