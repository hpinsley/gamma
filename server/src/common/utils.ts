import Constants from "./constants";

const Utils = {
    get_openapi_api_key(): string {
        const envVarName = Constants.OpenAIApiKeyName;
        const apiKey = process.env[envVarName];
        if (apiKey) {
            return apiKey
        }

        throw new Error("No API key found");
    }
};

export default Utils;