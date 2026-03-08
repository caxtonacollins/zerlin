'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import type { SystemStats, HealthStatus } from '@/types/admin';
import { Users, AlertCircle, Activity, TrendingUp, Database, Zap } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsData, healthData] = await Promise.all([
        adminApi.getSystemStats(),
        adminApi.getHealth(),
      ]);
      setStats(statsData);
      setHealth(healthData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
        <div className={`px-4 py-2 rounded-lg ${
          health?.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
          health?.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {health?.status || 'Unknown'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Users"
          value={stats?.totalUsers || 0}
          link="/admin/users"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          title="Active Alerts"
          value={stats?.activeAlerts || 0}
          subtitle={`${stats?.totalAlerts || 0} total`}
          link="/admin/alerts"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="Total Estimates"
          value={stats?.totalEstimates || 0}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Avg Response Time"
          value={`${stats?.avgResponseTime || 0}ms`}
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          title="Cache Hit Rate"
          value={`${((stats?.cacheHitRate || 0) * 100).toFixed(1)}%`}
        />
        <StatCard
          icon={<Database className="w-6 h-6" />}
          title="System Health"
          value={health?.status || 'Unknown'}
          link="/admin/oracle"
        />
      </div>

      {/* Service Status */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-bg-tertiary">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Service Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ServiceStatus name="Database" status={health?.database || false} />
          <ServiceStatus name="Redis" status={health?.redis || false} />
          <ServiceStatus name="Stacks Node" status={health?.stacks || false} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-bg-tertiary">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionButton href="/admin/users" label="Manage Users" />
          <ActionButton href="/admin/alerts" label="Manage Alerts" />
          <ActionButton href="/admin/oracle" label="Oracle Settings" />
          <ActionButton href="/history" label="View History" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, link }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  link?: string;
}) {
  const content = (
    <div className="bg-bg-secondary rounded-lg p-6 border border-bg-tertiary hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-text-secondary text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {subtitle && <p className="text-text-tertiary text-sm mt-1">{subtitle}</p>}
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}

function ServiceStatus({ name, status }: { name: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-bg-primary rounded-lg">
      <span className="text-text-primary">{name}</span>
      <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`} />
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-center transition-colors"
    >
      {label}
    </Link>
  );
}
