import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleUserStatus } from '../../store/slices/adminSlice';
import { Users, Shield, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.admin);

  const fetchUsersList = () => {
    dispatch(fetchAllUsers());
  };

  useEffect(() => {
    fetchUsersList();
  }, [dispatch]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const resultAction = await dispatch(toggleUserStatus(userId));
    if (toggleUserStatus.fulfilled.match(resultAction)) {
      toast.success(`User account status updated successfully.`);
      fetchUsersList();
    } else {
      toast.error(resultAction.payload?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Accounts</h1>
          <p className="text-sm text-slate-500">View and toggle customer account permissions.</p>
        </div>
        <button
          onClick={fetchUsersList}
          className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : users?.length > 0 ? (
        <Card className="border-slate-100 dark:border-slate-800">
          <div className="table-responsive-wrapper">
            <table className="w-full text-left border-collapse text-sm min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="px-6 py-4 font-semibold">
                    {item.firstName} {item.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {item.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.role === 'admin'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                        : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.role === 'admin' && <Shield className="h-3 w-3" />}
                      {item.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={item.isActive ? 'success' : 'danger'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.role !== 'admin' && (
                      <Button
                        variant={item.isActive ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleStatus(item._id, item.isActive)}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 border border-dashed rounded-xl">
          No user accounts found.
        </div>
      )}
    </div>
  );
};
