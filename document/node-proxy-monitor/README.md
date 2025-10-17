# node-proxy-monitor
 A NodeJS / Squid 4.0 based malicious, javascript injecting proxy with a Node backend for data retreival

# Installation  
- Install Squid 4.2 with OpenSSL support. This is not compiled into the binaries available in the Debian 
9 repos, so will have to be done manually. These are the flags needed when running `./configure`:    
>--enable-ssl --enable-ssl-crtd --with-openssl  
- Setup a .env file, by running `$ cp env_template .env` and populate the correct values  
- Setup SSL files `ssl/key.pem` and `ssl/server_certificate.crt`. If possible, install these on the client machine to avoid HTTPS errors  
- Setup a MongoDB instance, by running the command `mongod dbpath=mongo_db`  
- Enable the necessary ports through your firewall (by default: incoming [ TCP 443 for the node server, TCP 8080 for the squid proxy ], outbound [ TCP 443 for downloading javascript files, though this may be a different port for certain websites. Consider allowing outboundTCP on all ports ] )   
- Run `sudo /etc/init.d/squid start` and `npm start`
