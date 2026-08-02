import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchFlights } from '../../store/slices/flightSlice';
import { flightService } from '../../services/flightService';
import { Plane, Plus, Edit, Trash, AlertTriangle, ToggleLeft, ToggleRight, Calendar, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { AIRPORTS } from '../../constants';
import { formatPrice, formatDate, formatTime } from '../../utils';
import toast from 'react-hot-toast';

export const FlightManagement = () => {
  const dispatch = useDispatch();
  const { flights, isLoading } = useSelector((state) => state.flights);

  // Modal states
  const [flightModalOpen, setFlightModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const initialFormState = {
    flightNumber: '',
    airline: 'SkyWay Airways',
    origin: { code: 'DEL', city: 'New Delhi', airport: 'Indira Gandhi International Airport', country: 'India' },
    destination: { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' },
    flightDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    departureTime: '10:00',
    arrivalTime: '12:00',
    duration: 120,
    aircraft: 'Boeing 737-800',
    stops: 0,
    seats: {
      economy: { total: 150, price: 5000 },
      business: { total: 20, price: 15000 },
    },
    amenities: { wifi: true, meals: true },
    isFeatured: false,
    status: 'scheduled',
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch flights
  const fetchAllFlights = () => {
    dispatch(searchFlights({ limit: 100 })); // Fetch all flights for table list
  };

  useEffect(() => {
    fetchAllFlights();
  }, [dispatch]);

  const handleOpenCreateModal = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setSelectedFlight(null);
    setFlightModalOpen(true);
  };

  const handleOpenEditModal = (flight) => {
    setSelectedFlight(flight);
    setFormData({
      ...flight,
      flightDate: flight.flightDate ? new Date(flight.flightDate).toISOString().split('T')[0] : '',
    });
    setIsEditMode(true);
    setFlightModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await flightService.updateFlight(selectedFlight._id, formData);
        toast.success('Flight updated successfully.');
      } else {
        await flightService.createFlight(formData);
        toast.success('Flight created successfully.');
      }
      setFlightModalOpen(false);
      fetchAllFlights();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save flight details.');
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await flightService.deleteFlight(flightId);
        toast.success('Flight deleted successfully.');
        fetchAllFlights();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete flight.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flight Schedules</h1>
          <p className="text-sm text-slate-500">Manage schedules, pricing and cabin seats.</p>
        </div>
        <Button onClick={handleOpenCreateModal} icon={Plus} className="w-full sm:w-auto justify-center">
          Add New Flight
        </Button>
      </div>

      {/* Flight Schedules Table */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : flights?.length > 0 ? (
        <Card className="border-slate-100 dark:border-slate-800">
          <div className="table-responsive-wrapper">
            <table className="w-full text-left border-collapse text-sm min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <th className="px-6 py-4">Flight</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">Economy Price</th>
                <th className="px-6 py-4">Business Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {flights.map((flight) => (
                <tr key={flight._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="px-6 py-4 font-semibold">
                    <div>{flight.flightNumber}</div>
                    <div className="text-xs text-slate-400 font-normal">{flight.airline}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                    {flight.origin?.code} &rarr; {flight.destination?.code}
                  </td>
                  <td className="px-6 py-4">
                    <div>{formatDate(flight.flightDate)}</div>
                    <div className="text-xs text-slate-400">{formatTime(flight.departureTime)}</div>
                  </td>
                  <td className="px-6 py-4 font-bold">{formatPrice(flight.seats?.economy?.price)}</td>
                  <td className="px-6 py-4 font-bold">{formatPrice(flight.seats?.business?.price)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={flight.status === 'scheduled' ? 'success' : flight.status === 'delayed' ? 'warning' : 'danger'}>
                      {flight.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(flight)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <Edit className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFlight(flight._id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-950 border border-dashed rounded-xl">
          No flight schedules available. Click Add New Flight to create one.
        </div>
      )}

      {/* Create / Edit Flight Modal */}
      <Modal
        isOpen={flightModalOpen}
        onClose={() => setFlightModalOpen(false)}
        title={isEditMode ? 'Modify Flight Schedule' : 'Create Flight Schedule'}
        size="lg"
        footerActions={
          <>
            <Button variant="outline" size="sm" onClick={() => setFlightModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleFormSubmit}>
              Save Flight Details
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Flight Number</label>
              <input
                type="text"
                required
                value={formData.flightNumber}
                onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                placeholder="SK102"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Airline</label>
              <input
                type="text"
                required
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Origin City (Airport Code)</label>
              <select
                value={formData.origin.code}
                onChange={(e) => {
                  const port = AIRPORTS.find((a) => a.code === e.target.value);
                  setFormData({
                    ...formData,
                    origin: { code: port.code, city: port.city, airport: `${port.city} Airport`, country: port.country },
                  });
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Destination City (Airport Code)</label>
              <select
                value={formData.destination.code}
                onChange={(e) => {
                  const port = AIRPORTS.find((a) => a.code === e.target.value);
                  setFormData({
                    ...formData,
                    destination: { code: port.code, city: port.city, airport: `${port.city} Airport`, country: port.country },
                  });
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.flightDate}
                onChange={(e) => setFormData({ ...formData, flightDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Departure</label>
              <input
                type="time"
                required
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Arrival</label>
              <input
                type="time"
                required
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Economy Class Price (INR)</label>
              <input
                type="number"
                required
                value={formData.seats.economy.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seats: {
                      ...formData.seats,
                      economy: { ...formData.seats.economy, price: Number(e.target.value) },
                    },
                  })
                }
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Business Class Price (INR)</label>
              <input
                type="number"
                required
                value={formData.seats.business.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seats: {
                      ...formData.seats,
                      business: { ...formData.seats.business, price: Number(e.target.value) },
                    },
                  })
                }
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Aircraft</label>
              <input
                type="text"
                required
                value={formData.aircraft}
                onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="scheduled">Scheduled</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
