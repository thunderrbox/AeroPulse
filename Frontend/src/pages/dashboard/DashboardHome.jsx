import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyBookings } from '../../store/slices/bookingSlice';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Ticket, Compass, ShieldAlert, ArrowRight, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatPrice, formatDate, formatTime } from '../../utils';

export const DashboardHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { bookings, isLoading } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(getMyBookings({ limit: 3 }));
  }, [dispatch]);

  const upcomingBookings = bookings?.filter((b) => b.status === 'confirmed' || b.status === 'pending') || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-cyan-500/10">
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 uppercase tracking-widest">
            AeroRana Executive Passenger
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-['Outfit']">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300">{user?.firstName || 'Abhijeet'}</span>!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage your airline itineraries, review boarding passes, and explore premium flight routes crafted for seamless journeys.
          </p>
          <div className="pt-2">
            <Link to="/flights">
              <Button size="sm" className="font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">
                Book Next Flight <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
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
            <p className="text-lg font-bold text-white capitalize">{user?.role || 'Passenger'} Member</p>
          </div>
        </Card>
      </section>

      {/* Upcoming Trips List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Upcoming Flights</h2>
          <Link to="/dashboard/bookings" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
            View All Bookings
          </Link>
        </div>

        {isLoading ? (
          <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse" />
        ) : upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingBookings.map((booking) => {
              const flight = booking.flight;
              if (!flight) return null;
              return (
                <Card
                  key={booking._id}
                  className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate('/dashboard/bookings')}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono bg-slate-50 dark:bg-slate-950 border px-2 py-0.5 rounded text-slate-500 font-semibold uppercase">
                        Ref: {booking.bookingRef}
                      </span>
                      <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-left">
                        <p className="text-base font-bold">{flight.origin?.code}</p>
                        <p className="text-[10px] text-slate-400">{flight.origin?.city}</p>
                      </div>
                      <div className="flex flex-col items-center flex-1 px-4 text-xs text-slate-400">
                        <span>{formatDate(flight.flightDate)}</span>
                        <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800 my-1" />
                        <span>{formatTime(flight.departureTime)}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold">{flight.destination?.code}</p>
                        <p className="text-[10px] text-slate-400">{flight.destination?.city}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800 rounded-2xl text-sm text-slate-500">
            No upcoming trips booked yet. Let's find your next adventure!
          </div>
        )}
      </section>
    </div>
  );
};
