<template>
    <div class="leaderboardContainer">
        <div class="nodeSearch">
            <label for="nodeAddress">Node Address:</label>
            <input id="nodeAddress" type="text" v-model="nodeAddress" />
            <button type="button" @click="searchForNode">Search</button>
            <span v-if="searchError" class="error">{{ searchError }}</span>
        </div>
        <div class="tableContainer">
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
                    >
                        <td>{{ node.rank }}</td>
                        <td class="clickable" @click="onNodeSelected(node.rank)">{{ node.address }}</td>
                        <td>{{ node.minipools.length }}</td>
                        <td>{{ node.rewardEarnings }}</td>
                    </tr>
                </tbody>
            </table>
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
import { Node } from '../utils/rocketpool';
import CookieManager from '../utils/CookieManager';

@Component({})
export default class NodeLeaderboard extends Vue {
    nodeAddress = '';
    searchError = '';
    searchedNodeIndex = 0;
    pageSize = 10;
    page = 1;
    sortProperty = 'rank';

    mounted() {
        this.nodeAddress = CookieManager.get('nodeaddress');
    }

    get nodes() {
        return this.$store.getters.nodes;
    }

    set nodes(nodes: Node[]) {
        this.$store.commit('updateNodes', nodes);
    }

    get selectedNode() {
        return this.$store.getters.selectedNode;
    }

    set selectedNode(node: Node) {
        this.$store.commit('selectNode', node);
    }

    get sortedNodes() {
        if (this.sortProperty === 'minipools') {
            return [...this.nodes].sort((a: Node, b: Node) => {
                return b.minipools.length - a.minipools.length;
            });
        }

        return this.nodes;
    }

    get displayNodes() {
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

    get displayCountMessage() {
        const start = (this.page - 1) * this.pageSize + 1;
        let end = this.page * this.pageSize;
        if (end > this.nodes.length) end = this.nodes.length;
        const total = this.nodes.length;
        return `Showing ${start}-${end} of ${total}`;
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
        this.page = Math.floor(this.searchedNodeIndex / 10) + 1;
    }

    onNodeSelected(rank: number) {
        this.selectedNode = this.nodes[rank - 1];
    }
} // TODO "Showing X of Y"
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
.nodeSearch label {
    font-weight: bold;
    margin-right: 5px;
}
.nodeSearch input {
    margin-right: 10px;
    width: 40%;
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
