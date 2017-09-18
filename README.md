
<p align="center">
<img src="https://raw.githubusercontent.com/infinispan/infispector/master_angular2_backup/img/logo.jpg" width="276" height="109">
</p>

<p align="center">
Infinispan messages history,<br/>
is never more a mystery.<br/>
</p>

<p align="center">
Meet InfiSpector, say hello!<br/>
He monitors that data flow.<br/>
Send the entries, let it grow,<br/>
InfiSpector makes the show!
</p>

#### What is InfiSpector:

Our intention is to graphically represent JGroups communication
happening between Infinispan nodes in a cluster to help users and developers
better understand what's happening inside during data replication/distribution.

#### How to run the application:

- `chmod +x install.sh`

- `./install.sh`
   
  * script will install dependencies and set everything for your comfort. Script will need password to create a file in */etc/bash\_completion.d/* folder for the autocomplete possibility

- `infispector prepare`

- `infispector nodes NUMBER` (optional)
  * simulate NUMBER of nodes with communication

- `infispector start`

- then you can access app locally at: http://localhost:8080/
