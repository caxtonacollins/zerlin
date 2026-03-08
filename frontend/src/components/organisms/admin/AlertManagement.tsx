'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import type { AlertWithUser } from '@/types/admin';
import { Trash2, Power, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export function AlertManagement() {
  const [alerts, setAlerts] = useState<AlertWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadAlerts();
  }, [page]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllAlerts(page, limit);
      setAlerts(data.alerts);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load alerts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (alertId: string, currentStatus: boolean) => {
    try {
      await adminApi.toggleAlert(alertId, !currentStatus);
      toast.success(`Alert ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadAlerts();
    } catch (error) {
      toast.error('Failed to toggle alert');
      console.error(error);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      await adminApi.deleteAlert(alertId);
      toast.success('Alert deleted successfully');
      loadAlerts();
    } catch (error) {
      toast.error('Failed to delete alert');
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

  const activeCount = alerts.filter(a => a.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Alert Management</h1>
        <div className="text-text-secondary">
          {activeCount} active / {total} total
        </div>
      </div>

      <div className="bg-bg-secondary rounded-lg border border-bg-tertiary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-primary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Target Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Triggers
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-tertiary">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-bg-primary/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-text-primary font-mono">
                      {alert.userAddress.slice(0, 8)}...{alert.userAddress.slice(-6)}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {alert.condition === 'BELOW' ? (
                        <>
                          <TrendingDown className="w-4 h-4 mr-2 text-green-400" />
                          <span className="text-green-400">Below</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2 text-red-400" />
                          <span className="text-red-400">Above</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-primary">
                    {alert.targetFee.toFixed(6)} STX
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      alert.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {alert.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-secondary text-sm">
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-primary">
                    {alert.triggerCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => handleToggle(alert.id, alert.isActive)}
                      className={`${
                        alert.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'
                      } transition-colors`}
                      title={alert.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-bg-secondary text-text-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-tertiary transition-colors"
        >
          Previous
        </button>
        <span className="text-text-secondary">
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= Math.ceil(total / limit)}
          className="px-4 py-2 bg-bg-secondary text-text-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-tertiary transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
