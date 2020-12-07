# Rocket Pool Pyrmont Beta Dashboard
Welcome to the Rocket Pool beta dashboard! This dashboard can be used to get updates on the nodes in the Rocket Pool network. The dashboard is currently being hosted on http://rocketpoolbetadashboard.000webhostapp.com/

In its current implementation, the dashboard gets the state of the Rocket Pool network using Eth1 and Eth2 nodes that you can specify. It is recommended that you either run the dashboard on the same LAN as your nodes, or use an SSH tunnel to access them remotely. You should not expose your nodes APIs to the public.

Note: Currently, only Geth and Lighthouse are supported. Prysm should work in theory if its RESTful endpoint is enabled, but I haven't had a chance to look into startup flags for Prysm or do any testing. If anyone wants to play around with Prysm or Infura, feel free to contribute :) I'll try to add Prysm support soon, but using the dashboard with Infura is probably a bad idea because it will eat up requests.

Other note: Since the Geth node requires a standard WebSocket connection and not a Secure WebSocket connection, the dashboard must be accessed using http, not https.

## Updating Geth and Lighthouse to allow API calls
In order for the dashboard to get the data from the nodes, the nodes need to be updated to expose their API (again, you do not need to expose the ports to the public, they should either be restricted to the LAN or an SSH tunnel should be used).

### Geth
The dashboard uses WebSockets to get the information from the Geth node. So, we need to enable the WebSocket server on the node in the start script. For this example, I will use port 8547 as the WebSocket port for Geth. You can use any port you want. If you choose a different port, make sure to use the same port that you chose when updating Docker below.

Open up `~/.rocketpool/chains/eth1/start-node.sh`. We need to add the following arguments to the Geth startup script: `--ws --ws.port 8547 --ws.api eth,net,web3 --ws.addr 0.0.0.0 --ws.origins '*'`. The startup script should look something like this:

![Geth Example](instructions/geth-example.png)

### Lighthouse
The dashboard uses the HTTP server on the Lighthouse node to get the information.

Open up `~/.rocketpool/chains/eth2/start-beacon.sh`. We need to add the following arguments to the Lighthouse startup script: `--http-allow-origin '*'`. The startup script should look something like this:

![Lighthouse Example](instructions/lighthouse-example.png)

### Docker
Now we have everything enabled on the nodes, so all we have to do is expose the Docker ports for the nodes to the host machine. We can do this in `~/.rocketpool/docker-compose.yml`. We need to update the `ports` attribute in the `eth1` and `eth2` services. Under the `eth1` service, add the following to the ports: `- "8547:8547/tcp"`. Under the `eth2` service, add the following to the ports: `- "5052:5052/tcp"`. That's it! The `docker-compose.yml` file should look something like this:

![Docker Example](instructions/docker-compose-example.png)

Note: If you are using SSH tunnels or running the dashboard on the same machine as your nodes, you can restrict the Docker ports to only be available to that machine. Do this by adding `127.0.0.1:` in front of the ports. E.g. `- "127.0.0.1:8547:8547"`

### Activating the changes
Now that we've made all the necessary changes, just run `rocketpool service pause && rocketpool service start` so that they take effect. Now, go enjoy the dashboard at http://rocketpoolbetadashboard.000webhostapp.com/!

## SSH Tunnels
If this dashboard is not open on the same network as the nodes, then you'll need SSH tunnels. Why do you need SSH tunnels? So that you can hit your new node API endpoints without exposing the ports we opened to the public. Google can help you out with setting up the SSH tunnels -- you'll need to do it for ports 8547 and 5052.

On Mac, an example `~/.ssh/config` file might look something like this, replacing {NODE_HOST} with the IP of the host your nodes are running on and {IDENTITY_FILE} with a path to your SSH private key file:

```
Host {NODE_HOST}
    IdentityFile {IDENTITY_FILE}
    Port 22
    LocalForward 8547 localhost:8547
    LocalForward 5052 localhost:5052
```

### Again, nothing should be exposed to the public!!!
Everything we've done here is exposing ports internally from the Rocket Pool stack to the machine it is running on, and to the local network if you choose to. There is no need to expose any of these ports to the public. I feel like I've said this enough times now, so hopefully nobody makes that mistake. Exposing uneccessary ports to the public just increases potential attack vectors -- you should only open up a port when you understand why you are doing it.

## Using the Dashboard
Now that your nodes are accepting API calls, using the dashboard is easy! Just type in the local IP of the machine the nodes are running on, the Eth1 port, and the Eth2 port, and then query the node data! Please reach out to @jshear on the Rocket Pool discord with any questions, errors, or suggestions.
