// Imports
import { assert } from 'chai';
import Web3 from 'web3';
import { SendOptions } from 'web3-eth-contract';
import RocketPool from '../../rocketpool/rocketpool';
import MinipoolContract from '../../rocketpool/minipool/minipool-contract';


// Withdraw a minipool
export async function withdraw(web3: Web3, rp: RocketPool, minipool: MinipoolContract, options: SendOptions) {

    // Withdraw
    await minipool.withdraw(options);

    // Check minipool contract
    let minipoolCode = await web3.eth.getCode(minipool.address);
    assert.equal(minipoolCode, '0x', 'Minipool was not withdrawn successfully');

}

