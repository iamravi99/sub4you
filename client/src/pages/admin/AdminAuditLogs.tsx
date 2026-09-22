import React, { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw, Shield, User, Film, Coins, Settings } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { adminApi } from '../../api';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAuditLogs(page, 25);
      if (res.success) {
        setLogs(res.data.logs);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      console.error('[Audit Logs Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <AdminLayout
      title="Platform Audit Trails"
      subtitle="Immutable chronological logs of every administrative moderation, approval, and balance adjustment"
      actionButton={
        <Button variant="secondary" size="sm" onClick={fetchLogs} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Logs
        </Button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <Card className="p-12 text-center text-xs text-text-muted">No audit logs recorded yet.</Card>
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl border border-border-subtle bg-bg-card shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle bg-bg-primary/50 text-text-dim uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Admin</th>
                  <th className="py-3.5 px-4">Target Type</th>
                  <th className="py-3.5 px-4">Target ID</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-main font-medium">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-4 font-mono font-bold whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-semibold text-white">{log.adminId?.name || 'Admin'}</p>
                      <p className="text-[11px] text-text-dim">{log.adminId?.email}</p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-text-muted font-bold text-[10px] uppercase">
                      {log.targetType}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-text-dim whitespace-nowrap">
                      {log.targetId.slice(0, 12)}...
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-text-muted max-w-sm truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-4 px-4 text-right text-text-dim text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="text-xs font-mono text-text-muted px-2">Page {page} of {totalPages}</span>
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
