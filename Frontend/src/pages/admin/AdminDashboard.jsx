import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import { Users, Ticket, Plane, TrendingUp, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice } from '../../utils';

export const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoading || !stats) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue || 0), change: 'Monthly target reached', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Total Bookings', value: stats.totalBookings || 0, change: `${stats.confirmedBookings || 0} Confirmed`, icon: Ticket, color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/20' },
    { label: 'Total Flights', value: stats.totalFlights || 0, change: 'Scheduled', icon: Plane, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
    { label: 'Registered Users', value: stats.totalUsers || 0, change: `Active Users`, icon: Users, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-['Outfit']">AeroPulse Command Center</h1>
          <p className="text-sm text-cyan-400 font-semibold">Engineered by Abhijeet Singh Rana — Real-time analytics across revenue, flights & bookings.</p>
        </div>
        <button
          onClick={() => dispatch(fetchDashboardStats())}
          className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          title="Refresh Statistics"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Widget Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold mt-0.5">{card.value}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{card.change}</p>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Detailed breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking breakdown */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 lg:col-span-2">
          <h3 className="text-base font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">Booking Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-xl">
              <p className="text-xs text-slate-400 font-semibold">Confirmed</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{stats.confirmedBookings || 0}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-xl">
              <p className="text-xs text-slate-400 font-semibold">Pending</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">0</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-xl">
              <p className="text-xs text-slate-400 font-semibold">Cancelled</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{stats.cancelledBookings || 0}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-xl">
              <p className="text-xs text-slate-400 font-semibold">Completed</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">0</p>
            </div>
          </div>
        </Card>

        {/* Flight breakdown */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">Flight status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Scheduled</span>
              <Badge variant="info">{stats.flightsByStatus?.scheduled || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Delayed</span>
              <Badge variant="warning">{stats.flightsByStatus?.delayed || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Cancelled</span>
              <Badge variant="danger">{stats.flightsByStatus?.cancelled || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Completed</span>
              <Badge variant="success">{stats.flightsByStatus?.completed || 0}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
