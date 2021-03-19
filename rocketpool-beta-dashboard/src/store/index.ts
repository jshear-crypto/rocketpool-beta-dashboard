import Vue from 'vue';
import Vuex from 'vuex';
import { Node, EmptyNode } from '../utils/rocketpool';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        nodes: Array<Node>(),
        selectedNode: EmptyNode,
        rewardMinipools: 0,
    },
    getters: {
        nodes: state => {
            return state.nodes;
        },
        selectedNode: state => {
            return state.selectedNode;
        },
        rewardMinipools: state => {
            return state.rewardMinipools;
        },
    },
    mutations: {
        selectNode(state, node: Node) {
            state.selectedNode = node;
        },
        updateNodes(state, nodes: Node[]) {
            state.nodes = nodes;
        },
        setRewardMinipools(state, numPools: number) {
            state.rewardMinipools = numPools;
        },
    },
    actions: {},
    modules: {},
});
