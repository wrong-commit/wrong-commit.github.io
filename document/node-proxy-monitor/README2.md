# Installation Instructions
1. Generate certificates using OpenSSL
    docker build -t squid-certs -f scripts\generate_certificates\Dockerfile . 
2. Run the squid proxy using the provided certificates
3. Run the node js application using the correct environment variables