<template>
    <div class="update" :class="{ padBottom: !showLeaderboard }">
        <img alt="Rocket Pool Logo" src="../assets/rplogo.png" />
        <h1>Rocket Pool Pyrmont Beta Dashboard</h1>
        <br />
        <h3>
            If you want the current state of the Rocket Pool network beta, head over to the Dashboard page where you can
            use your own nodes to query the network. If you can't get that working, you can still get updates on the
            beta leaderboard here! I'll try to update it frequently, but if you're curious for the most recent
            information just reach out to @jshear on the Rocket Pool Discord and I'll get it updated.
        </h3>
        <h3 v-if="durationSinceUpdate">Time since last update: {{ durationSinceUpdate }}</h3>
        <NodeLeaderboard v-if="showLeaderboard" class="nodeLeaderboard" />
        <div v-if="showOverview" class="nodeOverviewContainer" @click="onOverviewClicked">
            <NodeOverview class="nodeOverview" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import NodeLeaderboard from '@/components/NodeLeaderboard.vue';
import NodeOverview from '@/components/NodeOverview.vue';
import { EmptyNode } from '@/utils/rocketpool';
import { LeaderboardUpdater, NodeUpdate } from '@/utils/LeaderboardUpdateManager';

@Component({
    components: {
        NodeLeaderboard,
        NodeOverview,
    },
})
export default class Update extends Vue {
    updateNodes = true;
    timeSinceUpdate = -1;

    mounted() {
        if (window.location.protocol === 'https:') window.location.href = document.URL.replace('https://', 'http://');
        LeaderboardUpdater.getNodes().then((update: NodeUpdate) => {
            if (!this.updateNodes) return;
            this.timeSinceUpdate = update.time;
            this.$store.commit('updateNodes', update.nodes);
        });
    }

    beforeUnmount() {
        this.updateNodes = false;
    }

    get showLeaderboard(): boolean {
        return this.$store.getters.nodes.length !== 0;
    }

    get showOverview(): boolean {
        return this.$store.getters.selectedNode.rank !== 0;
    }

    get durationSinceUpdate(): string {
        let time = this.timeSinceUpdate;

        if (time < 0) return '';

        if (time < 60) return time.toString() + (time === 1 ? ' second' : ' seconds');

        if (time < 60 * 60) {
            const minutes = Math.floor(time / 60);
            const minuteString = minutes.toString() + (minutes === 1 ? ' minute' : ' minutes');
            const seconds = time % 60;
            const secondString = seconds.toString() + (seconds === 1 ? ' second' : ' seconds');
            return minuteString + ' and ' + secondString;
        }

        if (time < 24 * 60 * 60) {
            const hours = Math.floor(time / (60 * 60));
            const hourString = hours.toString() + (hours === 1 ? ' hour' : ' hours');
            time = time - hours * 60 * 60;
            const minutes = Math.floor(time / 60);
            const minuteString = minutes.toString() + (minutes === 1 ? ' minute' : ' minutes');
            return hourString + ' and ' + minuteString;
        }

        const days = Math.floor(time / (24 * 60 * 60));
        const dayString = days.toString() + (days === 1 ? ' day' : ' days');
        time = time - days * 24 * 60 * 60;
        const hours = Math.floor(time / (60 * 60));
        const hourString = hours.toString() + (hours === 1 ? ' hour' : ' hours');
        return dayString + ' and ' + hourString;
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
.update {
    margin-bottom: 30px;
}
.padBottom {
    margin-bottom: 300px;
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
