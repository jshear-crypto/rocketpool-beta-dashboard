const protocol = 'http';
const validatorEndpoint = '/eth/v1/beacon/states/head/validators';

interface MinipoolResponseObject {
    index: string;
    balance: string;
    status: string;
    validator: {
        pubkey: string;
        withdrawal_credentials: string;
        effective_balance: string;
        slashed: boolean;
        activation_eligibility_epoch: string;
        activation_epoch: string;
        exit_epoch: string;
        withdrawable_epoch: string;
    };
}

export interface Validator {
    pubkey: string;
    withdrawalCredentials: string;
    effectiveBalance: string;
    slashed: boolean;
    activationEligibilityEpoch: string;
    activationEpoch: string;
    exitEpoch: string;
    withdrawableEpoch: string;
}

export interface Minipool {
    index: string;
    balance: string;
    status: string;
    validator: Validator;
}

export const EmptyMinipool: Minipool = {
    index: '0',
    balance: '0',
    status: '',
    validator: {
        pubkey: '0',
        withdrawalCredentials: '',
        effectiveBalance: '0',
        slashed: false,
        activationEligibilityEpoch: '',
        activationEpoch: '',
        exitEpoch: '',
        withdrawableEpoch: '',
    },
};

export class Eth2API {
    private batchSize = 10;
    private host: string;

    public constructor(host: string) {
        this.host = host;
    }

    public async getMinipoolData(addresses: string[]): Promise<Minipool[]> {
        if (addresses.length === 0) {
            return new Promise<Minipool[]>((resolve: any) => {
                resolve([]);
            });
        }

        if (addresses.length <= this.batchSize) return this.queryMinipools(this.getMinipoolQuery(addresses));

        const minipools: Minipool[] = [];
        let minipoolPromise: Promise<void> = new Promise((resolve: any) => {
            resolve();
        });
        for (let i = 0; i < addresses.length + this.batchSize; i += this.batchSize) {
            let currentBatchSize: number = this.batchSize;
            if (i >= addresses.length) break;
            if (i + currentBatchSize >= addresses.length) currentBatchSize = addresses.length - i;
            const addressBatch: string[] = addresses.slice(i, i + currentBatchSize);
            minipoolPromise = minipoolPromise.then(async () => {
                const batchMinipools = await this.queryMinipools(this.getMinipoolQuery(addressBatch));
                minipools.push(...batchMinipools);
            });
        }

        return minipoolPromise.then((): Minipool[] => {
            return minipools;
        });
    }

    private getMinipoolQuery(addresses: string[]): string {
        return protocol + '://' + this.host + validatorEndpoint + '?id=' + addresses.join(',');
    }

    private queryMinipools(url: string): Promise<Minipool[]> {
        return new Promise<Minipool[]>((resolve: any, reject: any) => {
            const request = new XMLHttpRequest();
            request.onload = () => {
                if (request.status === 200) {
                    const resp: any = JSON.parse(request.response);
                    if (resp.data === undefined) {
                        reject(new Error('Data not available'));
                    }
                    resolve(this.minipoolsFromResponse(resp.data as MinipoolResponseObject[]));
                } else {
                    reject(new Error(request.statusText));
                }
            };
            request.onerror = function() {
                reject(new Error('XMLHttpRequest Error: ' + request.statusText));
            };
            request.open('GET', url);
            request.send();
        });
    }

    private minipoolsFromResponse(data: MinipoolResponseObject[]): Minipool[] {
        const minipools: Minipool[] = [];
        for (const minipoolData of data) {
            const minipool: Minipool = {
                index: minipoolData.index,
                balance: minipoolData.balance,
                status: minipoolData.status,
                validator: {
                    pubkey: minipoolData.validator.pubkey,
                    withdrawalCredentials: minipoolData.validator.withdrawal_credentials,
                    effectiveBalance: minipoolData.validator.effective_balance,
                    slashed: minipoolData.validator.slashed,
                    activationEligibilityEpoch: minipoolData.validator.activation_eligibility_epoch,
                    activationEpoch: minipoolData.validator.activation_epoch,
                    exitEpoch: minipoolData.validator.exit_epoch,
                    withdrawableEpoch: minipoolData.validator.withdrawable_epoch,
                },
            };
            minipools.push(minipool);
        }
        return minipools;
    }
}
