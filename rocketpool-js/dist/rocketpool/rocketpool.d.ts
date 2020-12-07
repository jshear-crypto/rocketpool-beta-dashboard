import Web3 from 'web3';
import { ContractArtifact } from '../utils/contract';
import Contracts from './contracts/contracts';
import Deposit from './deposit/deposit';
import Minipool from './minipool/minipool';
import Network from './network/network';
import Node from './node/node';
import DepositSettings from './settings/deposit';
import MinipoolSettings from './settings/minipool';
import NetworkSettings from './settings/network';
import NodeSettings from './settings/node';
import NETH from './tokens/neth';
import RETH from './tokens/reth';
/**
 * Main Rocket Pool library class
 */
declare class RocketPool {
    readonly web3: Web3;
    readonly RocketStorage: ContractArtifact;
    readonly contracts: Contracts;
    readonly deposit: Deposit;
    readonly minipool: Minipool;
    readonly network: Network;
    readonly node: Node;
    readonly settings: {
        deposit: DepositSettings;
        minipool: MinipoolSettings;
        network: NetworkSettings;
        node: NodeSettings;
    };
    readonly tokens: {
        neth: NETH;
        reth: RETH;
    };
    constructor(web3: Web3, RocketStorage: ContractArtifact);
}
export default RocketPool;
