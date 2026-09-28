# Description
A configuration IaC repository that builds and deploys AWS EC2 images using Ansible and GitHub Actions.  
The sample configured application is https://github.com/wrong-commit/AusPohzt. 

# Features 
1. Automate creation of an AWS VM image that can be dynamically configured to run in multiple environments  
2. Ansible provisioning of AWS infrastructure  
3. Automatically scale AWS EC2 instances when resource usage is high  
4. Automatically rollback failed deployments  
5. Load balanced EC2 instance that scales up on high CPU usage  
6. Use EC2 metadata tags and AWS Secrets Manager to dynamically configure each environment  

# CI/CD Pipeline  
GitHub Actions are chosen for running IaC code. The program `act` can be installed from   
https://github.com/nektos/act so we can run `act.sh`.   

Setup `.env` and `.secrets` for the GitHub environment variables and secrets described below.  
 
Environment variables that need to be added to each GitHub Action Environment are:  
- `APP_GIT_REPO`. The git repository used to build EC2 application
- `APP_ENV`. The environment that is being built. Valid values are 'UAT'|'PROD'

Secrets that need to be added to each GitHub Action Environment are as follows:  
- `AWS_ACCESS_KEY`. AWS Access Key  
- `AWS_SECRET_KEY`. AWS Secret Key
- `CONF_DB_USER`. Database username 
- `CONF_DB_PASS`. Database password

# Playbooks     
All playbooks used for deploying the application are listed in the `playbooks/` directory.  
1. `main_build_latest_ami_and_deploy.yml`. Generate EC2 build image, deploy to UAT/PROD
2. `main_deploy_latest_ami.yml`. Deploy an AMI to the autoscaled environment

# Debugging 
1. Use `sudo tail -f /var/log/cloud-init-output.log` on launch of Build EC2 VM to view image creation logs  
2. Use `journalctl -f -u auspohzt.service` to view DB Migration/API/FE startup logs  

# TODO 
- [x] Build EC2 instance and deploy application code successfully  
- [x] Create production ready AMI from automated EC2 build server  
- [x] Detect when EC2 is ready and application has built/started using ELB Target Groups  
- [x] Setup and deploy PROD/UAT environments from one Playbook  
- [x] Create DB for UAT/PROD environments during application deploy   
- [x] Configure EC2 autoscaling using ASG rules  
- [x] Automatically rollback failed deployments to UAT and PROD with CloudWatch alarms
- [ ] Fix bugs in CloudWatch Target Group alarming too early  
- [x] Do not use envsubst to populate docker-compose. Use AWS Secrets Manager  
- [x] Update AusPohzt project to source application secrets from AWS Secrets Manager  
- [ ] Clean up build assets on playbook completion  
- [ ] Signature verify aws cli  
- [ ] Improve EC2 Deploy and AMI creation times by using Alpine Linux VM instead of Ubuntu  
- [ ] Lots of duplicated variables values in playbooks. Change duplicated values to be default value for role  
- [ ] Log user data script time to optimize expected timeouts   

