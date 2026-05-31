##  About the ColossusX-Miner Repository
This repository reflects the binaries generated from the following branch:
https://github.com/CypherTroopers/cypher/tree/colossusX_dev_test
Because the binaries are already included, you can run a node immediately without building the source code yourself.

## Setup Linux/Windows/mac

```bash
git clone https://github.com/CypherTroopers/ColossusX-Miner.git
cd ColossusX-Miner
 ```
## Running a Node

***Linux***
```bash
chmod +x colossusX_linux.sh
chmod +x ./build/bin/cypher-linux-amd64
./colossusX_linux.sh
```

***Windows***
```powershell
Unblock-File .\colossusX_windows.ps1
Unblock-File .\build\bin\cypher.exe
powershell -ExecutionPolicy Bypass -File .\colossusX_windows.ps1
```

***mac(Apple Silicon Mac)***
```bash
chmod +x colossusX_mac.sh
chmod +x ./build/bin/cypher-darwin-arm64
./colossusX_mac.sh
```

## start mining (console)Linux/Windows/mac
## console command Linux/Windows/mac
1. Generate a wallet
 ```
personal.newAccount("your password")
 ```
2.Start mining
 ```
miner.start(1, "0x your address here", "your password")
 ```
3.You can specify the wallet address that will receive the mining rewards.
If you do not specify one, the rewards will be sent to the address that started mining.
```
miner.setEtherbase("0x your address here")
```
4.Check the wallet balance
 ```
web3.fromWei(eth.getBalance("0x your address"), "ether")
```
For other console commands, please refer to the section near the bottom of the page below:
https://github.com/cypherium/cypher

##  Running a Node(background)

If you want to run the node in the background using pm2, nohup, or any other tool you are familiar with, use one of the following files depending on your environment:
***Linux***
```
./colossusX_linux.sh
```
***Windows PowerShell***
```
.\colossusX_windows.ps1
```
***macOS***
```
./colossusX_mac.sh
```
### Linux / macOS / PowerShell
Move to the ColossusX-Miner directory.
```
cd ~/ColossusX-Miner
```
## Accessing the IPC Console

***Linux***
```
./build/bin/cypher-linux-amd64 attach ipc:./chaindbname/cypher.ipc
```
*** Mac***
```
./build/bin/cypher-darwin-arm64 attach ipc:./chaindbname/cypher.ipc
```
***Windows***
```
.\build\bin\cypher.exe attach ipc:\\.\pipe\cypher.ipc
```
