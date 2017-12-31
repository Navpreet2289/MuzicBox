Installation
============

Starting development
--------------------

Initial requirements:  

* `VirtualBox`  
* `Vagrant`  
* `Ansible`   
* Download and isntall `VBoxGuestAdditions.iso` for your version of VirtualBox


Vagrant(local) server setup
---------------------------
1. Remove `172.16.0.19` from the `~/.ssh/known_hosts` (otherwise error can occur during provision);
2. Set absolute paths in `deployment/hosts/` files  
3. Switch to project's directory;
4. Start vagrant:  
   `vagrant up`  
5. Make a provision of project:  
   `ansible-playbook deployment/provision.yml -i deployment/hosts/development`
6. Uncomment this line in Vagrantfile to allow syncing a project directory:  
   `config.vm.synced_folder ".", "/var/webapps/testproject/code", owner: "music_user_dev", group: "users"`
7. Now you have to reload vagrant, to sync your project directory with virtual server:  
   `vagrant reload` 
9. Make a deploy of project:  
   `ansible-playbook deployment/deploy.yml -i deployment/hosts/development`
10. SSH to virtual server:  
   `vagrant ssh`
11. Switch to project user:  
   `sudo su -l music_user_dev`
12. Create website superuser with username `admin` and password `admin` for convention:  
   `/var/webapps/testproject/virtualenv/bin/python /var/webapps/testproject/code/manage.py createsuperuser`
13. Freeze installed python packages in requirements.txt file:  
    `/var/webapps/testproject/virtualenv/bin/pip freeze > /var/webapps/testproject/code/requirements.txt`
14. Start django development server:  
    `/var/webapps/testproject/virtualenv/bin/python /var/webapps/testproject/code/manage.py runserver 0.0.0.0:8001`
15. Now you can see your app running in browser:  
    `http://127.0.0.1:8001/`


Remote server setup
---------------------------
1. Add files:  
   `credentials/production/super_user_name`  
   `credentials/production/super_user_password`  
   `credentials/production/super_user_password_crypted`  
   `credentials/production/project_user_name`  
   `credentials/production/project_user_password`  
   `credentials/production/project_user_password_crypted`  
   `credentials/production/ssh_port`  
   `deployment/hosts/initial`  
   `deployment/hosts/production`  
2. Edit `deployment/vars.yml` file. Pay attention to `server_hostname`, `project_repo` and `remote_host` variables
3. Generate `id_rsa` ssh key in `deployment/files/ssh/` directory by command (it asks you where to generate key):  
   `ssh-keygen -t rsa -C "artem.bernatskyy@gmail.com"`  
4. Add public key `id_rsa.pub` in your repository, to allow server pull this repository.  
   This command can help for MacOS:  
   `cat deployment/files/ssh/id_rsa.pub | pbcopy`
5. Do initial provision of server:  
   `ansible-playbook deployment/initial.yml -i deployment/hosts/initial --ask-pass -c paramiko` 
6. Update system packages and upgrade them if needed:  
   `ansible-playbook deployment/upgrade.yml -i deployment/hosts/production -K`  
7. Do project provision of server:  
   `ansible-playbook deployment/provision.yml -i deployment/hosts/production -K`  
9. Make first deploy of project:  
   `ansible-playbook deployment/deploy.yml -i deployment/hosts/production -K`
10. Login on remote server and create superuser;



Useful commands
---------------
`vagrant ssh`  
`sudo su -l mtas_user`  
`/var/webapps/testproject/virtualenv/bin/python /var/webapps/testproject/code/manage.py createsuperuser`  
`/var/webapps/testproject/virtualenv/bin/python /var/webapps/testproject/code/manage.py shell`  
`/var/webapps/testproject/virtualenv/bin/python /var/webapps/testproject/code/manage.py runserver 0.0.0.0:8001`  

`/var/webapps/testproject/virtualenv/bin/pip install <package>`  
`/var/webapps/testproject/virtualenv/bin/pip freeze > /var/webapps/testproject/code/requirements.txt`

`sudo locale-gen ru_RU.UTF-8`  
`sudo locale-gen en_US.UTF-8`


Passwords crypt
---------------
`>>> mkpasswd --method=sha-512`