FROM ubuntu:22.04 as builder

RUN mkdir /ssl

RUN apt-get update && \
    apt-get install -y openssl

# RUN openssl req -x509 -newkey rsa:4096 -keyout /ssl/key.pem -out /ssl/cert.pem -sha256 -days 3650 -nodes -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=CommonNameOrHostname"


# RUN openssl genrsa -des3 -passout pass:x -out server.pass.key 2048
# # Generate /ssl/server.key
# RUN openssl rsa -passin pass:x -in server.pass.key -out /ssl/server.key
# RUN rm server.pass.key
# # Generate /ssl/server.csr
# RUN openssl req -new -key /ssl/server.key -out /ssl/server.csr \
#     -subj "/C=UK/ST=Warwickshire/L=Leamington/O=OrgName/OU=IT Department/CN=example.com"
# # Generate /ssl/server.crt
# RUN openssl x509 -req -days 365 -in /ssl/server.csr -signkey /ssl/server.key -out /ssl/server.crt
# # Generate /ssl/server.pem
# RUN openssl x509 -req -sha256 -days 365 -in /ssl/server.csr -signkey /ssl/server.key -out /ssl/server.pem



# Generate CA Key and CA Pem
# RUN openssl genrsa -aes256 -out /ssl/ca-key.pem 4096
# RUN openssl req -new -x509 -days 365 -key /ssl/ca-key.pem -sha256 -out /ssl/ca.pem
# Generate RSA private key
# RUN openssl genrsa -out server-key.pem 4096
# Generate signed certificate
# RUN openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem \
# -CAcreateserial -out server-cert.pem -extfile extfile.cnf



# As per squid documentation, generate self signed Root CA
# RUN openssl genrsa -des3 -passout pass:x -out server.pass.key 2048
# RUN openssl req -passin pass:x -in server.pass.key -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -extensions v3_ca -keyout /ssl/myCA.pem  -out /ssl/myCA.pem  -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=CommonNameOrHostname"
# Generate DER encoded certificate to import into users browser
# RUN openssl x509 -in /ssl/myCA.pem -outform DER -out /ssl/myCA.der





# As per Kapersky 
RUN openssl req -new -newkey rsa:2048 -days 31 -nodes -x509  -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=CommonNameOrHostname" -keyout /ssl/squidCA.pem -out /ssl/squidCA.pem
RUN openssl x509 -in /ssl/squidCA.pem -outform DER -out /ssl/squid.der
RUN chmod 400 /ssl/squidCA.pem
# RUN chmod 400 /ssl/squidCA.key
# RUN chmod 400 /ssl/squidCA.crt
RUN chmod 400 /ssl/squid.der