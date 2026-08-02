import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBookings, updateBookingStatus } from '../../store/slices/adminSlice';
import { Ticket, Search, Edit2, Calendar, User, Plane, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice, formatDate } from '../../utils';
import toast from 'react-hot-toast';

export const BookingManagement = () => {
  const dispatch = useDispatch();
  const { allBookings, isLoading } = useSelector((state) => state.admin);

  // Status edit modal states
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('confirmed');

  const fetchBookings = () => {
    dispatch(fetchAllBookings());
  };

  useEffect(() => {
    fetchBookings();
  }, [dispatch]);

  const handleEditStatus = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedBooking) return;

    const resultAction = await dispatch(
      updateBookingStatus({ id: selectedBooking._id, status: newStatus })
    );

    if (updateBookingStatus.fulfilled.match(resultAction)) {
      toast.success('Booking status updated successfully.');
      setStatusModalOpen(false);
      fetchBookings();
    } else {
      toast.error(resultAction.payload?.message || 'Failed to update booking status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Operations</h1>
          <p className="text-sm text-slate-500">Track passenger reservations and process ticket status updates.</p>
        </div>
        <button
          onClick={fetchBookings}
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
      ) : allBookings?.length > 0 ? (
        <Card className="border-slate-100 dark:border-slate-800">
          <div className="table-responsive-wrapper">
            <table className="w-full text-left border-collapse text-sm min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <th className="px-6 py-4">Booking Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Flight</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="px-6 py-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                    {booking.bookingRef}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{booking.user?.firstName} {booking.user?.lastName}</div>
                    <div className="text-xs text-slate-400">{booking.contactEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{booking.flight?.flightNumber}</div>
                    <div className="text-xs text-slate-400">
                      {booking.flight?.origin?.code} &rarr; {booking.flight?.destination?.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                    {booking.flight?.flightDate ? formatDate(booking.flight.flightDate) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {formatPrice(booking.totalPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'danger'}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStatus(booking)}
                      icon={Edit2}
                    >
                      Status
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 border border-dashed rounded-xl">
          No passenger bookings found on the system.
        </div>
      )}

      {/* Update Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Booking Status"
        footerActions={
          <>
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveStatus}>
              Save Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Updating booking status for reference <strong className="text-slate-800 dark:text-white uppercase font-mono">{selectedBooking?.bookingRef}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Select Booking Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
