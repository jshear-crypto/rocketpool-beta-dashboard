// Imports
import Web3 from 'web3';
import { TransactionReceipt } from 'web3-core';
import { Contract, SendOptions } from 'web3-eth-contract';
import Contracts from '../contracts/contracts';
import { ConfirmationHandler, handleConfirmations } from '../../utils/transaction';
import ERC20 from './erc20';


/**
 * Rocket Pool RETH token manager
 */
class RETH extends ERC20 {


    // Constructor
    public constructor(web3: Web3, contracts: Contracts) {
        super(web3, contracts, 'rocketETHToken');
    }


    /**
     * Getters
     */


    // Get the amount of ETH backing an amount of rETH
    public getEthValue(rethAmountWei: string): Promise<string> {
        return this.tokenContract.then((tokenContract: Contract): Promise<string> => {
            return tokenContract.methods.getEthValue(rethAmountWei).call();
        });
    }


    // Get the amount of rETH backing an amount of ETH
    public getRethValue(ethAmountWei: string): Promise<string> {
        return this.tokenContract.then((tokenContract: Contract): Promise<string> => {
            return tokenContract.methods.getRethValue(ethAmountWei).call();
        });
    }


    // Get the current ETH : rETH exchange rate
    // Returns the amount of ETH backing 1 rETH
    public getExchangeRate(): Promise<number> {
        return this.tokenContract.then((tokenContract: Contract): Promise<string> => {
            return tokenContract.methods.getExchangeRate().call();
        }).then((value: string): number => parseFloat(this.web3.utils.fromWei(value, 'ether')));
    }


    // Get the total amount of ETH collateral available
    // TODO: revert to getTotalCollateral call after new RP deployment
    public getTotalCollateral(): Promise<string> {
        //return this.tokenContract.then((tokenContract: Contract): Promise<string> => {
        //    return tokenContract.methods.getTotalCollateral().call();
        //});
        return Promise.all([
            this.contracts.address('rocketETHToken').then((rethContractAddress: string): Promise<string> => {
                return this.web3.eth.getBalance(rethContractAddress);
            }),
            this.contracts.get('rocketDepositPool').then((rocketDepositPool: Contract): Promise<string> => {
                return rocketDepositPool.methods.getExcessBalance().call();
            }),
        ]).then(([rethContractBalance, depositPoolExcessBalance]: [string, string]): string => {
            return this.web3.utils.toBN(rethContractBalance).add(this.web3.utils.toBN(depositPoolExcessBalance)).toString(10);
        });
    }


    // Get the current ETH collateral rate
    // Returns the portion of rETH backed by ETH in the contract as a fraction
    public getCollateralRate(): Promise<number> {
        return this.tokenContract.then((tokenContract: Contract): Promise<string> => {
            return tokenContract.methods.getCollateralRate().call();
        }).then((value: string): number => parseFloat(this.web3.utils.fromWei(value, 'ether')));
    }


    /**
     * Mutators - Public
     */


    // Burn rETH for ETH
    public burn(amountWei: string, options?: SendOptions, onConfirmation?: ConfirmationHandler): Promise<TransactionReceipt> {
        return this.tokenContract.then((tokenContract: Contract): Promise<TransactionReceipt> => {
            return handleConfirmations(
                tokenContract.methods.burn(amountWei).send(options),
                onConfirmation
            );
        });
    }


}


// Exports
export default RETH;
