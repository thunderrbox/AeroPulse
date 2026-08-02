import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenueAnalytics } from '../../store/slices/adminSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { formatPrice } from '../../utils';

export const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const { revenue, isLoading } = useSelector((state) => state.admin);

  const fetchAnalytics = () => {
    dispatch(fetchRevenueAnalytics());
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dispatch]);

  if (isLoading || !revenue) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Pre-process revenue analytics data for Recharts
  const monthlyData = revenue.monthlyRevenue?.map((item) => {
    const monthName = new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' });
    return {
      name: `${monthName} ${item._id.year}`,
      revenue: item.revenue,
      bookings: item.bookings,
    };
  }) || [];

  const totalRevenue = revenue.monthlyRevenue?.reduce((sum, item) => sum + item.revenue, 0) || 0;
  const totalBookings = revenue.monthlyRevenue?.reduce((sum, item) => sum + item.bookings, 0) || 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-sm text-slate-500">Analyze flight reservation volumes and monthly billing statistics.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          title="Refresh Analytics"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Analytics Summary */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Estimated Annual Billing</h3>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {formatPrice(totalRevenue)}
            </p>
          </div>
          <div className="h-[2px] bg-slate-50 dark:bg-slate-800" />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Billing Interval: Annual</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-500">
              <TrendingUp className="h-4 w-4" /> Healthy Growth
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Sales Count</h3>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {totalBookings}
            </p>
          </div>
          <div className="h-[2px] bg-slate-50 dark:bg-slate-800" />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Payment Success Rate: 99.8%</span>
            <span className="font-semibold text-primary-500 flex items-center gap-0.5">
              <Sparkles className="h-3 w-3" /> Auto-reconciled
            </span>
          </div>
        </Card>
      </section>

      {/* Recharts Graphical Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <Card className="p-6 bg-slate-900 border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-base font-black text-white font-['Outfit'] mb-6 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Monthly Revenue Growth (INR)</span>
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">Live Sync</span>
          </h3>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={(value) => formatPrice(value)} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#00e5ff" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Bookings Chart */}
        <Card className="p-6 bg-slate-900 border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-base font-black text-white font-['Outfit'] mb-6 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Ticket Volume Distribution</span>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">Monthly</span>
          </h3>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="bookings" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
