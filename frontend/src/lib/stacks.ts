import { request } from '@stacks/connect';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Send STX tokens to a recipient
 * @param amount - Amount in microSTX (1 STX = 1,000,000 microSTX)
 * @param recipient - Recipient STX address
 * @param memo - Optional memo string
 */
export async function sendStxTransfer(
  amount: string,
  recipient: string,
  memo?: string
) {
  try {
    const response = await request('stx_transferStx', {
      amount,
      recipient,
      memo: memo || '',
    });
    
    return {
      success: true,
      txid: response.txid,
    };
  } catch (error) {
    // Error handling delegated to caller
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed',
    };
  }
}

/**
 * Call a smart contract function
 */
export async function callContract(
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: any[],
  postConditions?: any[]
) {
  try {
    const response = await request('stx_callContract', {
      contract: `${contractAddress}.${contractName}`,
      functionName,
      functionArgs,
      postConditions: postConditions || [],
    });
    
    return {
      success: true,
      txid: response.txid,
    };
  } catch (error) {
    // Error handling delegated to caller
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Contract call failed',
    };
  }
}

/**
 * Get current account information
 */
export async function getAccountInfo() {
  try {
    const accounts = await request('stx_getAccounts') as any;
    return accounts.addresses?.[0] || null;
  } catch (error) {
    // Error handling delegated to caller
    return null;
  }
}
