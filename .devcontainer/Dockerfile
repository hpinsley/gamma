FROM mcr.microsoft.com/devcontainers/typescript-node
# See notes about linting in https://hub.docker.com/r/microsoft/devcontainers-typescript-node

# These lines are only needed when building on laptop, not home computer
ADD https://artifactory.blackstone.com/artifactory/misc/platform/certs/ZscalerRootCertificate-2048-SHA256.crt /usr/local/share/ca-certificates/ZscalerRootCertificate-2048-SHA256.crt
RUN update-ca-certificates
# These two lines are needed else we get SSL errors
ENV SSL_CERT_FILE /etc/ssl/certs/ca-certificates.crt
ENV REQUESTS_CA_BUNDLE /etc/ssl/certs/ca-certificates.crt
# These two lines are needed otherwise the extensions don't get installed
RUN chmod 644 /usr/local/share/ca-certificates/ZscalerRootCertificate-2048-SHA256.crt
ENV NODE_EXTRA_CA_CERTS /usr/local/share/ca-certificates/ZscalerRootCertificate-2048-SHA256.crt
