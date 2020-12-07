// Imports
import Web3 from 'web3';
import { EventLog, TransactionReceipt } from 'web3-core';
import { AbiInput } from 'web3-utils';


// Get arbitrary contract events from a transaction result
// txReceipt is the receipt returned from the transaction call
// contractAddress is the address of the contract to retrieve events for
// eventName is the name of the event to retrieve
// eventParams is an array of objects with string 'type' and 'name' keys and an optional boolean 'indexed' key
export function getTxContractEvents(web3: Web3, txReceipt: TransactionReceipt, contractAddress: string, eventName: string, eventParams: AbiInput[]): any {
    let events = [];
    if (txReceipt.events) for (let p in txReceipt.events) events.push(txReceipt.events[p]);
    return events
        .filter((log: EventLog) => (log.address.toLowerCase() == contractAddress.toLowerCase()))
        .filter((log: EventLog) => (log.raw!.topics[0] == web3.utils.soliditySha3(eventName + '(' + eventParams.map(param => param.type).join(',') + ')')))
        .map((log: EventLog) => web3.eth.abi.decodeLog(eventParams.map(param => {
            let decodeParam = Object.assign({}, param);
            if (decodeParam.indexed && (decodeParam.type == 'string' || decodeParam.type == 'bytes')) decodeParam.type = 'bytes32'; // Issues decoding indexed string and bytes parameters
            return decodeParam;
        }), log.raw!.data, log.raw!.topics.slice(1)));
}

