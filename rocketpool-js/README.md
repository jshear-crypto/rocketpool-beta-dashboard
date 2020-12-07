# rocketpool-js
A javascript library for interacting with the Rocket Pool network.

Install the following dependencies:
```
$ npm i -g mocha typescript ts-node && npm i
```

Run Ganache:
```
$ ganache-cli -l 8000000 -e 10000 -i 1337
```

Clone and migrate the Rocket Pool contracts:
```
$ git clone https://github.com/rocket-pool/rocketpool.git
$ truffle migrate --reset
```

In javascript library directory, create symlink to Rocket Pool Truffle contract artifacts:
```
$ ln -s ../../rocketpool/build/contracts/ src/contracts
```

Give the Javascript library a spin:
```
$ npm test
```
