import RocketPool from 'rocketpool';
import Web3 from 'web3';
import Storage from './RocketStorage';
import { Minipool, Eth2API } from './Eth2API';

interface MinipoolDetails {
    address: string;
    exists: boolean;
    pubkey: string;
    withdrawalTotalBalance: string;
    withdrawalNodeBalance: string;
    withdrawable: boolean;
    withdrawalProcessed: boolean;
}

type Node = { address: string; rank: number; minipools: Minipool[]; rewardEarnings: number };

const EmptyNode: Node = { address: '0', rank: 0, minipools: Array<Minipool>(), rewardEarnings: 0 };

class RocketPoolAPI {
    public rpInstance: RocketPool;
    private eth1Host: string;
    private eth2Host: string;

    public constructor(eth1Host: string, eth2Host: string) {
        this.eth1Host = eth1Host;
        this.eth2Host = eth2Host;
        this.rpInstance = new RocketPool(this.getProvider(true), new Storage().getArtifact());
    }

    public getNodeInformation(): Promise<Node[]> {
        return this.getNodes();
    }

    private getNodes(): Promise<Node[]> {
        return this.rpInstance.node.getNodeAddresses().then(
            (addresses: string[]): Promise<Node[]> => {
                return this.getNodesFromAddresses(addresses).then((nodes: Node[]): Node[] => {
                    const rankedNodes = nodes
                        .sort((a: Node, b: Node) => {
                            return b.rewardEarnings - a.rewardEarnings;
                        })
                        .filter((node: Node) => {
                            return node.minipools.length !== 0;
                        });
                    for (let i = 0; i < rankedNodes.length; i++) {
                        rankedNodes[i].rank = i + 1;
                    }
                    return rankedNodes;
                });
            }
        );
    }

    private getNodesFromAddresses(addresses: string[]): Promise<Node[]> {
        return Promise.all(
            addresses.map(
                (address: string): Promise<Node> => {
                    return this.getNodeFromAddress(address);
                }
            )
        );
    }

    private getNodeFromAddress(address: string): Promise<Node> {
        return this.getNodeMinipools(address).then(
            (minipools: Minipool[]): Node => {
                if (minipools.length === 0) {
                    return { address: address, rank: 0, minipools: [], rewardEarnings: 0 };
                }

                if (minipools.length === 1) {
                    return {
                        address: address,
                        rank: 0,
                        minipools: minipools,
                        rewardEarnings: Number(
                            Web3.utils.fromWei(
                                (Number(minipools[0].balance) - Number(Web3.utils.toWei('32', 'gwei'))).toString(),
                                'gwei'
                            )
                        ),
                    };
                }

                return {
                    address: address,
                    rank: 0,
                    minipools: minipools,
                    rewardEarnings: Number(
                        Web3.utils.fromWei(
                            (
                                Number(minipools[0].balance) +
                                Number(minipools[1].balance) -
                                Number(Web3.utils.toWei('64', 'gwei'))
                            ).toString(),
                            'gwei'
                        )
                    ),
                };
            }
        );
    }

    private getNodeMinipoolPublicKeys(address: string): Promise<string[]> {
        return this.rpInstance.minipool.getNodeMinipools(address).then((minipools: MinipoolDetails[]): string[] => {
            const pubkeys = minipools.map((minipool: MinipoolDetails): string => {
                return minipool.pubkey;
            });
            return pubkeys.filter((key: string) => {
                return key != null;
            });
        });
    }

    private getNodeMinipools(address: string): Promise<Minipool[]> {
        return this.getNodeMinipoolPublicKeys(address).then(
            (addresses: string[]): Promise<Minipool[]> => {
                if (addresses.length === 0)
                    return new Promise<Minipool[]>((resolve: any) => {
                        resolve([]);
                    });
                return new Eth2API(this.eth2Host)
                    .getMinipoolData(addresses)
                    .then((minipools: Minipool[]): Minipool[] => {
                        if (minipools.length === 0 || minipools.length === 1) return minipools;
                        return minipools.sort((a: Minipool, b: Minipool) => {
                            return Number(b.balance) - Number(a.balance);
                        });
                    });
            }
        );
    }

    private getProvider(ws: boolean): Web3 {
        if (!ws) return new Web3(new Web3.providers.HttpProvider('http://' + this.eth1Host));

        return new Web3(new Web3.providers.WebsocketProvider('ws://' + this.eth1Host));
    }
}

export { Node, EmptyNode, RocketPoolAPI };
