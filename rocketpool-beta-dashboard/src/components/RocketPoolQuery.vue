<template>
    <div>
        <h3>
            For now, in order to query the Rocket Pool contracts, you need to provide the ports for your Eth1 and Eth2
            nodes. For more information on enabling queries in your nodes, visit
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

        <div class="ports">
            <label for="eth1Port">Eth1 Port:</label>
            <input id="eth1Port" type="text" v-model="eth1Port" />
            <br />
            <label for="eth2Port">Eth2 Port:</label>
            <input id="eth2Port" type="text" v-model="eth2Port" />
            <br />
            <button type="button" @click="fetchNodes">Get Node Data</button>
            <br />
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
    eth1Port = '8547';
    eth2Port = '5052';

    fetchingNodes = false;
    queryError = '';

    mounted() {
        const eth1Cookie = CookieManager.get('eth1port');
        const eth2Cookie = CookieManager.get('eth2port');
        if (eth1Cookie !== '') this.eth1Port = eth1Cookie;
        if (eth2Cookie !== '') this.eth2Port = eth2Cookie;
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

        if (!this.validateEthPorts()) return;

        // One month expiration for cookie
        CookieManager.set('eth1port', this.eth1Port, 30 * 24 * 60 * 60);
        CookieManager.set('eth2port', this.eth2Port, 30 * 24 * 60 * 60);

        this.fetchingNodes = true;

        const rp: RocketPoolAPI = new RocketPoolAPI(Number(this.eth1Port), Number(this.eth2Port));
        rp.getNodeInformation().then((nodes: Node[]) => {
            this.fetchingNodes = false;

            if (nodes.length === 0) {
                this.queryError = 'Unable to obtain node information';
                return;
            }

            this.nodes = nodes;
        });
    }

    validateEthPorts(): boolean {
        if (!this.validatePort(this.eth1Port)) {
            this.queryError = 'Invalid value for Eth1 Port';
            return false;
        }
        if (!this.validatePort(this.eth2Port)) {
            this.queryError = 'Invalid value for Eth2 Port';
            return false;
        }
        return true;
    }

    validatePort(port: string): boolean {
        const p = Number(port);
        return p >= 1 && p <= 65535 && Number.isInteger(p) && port === p.toString();
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
}
button {
    margin-bottom: 15px;
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
</style>
