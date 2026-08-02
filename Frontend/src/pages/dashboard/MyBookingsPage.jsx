import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyBookings, cancelBooking } from '../../store/slices/bookingSlice';
import { Plane, Calendar, Users, Ticket, AlertCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice, formatDate, formatTime } from '../../utils';
import toast from 'react-hot-toast';

export const MyBookingsPage = () => {
  const dispatch = useDispatch();
  const { bookings, isLoading } = useSelector((state) => state.bookings);

  // Active filter tab
  const [activeTab, setActiveTab] = useState('all');

  // Cancel booking modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Plan changed');

  useEffect(() => {
    dispatch(getMyBookings());
  }, [dispatch]);

  const handleCancelClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;

    const resultAction = await dispatch(
      cancelBooking({ id: selectedBookingId, reason: cancelReason })
    );

    if (cancelBooking.fulfilled.match(resultAction)) {
      toast.success('Booking cancelled successfully.');
      setCancelModalOpen(false);
      setSelectedBookingId(null);
      dispatch(getMyBookings());
    } else {
      toast.error(resultAction.payload?.message || 'Failed to cancel booking.');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredBookings = bookings?.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-sm text-slate-500">Track and manage your flight itineraries.</p>
        </div>
        <button
          onClick={() => dispatch(getMyBookings())}
          className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-[2px] transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map((booking) => {
            const flight = booking.flight;
            if (!flight) return null;

            return (
              <Card
                key={booking._id}
                className="relative overflow-hidden p-6 bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border-cyan-500/20 shadow-xl rounded-2xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-cyan-500/10 group"
              >
                {/* Decorative background glow */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all" />

                <div className="relative space-y-6">
                  {/* Top bar info */}
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5 font-mono bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-lg text-cyan-300 font-bold uppercase tracking-wider text-xs">
                        <Ticket className="h-3.5 w-3.5" />
                        PNR: {booking.bookingRef}
                      </span>
                      <span className="text-slate-700">|</span>
                      <span className="text-slate-300 font-medium text-xs sm:text-sm">{formatDate(flight.flightDate)}</span>
                      <span className="text-slate-700">|</span>
                      <span className="text-amber-400 font-semibold text-xs">{flight.airline || 'AeroRana Express'}</span>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'danger'}>
                      {booking.status}
                    </Badge>
                  </div>

                  {/* Flight layout */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center justify-between gap-2 sm:gap-6 w-full md:w-auto md:flex-1">
                      <div className="flex-1">
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-0.5">Origin</p>
                        <p className="text-2xl font-black text-white font-['Outfit']">{formatTime(flight.departureTime)}</p>
                        <p className="text-sm font-bold text-slate-200">{flight.origin?.city} <span className="text-slate-400 font-normal">({flight.origin?.code})</span></p>
                      </div>

                      <div className="flex flex-col items-center flex-[2] text-center max-w-[160px]">
                        <span className="text-xs text-slate-400 font-medium">{flight.duration || 120} mins</span>
                        <div className="relative w-full flex items-center justify-center py-2">
                          <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500/20 via-cyan-400 to-cyan-500/20" />
                          <Plane className="absolute h-5 w-5 text-cyan-400 transform -rotate-12 bg-slate-900 px-0.5" />
                        </div>
                        <span className="text-[11px] font-semibold text-cyan-400/90">{flight.stops === 0 ? 'Direct Flight' : `${flight.stops} Stop(s)`}</span>
                      </div>

                      <div className="flex-1 text-right">
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-0.5">Destination</p>
                        <p className="text-2xl font-black text-white font-['Outfit']">{formatTime(flight.arrivalTime)}</p>
                        <p className="text-sm font-bold text-slate-200">{flight.destination?.city} <span className="text-slate-400 font-normal">({flight.destination?.code})</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Passengers & digital barcode stub */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Users className="h-4 w-4 text-cyan-400" />
                        Passengers
                      </h4>
                      <ul className="flex flex-wrap gap-2 text-xs">
                        {booking.passengers?.map((p, idx) => (
                          <li key={idx} className="bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-md text-slate-300 font-semibold">
                            {p.firstName} {p.lastName} <span className="text-cyan-400">({p.seatClass})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Amount</p>
                        <p className="text-xl font-black text-white font-['Outfit']">{formatPrice(booking.totalPrice)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelClick(booking._id)}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No bookings found"
          description={activeTab === 'all' ? 'You have no bookings on record yet.' : `You have no ${activeTab} bookings.`}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Reservation"
        footerActions={
          <>
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 p-3 rounded-xl text-sm font-semibold">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>Warning: This action cannot be undone. Refund is subject to ticket class conditions.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Reason for Cancellation</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Plan changed">Plan changed</option>
              <option value="Found better flight option">Found better flight option</option>
              <option value="Personal emergency">Personal emergency</option>
              <option value="Duplicate booking">Duplicate booking</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
