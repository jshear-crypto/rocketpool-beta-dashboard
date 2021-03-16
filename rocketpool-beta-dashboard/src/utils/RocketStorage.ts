import StorageAbiItems from './RocketStorageABI';
import { AbiItem } from 'web3-utils';

// Contract artifact
interface ContractArtifact {
    abi: AbiItem[];
    networks: { [id: string]: { address: string } };
}

class Storage {
    public getArtifact(): ContractArtifact {
        const networkId = '5';
        const storageAddress = '0xDeE7ec57E6b9f7F9A27e68821F3763e9d2537096';
        const networkAddresses: { [id: string]: { address: string } } = {
            [networkId]: { address: storageAddress },
        };
        return {
            abi: StorageAbiItems,
            networks: networkAddresses,
        };
    }
}

export default Storage;
