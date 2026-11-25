#!/bin/bash
chmod a+x /rewrite.py
# Make security cert generation file executable
chmod a+x /usr/lib/squid/security_file_certgen
# Make PEM readable
chmod 400 /ssl/squidCA.pem
# Make /run writable to all users
chmod 777 /run
# Writable /var/log/squid dir
chmod -R o+rw /var/log/squid
# Build the SSL DB for security generation
rm -rf /var/lib/ssl_db
/usr/lib/squid/security_file_certgen -c -s /var/lib/ssl_db -M 4MB
# Executes /
sed --in-place 's/^M//g' /rewrite.py
touch /tmp/rewrite_js_log
touch /tmp/rewrite_html_log
chmod -R o+rw /tmp/rewrite_js_log
chmod -R o+rw /tmp/rewrite_html_log

# echo "https://example.com/test.js\n" | /rewrite.py 

# Debug mode
# /usr/sbin/squid -NYCd 1
/usr/sbin/squid -N 