@echo off
docker run -it -p 8080:8080 --name promptman --rm -e PROMPTMAN_OPENAI_API_KEY=%OPENAPI_API_KEY_1% promptman
REM docker run -it -p 8080:8080 --name promptman --rm -e PROMPTMAN_OPENAI_API_KEY=%OPENAPI_API_KEY_1% --entrypoint bash promptman
