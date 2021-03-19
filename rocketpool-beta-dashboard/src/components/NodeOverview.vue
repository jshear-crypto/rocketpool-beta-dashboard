<template>
    <div class="overviewContainer">
        <div v-show="!showMinipool">
            <button type="button" @click="closeOverview">Close</button>
            <h3>Node Overview</h3>
        </div>
        <div v-show="showMinipool">
            <button type="button" @click="closeMinipool">Back</button>
            <h3>Minipool Overview</h3>
        </div>

        <div v-show="!showMinipool" class="nodeContainer">
            <span class="descriptor">Rank:</span><span>{{ node.rank }}</span>
            <br />
            <span class="descriptor">Address:</span><span>{{ node.address }}</span>
            <br />
            <span class="descriptor">Earnings of Top {{ rewardMinipools }} Minipool(s):</span
            ><span>{{ node.rewardEarnings }}</span>
            <br />
            <span class="descriptor">Minipools:</span><span>{{ node.minipools.length }}</span>
            <ul class="minipoolList">
                <li
                    v-for="minipool in node.minipools"
                    :key="minipool.index"
                    @click="selectMinipool(minipool)"
                    class="clickable"
                >
                    {{ minipool.index }}
                </li>
            </ul>
        </div>
        <div v-show="showMinipool" class="minipoolContainer">
            <span class="descriptor">Index:</span><span>{{ selectedMinipool.index }}</span>
            <br />
            <span class="descriptor">Balance:</span><span>{{ selectedMinipool.balance }}</span>
            <br />
            <span class="descriptor">Status:</span><span>{{ selectedMinipool.status }}</span>
            <br />
            <span class="descriptor">Public Key:</span><span>{{ selectedMinipool.validator.pubkey }}</span>
            <br />
            <span class="descriptor">Activation Epoch:</span
            ><span>{{ selectedMinipool.validator.activationEpoch }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Minipool, EmptyMinipool } from '@/utils/Eth2API';
import { Node, EmptyNode } from '@/utils/rocketpool';

@Component({})
export default class NodeOverview extends Vue {
    selectedMinipool: Minipool = EmptyMinipool;

    get rewardMinipools(): number {
        return this.$store.getters.rewardMinipools;
    }

    get node() {
        return this.$store.getters.selectedNode || EmptyNode;
    }

    set node(node: Node) {
        this.$store.commit('selectNode', node);
    }

    get showMinipool() {
        return this.selectedMinipool !== EmptyMinipool;
    }

    selectMinipool(minipool: Minipool) {
        this.selectedMinipool = minipool;
    }

    closeOverview() {
        this.node = EmptyNode;
    }

    closeMinipool() {
        this.selectedMinipool = EmptyMinipool;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.overviewContainer {
    background-color: lightblue;
    border: 5px solid gray;
    border-radius: 15%;
    color: black;
    font-size: 1.2em;
    text-align: center;
    overflow: auto;
    white-space: nowrap;
}
.nodeContainer {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    text-align: left;
}
.minipoolContainer {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    text-align: left;
}
.descriptor {
    font-weight: bold;
    margin-left: 30px;
    display: inline-block;
    padding-top: 20px;
}
.minipoolList {
    margin-left: 40px;
    margin-top: 10px;
    margin-bottom: 0px;
    max-height: 100px;
    overflow-y: auto;
}
.clickable:hover {
    cursor: pointer;
}
span {
    margin-right: 5px;
}
button {
    position: absolute;
    left: 30px;
    top: 25px;
    background-color: transparent;
    border: 2px solid gray;
    border-radius: 15%;
}
button:hover {
    cursor: pointer;
}
</style>
