'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/atoms';
import { useWalletStore } from '@/store/walletStore';
import { sendStxTransfer } from '@/lib/stacks';

export function TransferExample() {
  const { isConnected } = useWalletStore();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; txid?: string; error?: string } | null>(null);

  const handleTransfer = async () => {
    if (!recipient || !amount) return;

    setLoading(true);
    setResult(null);

    // Convert STX to microSTX (1 STX = 1,000,000 microSTX)
    const microStx = (parseFloat(amount) * 1_000_000).toString();

    const response = await sendStxTransfer(microStx, recipient, memo);
    setResult(response);
    setLoading(false);

    if (response.success) {
      setRecipient('');
      setAmount('');
      setMemo('');
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary">
        <p className="text-text-secondary text-center">
          Connect your wallet to send transactions
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-bg-secondary border border-bg-tertiary space-y-4">
      <h3 className="text-xl font-bold text-text-primary">Send STX</h3>
      
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Recipient Address
        </label>
        <Input
          value={recipient}
          onChange={setRecipient}
          placeholder="SP2..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Amount (STX)
        </label>
        <Input
          type="number"
          value={amount}
          onChange={setAmount}
          placeholder="1.0"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Memo (optional)
        </label>
        <Input
          value={memo}
          onChange={setMemo}
          placeholder="Payment for..."
        />
      </div>
      
      <Button
        onClick={handleTransfer}
        loading={loading}
        disabled={!recipient || !amount}
        className="w-full"
      >
        Send Transaction
      </Button>

      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          {result.success ? (
            <div>
              <p className="text-green-400 font-medium">Transaction sent!</p>
              <p className="text-sm text-text-secondary mt-1 break-all">
                TX ID: {result.txid}
              </p>
            </div>
          ) : (
            <p className="text-red-400">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
