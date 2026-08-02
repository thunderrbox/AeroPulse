import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyBookings } from '../../store/slices/bookingSlice';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { 
  Calendar, Ticket, Crown, ShieldAlert, ArrowRight, User, Sparkles, 
  CheckCircle2, QrCode, Coffee, Zap, BarChart3, Users, Plane, DollarSign
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils';
import toast from 'react-hot-toast';

export const DashboardHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { bookings, isLoading } = useSelector((state) => state.bookings);
  const [upgrading, setUpgrading] = useState(false);
  const [showLoungeModal, setShowLoungeModal] = useState(false);

  useEffect(() => {
    dispatch(getMyBookings({ limit: 5 }));
  }, [dispatch]);

  const handleUpgradeVIP = async () => {
    setUpgrading(true);
    try {
      await userService.upgradeToPremium();
      toast.success('Congratulations! You are now an Executive VIP Premium Member 👑');
      dispatch(fetchCurrentUser());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  const upcomingBookings = bookings?.filter((b) => b.status === 'confirmed' || b.status === 'pending') || [];
  const isAdmin = user?.role === 'admin';
  const isPremium = user?.role === 'premium' || user?.membershipTier === 'vip';

  // ==========================================
  // 1. ADMIN DASHBOARD VIEW
  // ==========================================
  if (isAdmin) {
    return (
      <div className="space-y-8">
        {/* Admin Command Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-amber-500/10">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 uppercase tracking-widest">
              <Crown className="h-3.5 w-3.5" /> AeroRana Executive Fleet Command Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-['Outfit']">
              Welcome, Administrator <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">{user?.firstName}</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time flight schedule dispatch, passenger booking overrides, and platform revenue telemetry.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/admin/analytics">
                <Button size="sm" className="font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-lg shadow-amber-500/20">
                  <BarChart3 className="h-4 w-4 mr-1.5" /> Revenue Telemetry
                </Button>
              </Link>
              <Link to="/admin/flights">
                <Button size="sm" variant="outline" className="font-bold border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
                  <Plane className="h-4 w-4 mr-1.5" /> Dispatch Flights
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Admin Quick Launchpad */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="p-6 bg-slate-900/90 border-slate-800 shadow-md hover:border-amber-500/40 transition-all cursor-pointer group"
            onClick={() => navigate('/admin/analytics')}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
              <Badge variant="warning">Live</Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Revenue Analytics</p>
              <p className="text-xl font-black text-white font-['Outfit'] mt-1">Analytics Hub</p>
            </div>
          </Card>

          <Card 
            className="p-6 bg-slate-900/90 border-slate-800 shadow-md hover:border-cyan-500/40 transition-all cursor-pointer group"
            onClick={() => navigate('/admin/flights')}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <Plane className="h-6 w-6" />
              </div>
              <Badge variant="info">35 Routes</Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Flight Schedules</p>
              <p className="text-xl font-black text-white font-['Outfit'] mt-1">Fleet Management</p>
            </div>
          </Card>

          <Card 
            className="p-6 bg-slate-900/90 border-slate-800 shadow-md hover:border-emerald-500/40 transition-all cursor-pointer group"
            onClick={() => navigate('/admin/users')}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passenger Accounts</p>
              <p className="text-xl font-black text-white font-['Outfit'] mt-1">User Management</p>
            </div>
          </Card>

          <Card 
            className="p-6 bg-slate-900/90 border-slate-800 shadow-md hover:border-indigo-500/40 transition-all cursor-pointer group"
            onClick={() => navigate('/admin/bookings')}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <Ticket className="h-6 w-6" />
              </div>
              <Badge variant="default">Global</Badge>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passenger Itineraries</p>
              <p className="text-xl font-black text-white font-['Outfit'] mt-1">Booking Overrides</p>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  // ==========================================
  // 2. EXECUTIVE PREMIUM VIP DASHBOARD VIEW
  // ==========================================
  if (isPremium) {
    return (
      <div className="space-y-8">
        {/* VIP Premium Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-amber-950/60 to-slate-950 border border-amber-400/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-amber-500/20">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-amber-400/15 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-xs font-bold text-amber-300 uppercase tracking-widest shadow-inner">
              <Crown className="h-4 w-4 text-yellow-300" /> Executive VIP First Class Club
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-['Outfit']">
              Welcome, VIP Passenger <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">{user?.firstName}</span> 👑
            </h1>
            <p className="text-sm text-amber-100/90 leading-relaxed">
              Enjoy 15% automatic VIP flight discounts, complimentary airport lounge access, priority express boarding, and dedicated 24/7 concierge.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button 
                onClick={() => setShowLoungeModal(true)}
                size="sm" 
                className="font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/30"
              >
                <Coffee className="h-4 w-4 mr-1.5" /> View Lounge Pass QR
              </Button>
              <Link to="/flights">
                <Button size="sm" variant="outline" className="font-bold border-amber-400/40 text-amber-300 hover:bg-amber-400/10">
                  Book VIP Flight <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* VIP Member Perks */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-900/90 border-amber-500/30 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-amber-300 font-bold uppercase">Lounge Access</p>
              <p className="text-sm font-bold text-white">Unlimited Complimentary</p>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-amber-500/30 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-amber-300 font-bold uppercase">Priority Boarding</p>
              <p className="text-sm font-bold text-white">Express Zone 1 Clearance</p>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-amber-500/30 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-amber-300 font-bold uppercase">VIP Discount</p>
              <p className="text-sm font-bold text-white">15% Off All Flights</p>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-amber-500/30 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-amber-300 font-bold uppercase">Concierge</p>
              <p className="text-sm font-bold text-white">24/7 Dedicated Support</p>
            </div>
          </Card>
        </section>

        {/* Lounge Pass Modal */}
        {showLoungeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 bg-slate-900 border-amber-500/40 text-center space-y-4 relative">
              <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 mx-auto">
                <QrCode className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-white font-['Outfit']">Executive Airport Lounge Digital Pass</h3>
              <p className="text-xs text-slate-300">
                Scan this boarding pass QR code at any major international terminal lounge for complimentary VIP entry.
              </p>
              <div className="p-4 bg-white rounded-2xl max-w-[200px] mx-auto border-4 border-amber-400">
                <QrCode className="h-40 w-40 text-slate-950 mx-auto" />
              </div>
              <p className="text-[11px] font-mono text-amber-300 uppercase tracking-widest">
                MEMBER ID: VIP-AERORANA-88921
              </p>
              <Button onClick={() => setShowLoungeModal(false)} size="sm" variant="outline" className="w-full border-amber-500/40 text-amber-300">
                Close Pass
              </Button>
            </Card>
          </div>
        )}

        {/* Upcoming Trips List */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Your Upcoming VIP Itineraries</h2>
            <Link to="/dashboard/bookings" className="text-sm font-semibold text-amber-400 hover:underline">
              View All Reservations
            </Link>
          </div>

          {isLoading ? (
            <div className="h-32 bg-slate-900 rounded-2xl animate-pulse" />
          ) : upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingBookings.map((booking) => {
                const flight = booking.flight;
                if (!flight) return null;
                return (
                  <Card
                    key={booking._id}
                    className="p-6 bg-slate-900 border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer"
                    onClick={() => navigate('/dashboard/bookings')}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-amber-300 font-bold uppercase">
                          Ref: {booking.bookingRef} (VIP Priority)
                        </span>
                        <Badge variant="success">Confirmed</Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-left">
                          <p className="text-lg font-black text-white">{flight.origin?.code}</p>
                          <p className="text-[10px] text-slate-400">{flight.origin?.city}</p>
                        </div>
                        <div className="flex flex-col items-center flex-1 px-4 text-xs text-slate-400">
                          <span>{formatDate(flight.flightDate)}</span>
                          <div className="h-[1px] w-full bg-amber-500/20 my-1" />
                          <span className="text-amber-300 font-bold">{formatTime(flight.departureTime)}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-white">{flight.destination?.code}</p>
                          <p className="text-[10px] text-slate-400">{flight.destination?.city}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-900/40 border border-amber-500/20 rounded-2xl text-sm text-slate-400">
              No upcoming VIP flights booked yet. Explore our flight routes to book your next journey!
            </div>
          )}
        </section>
      </div>
    );
  }

  // ==========================================
  // 3. STANDARD PASSENGER DASHBOARD VIEW
  // ==========================================
  return (
    <div className="space-y-8">
      {/* Standard Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-cyan-500/10">
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 uppercase tracking-widest">
            AeroRana Passenger Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-['Outfit']">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">{user?.firstName || 'Passenger'}</span>!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage your flight itineraries, inspect digital boarding passes, and upgrade to VIP membership.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/flights">
              <Button size="sm" className="font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">
                Book Next Flight <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upgrade to VIP Premium Banner */}
      <section className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Crown className="h-4 w-4 text-amber-400" /> Unlock Executive VIP Perks
          </div>
          <h3 className="text-lg font-black text-white font-['Outfit']">Upgrade to Executive VIP Membership</h3>
          <p className="text-xs text-slate-300 max-w-lg">
            Get 15% flight discounts, complimentary airport lounge access, priority express boarding, and 24/7 concierge support.
          </p>
        </div>
        <Button
          onClick={handleUpgradeVIP}
          disabled={upgrading}
          className="font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/20 whitespace-nowrap"
        >
          {upgrading ? 'Upgrading...' : 'Upgrade to VIP (Instant)'}
        </Button>
      </section>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-900/90 border-slate-800 shadow-md flex items-center gap-4 hover:border-cyan-500/30 transition-all">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-black text-white font-['Outfit']">{bookings?.length || 0}</p>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900/90 border-slate-800 shadow-md flex items-center gap-4 hover:border-emerald-500/30 transition-all">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Upcoming Trips</p>
            <p className="text-2xl font-black text-white font-['Outfit']">{upcomingBookings.length}</p>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900/90 border-slate-800 shadow-md flex items-center gap-4 hover:border-indigo-500/30 transition-all">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account Status</p>
            <p className="text-lg font-bold text-white capitalize">Standard Member</p>
          </div>
        </Card>
      </section>

      {/* Upcoming Trips List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Upcoming Flights</h2>
          <Link to="/dashboard/bookings" className="text-sm font-semibold text-cyan-400 hover:underline">
            View All Bookings
          </Link>
        </div>

        {isLoading ? (
          <div className="h-32 bg-slate-900 rounded-2xl animate-pulse" />
        ) : upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingBookings.map((booking) => {
              const flight = booking.flight;
              if (!flight) return null;
              return (
                <Card
                  key={booking._id}
                  className="p-6 bg-slate-900 border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
                  onClick={() => navigate('/dashboard/bookings')}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-semibold uppercase">
                        Ref: {booking.bookingRef}
                      </span>
                      <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-left">
                        <p className="text-base font-bold text-white">{flight.origin?.code}</p>
                        <p className="text-[10px] text-slate-400">{flight.origin?.city}</p>
                      </div>
                      <div className="flex flex-col items-center flex-1 px-4 text-xs text-slate-400">
                        <span>{formatDate(flight.flightDate)}</span>
                        <div className="h-[1px] w-full bg-slate-800 my-1" />
                        <span>{formatTime(flight.departureTime)}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-white">{flight.destination?.code}</p>
                        <p className="text-[10px] text-slate-400">{flight.destination?.city}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-900/30 border border-slate-800 rounded-2xl text-sm text-slate-500">
            No upcoming trips booked yet. Find your next flight route!
          </div>
        )}
      </section>
    </div>
  );
};
