import { Node } from './rocketpool';

type NodeUpdate = { time: number; nodes: Node[] };

class LeaderboardUpdateManager {
    public getNodes(): Promise<NodeUpdate> {
        return new Promise<NodeUpdate>((resolve: any) => {
            const req = new XMLHttpRequest();
            const emptyResp = { time: 0, nodes: [] };
            req.open('GET', '/php/controllers/NodeLeaderboardController.php?action=getNodes', true);
            req.onreadystatechange = () => {
                if (req.readyState !== 4) return;
                if (req.status !== 200) {
                    resolve(emptyResp);
                    return;
                }
                const resp = JSON.parse(req.responseText);
                if (resp.status !== 200) {
                    resolve(emptyResp);
                    return;
                }

                const update: NodeUpdate = resp.data;

                // Time since last update is current epoch sec minus epoch sec at last update
                const epochSec = Math.round(new Date().getTime() / 1000);
                update.time = epochSec - update.time;

                resolve(update);
            };
            req.onerror = () => {
                resolve(emptyResp);
            };
            req.send();
        });
    }

    public setNodes(nodes: Node[], auth: string): Promise<string> {
        return new Promise<string>((resolve: any) => {
            const req = new XMLHttpRequest();
            req.open('POST', '/php/controllers/NodeLeaderboardController.php?action=setNodes', true);
            req.onreadystatechange = () => {
                if (req.readyState !== 4) return;
                if (req.status !== 200) {
                    resolve('Failed to set nodes');
                    return;
                }
                const resp = JSON.parse(req.responseText);
                if (resp.status !== 200) {
                    resolve('Failed to set nodes');
                    return;
                }
                resolve('Successfully updated nodes!');
            };
            req.onerror = () => {
                resolve('Failed to set nodes');
            };
            req.send(JSON.stringify({ auth: auth, nodes: nodes }));
        });
    }
}

const LeaderboardUpdater = new LeaderboardUpdateManager();

export { LeaderboardUpdater, NodeUpdate };
