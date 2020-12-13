<template>
    <div class="leaderboardContainer">
        <div class="nodeSearch">
            <NodeTypeahead :addresses="nodeAddresses" v-model="nodeAddress" @submit="searchForNode" />
            <button type="button" @click="searchForNode">Search</button>
            <span v-if="searchError" class="error">{{ searchError }}</span>
            <div v-if="showUpdateLeaderboard">
                <button type="button" @click="updateLeaderboard">Update</button>
                <input v-model="updateAuth" type="text" />
                <span>{{ updateResponse }}</span>
            </div>
        </div>
        <div class="tableContainer">
            <span class="tableMessage">Click on any node address for additional information</span>
            <div class="pageButtons">
                <span>{{ displayCountMessage }}</span>
                <img @click="page--" src="../assets/btn-arrow-left-black.png" />
                <img @click="page++" src="../assets/btn-arrow-right-black.png" />
            </div>
            <table>
                <thead>
                    <tr>
                        <th class="clickable" @click="sortProperty = 'rank'">
                            Rank
                        </th>
                        <th class="addressColumn">
                            Address
                        </th>
                        <th class="clickable" @click="sortProperty = 'minipools'">
                            Number of Minipools
                        </th>
                        <th class="clickable" @click="sortProperty = 'rank'">
                            Earnings (Top 2 Minipools)
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                        v-for="node in displayNodes"
                        :key="node.rank"
                        :class="{ selectedNode: node.address === nodeAddress }"
                        ref="displayRows"
                    >
                        <td>{{ node.rank }}</td>
                        <td class="clickable" @click="onNodeSelected(node.rank)">{{ node.address }}</td>
                        <td>{{ node.minipools.length }}</td>
                        <td>{{ node.rewardEarnings }}</td>
                    </tr>
                </tbody>
            </table>
            <span class="tableMessage">Click on any node address for additional information</span>
            <div class="pageButtons">
                <span>{{ displayCountMessage }}</span>
                <img @click="page--" src="../assets/btn-arrow-left-black.png" />
                <img @click="page++" src="../assets/btn-arrow-right-black.png" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import NodeTypeahead from '@/components/NodeTypeahead.vue';
import { Node } from '@/utils/rocketpool';
import CookieManager from '@/utils/CookieManager';
import { LeaderboardUpdater } from '@/utils/LeaderboardUpdateManager';

@Component({
    components: {
        NodeTypeahead,
    },
})
export default class NodeLeaderboard extends Vue {
    nodeAddress = '';
    searchError = '';
    updateResponse = '';
    updateAuth = '';
    searchedNodeIndex = 0;
    pageSize = 50;
    page = 1;
    sortProperty = 'rank';

    mounted() {
        this.nodeAddress = CookieManager.get('nodeaddress');
        this.updateAuth = CookieManager.get('updateauth');
    }

    get nodes(): Node[] {
        return this.$store.getters.nodes;
    }

    set nodes(nodes: Node[]) {
        this.$store.commit('updateNodes', nodes);
    }

    get nodeAddresses(): string[] {
        return this.nodes.map((node: Node): string => {
            return node.address;
        });
    }

    get selectedNode(): Node {
        return this.$store.getters.selectedNode;
    }

    set selectedNode(node: Node) {
        this.$store.commit('selectNode', node);
    }

    get sortedNodes(): Node[] {
        if (this.sortProperty === 'minipools') {
            return [...this.nodes].sort((a: Node, b: Node) => {
                return b.minipools.length - a.minipools.length;
            });
        }

        return this.nodes;
    }

    get displayNodes(): Node[] {
        if (this.pageSize < 1) this.pageSize = 1;
        if (this.page < 1) this.page = 1;
        if (this.nodes.length < this.pageSize) return this.nodes;

        let start = (this.page - 1) * this.pageSize;
        let end = this.page * this.pageSize;
        if (start >= this.nodes.length) {
            while ((this.page - 1) * this.pageSize >= this.nodes.length) this.page--;
            start = (this.page - 1) * this.pageSize;
        }
        if (end > this.nodes.length) end = this.nodes.length;

        const display: Node[] = [];
        for (let i = start; i < end; i++) {
            display.push(this.sortedNodes[i]);
        }
        return display;
    }

    get displayCountMessage(): string {
        const start = (this.page - 1) * this.pageSize + 1;
        let end = this.page * this.pageSize;
        if (end > this.nodes.length) end = this.nodes.length;
        const total = this.nodes.length;
        return `Showing ${start}-${end} of ${total}`;
    }

    get showUpdateLeaderboard(): boolean {
        return this.nodeAddress === '0x7E78228eCad2b14bEc742aF5507F102116D23E87' && this.$route.name === 'Dashboard';
    }

    searchForNode() {
        // One month expiration for cookie
        CookieManager.set('nodeaddress', this.nodeAddress, 30 * 24 * 60 * 60);

        this.searchedNodeIndex = 0;
        this.searchError = '';

        for (let i = 0; i < this.sortedNodes.length; i++) {
            if (this.sortedNodes[i].address == this.nodeAddress) {
                this.searchedNodeIndex = i;
                this.showSearchedNode();
                return;
            }
        }

        this.searchError = 'Node not found';
    }

    showSearchedNode() {
        this.page = Math.floor(this.searchedNodeIndex / this.pageSize) + 1;
        const rows = this.$refs.displayRows as Element[];
        const row: Element = rows[this.searchedNodeIndex % this.pageSize];
        row.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
    }

    onNodeSelected(rank: number) {
        this.selectedNode = this.nodes[rank - 1];
    }

    updateLeaderboard() {
        // One month expiration for cookie
        CookieManager.set('updateauth', this.updateAuth, 30 * 24 * 60 * 60);

        this.updateResponse = '';
        LeaderboardUpdater.setNodes(this.nodes, this.updateAuth).then((response: string) => {
            this.updateResponse = response;
        });
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.clickable:hover {
    cursor: pointer;
}
.leaderboardContainer {
    display: inline-block;
    padding: 40px;
    border-radius: 10%;
    text-align: left;
    color: black;
}
.nodeSearch {
    margin-bottom: 10px;
}
.nodeSearch span {
    margin-left: 5px;
    font-weight: bold;
}
.nodeSearch button {
    margin-right: 10px;
}
.nodeSearch div {
    display: inline-block;
}
.tableContainer {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
}
.pageButtons {
    text-align: right;
}
.pageButtons img {
    width: 2em;
    margin-left: 10px;
}

.pageButtons img:hover {
    cursor: pointer;
}
.pageButtons span {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    display: inline-block;
    font-weight: bold;
}
.addressColumn {
    width: 450px;
}
.tableMessage {
    float: left;
    font-weight: bold;
}
table {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 20px;
    border-collapse: collapse;
    font-weight: bold;
}
table,
th,
td {
    border: 1px solid black;
    padding: 5px;
}
tr:nth-child(odd) {
    background-color: #f1f2f2;
}
tr:nth-child(even) {
    background-color: lightgray;
}
th {
    background-color: #3387bd;
}
tr.selectedNode {
    background-color: coral;
}
</style>
