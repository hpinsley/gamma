import Constants from "./constants";
import OpenAI from 'openai';

const Utils = {
    
    get_openapi_api_key(): string {
        const envVarName = Constants.OpenAIApiKeyName;
        const apiKey = process.env[envVarName];
        if (apiKey) {
            return apiKey
        }

        throw new Error("No API key found");
    },

    getOpenAIClient() : OpenAI {
        const client = new OpenAI({
          apiKey: Utils.get_openapi_api_key(), // This is the default and can be omitted
          dangerouslyAllowBrowser: true // We should move all interactions to a server
        });
        return client;
      }
};

export default Utils;