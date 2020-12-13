<template>
    <div class="dashboard" :class="{ padBottom: !showLeaderboard }">
        <img alt="Rocket Pool Logo" src="../assets/rplogo.png" />
        <h1>Rocket Pool Pyrmont Beta Dashboard</h1>
        <br />
        <h3>
            Welcome to the Rocket Pool Beta Dashboard! Want to see where you stand in the rankings? You've come to the
            right place! This dashboard is not affiliated with the official Rocket Pool team. Reach out to @jshear on
            the Rocket Pool discord with any errors, questions, or suggestions. If you somehow got here by mistake, you
            should head over to
            <a href="https://www.rocketpool.net/" target="_blank" rel="noopener noreferrer">Rocket Pool</a>
            to learn more.
        </h3>
        <RocketPoolQuery class="nodeQuery" />
        <NodeLeaderboard v-if="showLeaderboard" class="nodeLeaderboard" />
        <div v-if="showOverview" class="nodeOverviewContainer" @click="onOverviewClicked">
            <NodeOverview class="nodeOverview" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import RocketPoolQuery from '@/components/RocketPoolQuery.vue';
import NodeLeaderboard from '@/components/NodeLeaderboard.vue';
import NodeOverview from '@/components/NodeOverview.vue';
import { EmptyNode } from '@/utils/rocketpool';

@Component({
    components: {
        RocketPoolQuery,
        NodeLeaderboard,
        NodeOverview,
    },
})
export default class Dashboard extends Vue {
    mounted() {
        if (window.location.protocol === 'https:') window.location.href = document.URL.replace('https://', 'http://');
        this.$store.commit('updateNodes', []);
    }

    get showLeaderboard() {
        return this.$store.getters.nodes.length !== 0;
    }

    get showOverview() {
        return this.$store.getters.selectedNode.rank !== 0;
    }

    onOverviewClicked(e: any) {
        if (!this.showOverview) return;
        if (e.target.closest('.nodeOverview')) return;

        // If a node overview is open an a user clicks outside of the overview, close it
        this.$store.commit('selectNode', EmptyNode);
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dashboard {
    margin-bottom: 30px;
}
.padBottom {
    margin-bottom: 300px;
}
.nodeQuery {
}
.nodeLeaderboard {
    margin-top: 0px;
}
.nodeOverviewContainer {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: transparent;
}
.nodeOverview {
    position: fixed;
    left: 20%;
    top: 20%;
    width: 60%;
    height: 60%;
}
</style>
