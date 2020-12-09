<template>
    <div>
        <h3>
            For now, in order to query the Rocket Pool contracts, you need to provide the hosts (IP & port) for your
            Eth1 and Eth2 nodes. For more information on enabling queries in your nodes, visit
            <a
                href="https://github.com/jshear-crypto/rocketpool-beta-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                >the GitHub page</a
            >.
        </h3>
        <h3>
            Note: These rankings are NOT official, and do NOT guarantee any portion of the Rocket Pool Beta reward pool.
            These rankings are NOT provided by the Rocket Pool team, and the Rocket Pool team may change the reward
            distribution amounts/ranking system.
        </h3>

        <br />
        <br />

        <div class="hosts">
            <br />
            <label for="eth1Host">Eth1 Host:</label>
            <input id="eth1Host" type="text" placeholder="localhost:8547" v-model="eth1Host" />
            <br />
            <label for="eth2Host">Eth2 Host:</label>
            <input id="eth2Host" type="text" placeholder="localhost:5052" v-model="eth2Host" />
        </div>
        <br />
        <button type="button" :disabled="fetchingNodes" @click="fetchNodes">Get Node Data</button>
        <br />
        <div class="status">
            <p class="error" v-if="queryError">{{ queryError }}</p>
            <div v-if="fetchingNodes">
                <img src="../assets/rocket.gif" />
                <p class="update">Fetching node data... please be patient</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { RocketPoolAPI, Node } from '../utils/rocketpool';
import CookieManager from '../utils/CookieManager';

@Component({})
export default class RocketPoolQuery extends Vue {
    eth1Host = 'localhost:8547';
    eth2Host = 'localhost:5052';

    fetchingNodes = false;
    queryError = '';

    mounted() {
        const eth1Cookie = CookieManager.get('eth1host');
        const eth2Cookie = CookieManager.get('eth2host');
        if (eth1Cookie !== '') this.eth1Host = eth1Cookie;
        if (eth2Cookie !== '') this.eth2Host = eth2Cookie;
    }

    get nodes() {
        return this.$store.getters.nodes;
    }

    set nodes(nodes: Node[]) {
        this.$store.commit('updateNodes', nodes);
    }

    fetchNodes() {
        this.queryError = '';
        this.nodes = [];

        if (!this.validateEthHosts()) return;

        // One month expiration for cookie
        CookieManager.set('eth1host', this.eth1Host, 30 * 24 * 60 * 60);
        CookieManager.set('eth2host', this.eth2Host, 30 * 24 * 60 * 60);

        this.fetchingNodes = true;

        const rp: RocketPoolAPI = new RocketPoolAPI(this.eth1Host, this.eth2Host);
        rp.getNodeInformation()
            .then((nodes: Node[]) => {
                this.fetchingNodes = false;

                this.nodes = nodes;
            })
            .catch((error: any) => {
                this.fetchingNodes = false;

                const errMsg = String(error);
                console.log('Error getting node information: ' + errMsg);
                if (errMsg.startsWith("Error: Returned values aren't valid, did it run Out of Gas?")) {
                    this.queryError = 'Eth1 node is not fully synced';
                    return;
                }

                this.queryError = 'Unable to obtain node information';
            });
    }

    validateEthHosts(): boolean {
        if (!this.validateHost(this.eth1Host)) {
            this.queryError = 'Invalid value for Eth1 Host';
            return false;
        }
        if (!this.validateHost(this.eth2Host)) {
            this.queryError = 'Invalid value for Eth2 Host';
            return false;
        }
        return true;
    }

    validateHost(host: string): boolean {
        const hostParts: string[] = host.split(':');
        if (hostParts.length !== 2) return false;
        const port = Number(hostParts[1]);
        return port >= 1 && port <= 65535 && Number.isInteger(port) && hostParts[1] === port.toString();
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
input {
    margin-left: 5px;
    margin-right: 30px;
    margin-bottom: 15px;
    padding: 3px;
}
button {
    margin-bottom: 15px;
    text-align: center;
}
.update {
    font-weight: bold;
    margin-top: 0;
}
.error {
    color: red;
    font-weight: bold;
    margin: 0;
    padding: 0;
}
.hosts {
    display: inline-block;
    text-align: right;
}
.status {
    text-align: center;
}
</style>
