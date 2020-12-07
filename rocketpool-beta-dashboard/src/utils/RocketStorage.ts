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
        const storageAddress = '0xA85A8022E8F28E49B8BBfb792f93ee914B342C3b';
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
