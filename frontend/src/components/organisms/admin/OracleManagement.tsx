'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import type { OracleStatus } from '@/types/admin';
import { Shield, ShieldOff, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export function OracleManagement() {
  const [status, setStatus] = useState<OracleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [newFeeRate, setNewFeeRate] = useState('');
  const [congestion, setCongestion] = useState<'low' | 'medium' | 'high'>('low');
  const [newOracle, setNewOracle] = useState('');
  const [revokeAddress, setRevokeAddress] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOracleStatus();
      setStatus(data);
    } catch (error) {
      toast.error('Failed to load oracle status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(newFeeRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error('Invalid fee rate');
      return;
    }

    try {
      await adminApi.updateFeeRate(rate, congestion);
      toast.success('Fee rate updated successfully');
      setNewFeeRate('');
      loadStatus();
    } catch (error) {
      toast.error('Failed to update fee rate');
      console.error(error);
    }
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOracle.trim()) {
      toast.error('Please enter an oracle address');
      return;
    }

    try {
      await adminApi.authorizeOracle(newOracle);
      toast.success('Oracle authorized successfully');
      setNewOracle('');
      loadStatus();
    } catch (error) {
      toast.error('Failed to authorize oracle');
      console.error(error);
    }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeAddress.trim()) {
      toast.error('Please enter an oracle address');
      return;
    }

    if (!confirm(`Are you sure you want to revoke oracle: ${revokeAddress}?`)) {
      return;
    }

    try {
      await adminApi.revokeOracle(revokeAddress);
      toast.success('Oracle revoked successfully');
      setRevokeAddress('');
      loadStatus();
    } catch (error) {
      toast.error('Failed to revoke oracle');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Oracle Management</h1>
        <button
          onClick={loadStatus}
          className="flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Current Status */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-bg-tertiary">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Current Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-text-secondary text-sm mb-1">Current Fee Rate</p>
            <p className="text-2xl font-bold text-text-primary">
              {status?.currentFeeRate || 0} µSTX/byte
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-sm mb-1">Last Update</p>
            <div className="flex items-center text-text-primary">
              <Clock className="w-4 h-4 mr-2" />
              {status?.lastUpdate 
                ? formatDistanceToNow(new Date(status.lastUpdate), { addSuffix: true })
                : 'Never'}
            </div>
          </div>
          <div>
            <p className="text-text-secondary text-sm mb-1">Owner</p>
            <code className="text-sm text-text-primary font-mono">
              {status?.owner ? `${status.owner.slice(0, 12)}...${status.owner.slice(-8)}` : 'Not set'}
            </code>
          </div>
          <div>
            <p className="text-text-secondary text-sm mb-1">Initialized</p>
            <span className={`px-2 py-1 rounded-full text-xs ${
              status?.isInitialized 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {status?.isInitialized ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Update Fee Rate */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-bg-tertiary">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Update Fee Rate</h2>
        <form onSubmit={handleUpdateFeeRate} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">
              Fee Rate (µSTX/byte)
            </label>
            <input
              type="number"
              step="0.01"
              value={newFeeRate}
              onChange={(e) => setNewFeeRate(e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-bg-tertiary rounded-lg text-text-primary focus:outline-none focus:border-primary"
              placeholder="e.g., 1.5"
              required
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-2">
              Congestion Level
            </label>
            <select
              value={congestion}
              onChange={(e) => setCongestion(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-4 py-2 bg-bg-primary border border-bg-tertiary rounded-lg text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
          >
            Update Fee Rate
          </button>
        </form>
      </div>

      {/* Authorized Oracles */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-bg-tertiary">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Authorized Oracles</h2>
        <div className="space-y-2 mb-6">
          {status?.authorizedOracles && status.authorizedOracles.length > 0 ? (
            status.authorizedOracles.map((oracle, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-bg-primary rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-400" />
                  <code className="text-sm text-text-primary font-mono">
                    {oracle.slice(0, 12)}...{oracle.slice(-8)}
                  </code>
                </div>
              </div>
            ))
          ) : (
            <p className="text-text-tertiary text-center py-4">No authorized oracles</p>
          )}
        </div>

        {/* Authorize New Oracle */}
        <form onSubmit={handleAuthorize} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">
              Authorize New Oracle
            </label>
            <input
              type="text"
              value={newOracle}
              onChange={(e) => setNewOracle(e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-bg-tertiary rounded-lg text-text-primary focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="SP..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center"
          >
            <Shield className="w-4 h-4 mr-2" />
            Authorize Oracle
          </button>
        </form>
      </div>

      {/* Revoke Oracle */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-bg-tertiary">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Revoke Oracle</h2>
        <form onSubmit={handleRevoke} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">
              Oracle Address to Revoke
            </label>
            <input
              type="text"
              value={revokeAddress}
              onChange={(e) => setRevokeAddress(e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-bg-tertiary rounded-lg text-text-primary focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="SP..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center"
          >
            <ShieldOff className="w-4 h-4 mr-2" />
            Revoke Oracle
          </button>
        </form>
      </div>
    </div>
  );
}
