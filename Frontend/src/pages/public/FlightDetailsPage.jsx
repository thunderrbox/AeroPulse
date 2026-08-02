import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFlightById } from '../../store/slices/flightSlice';
import { createBooking } from '../../store/slices/bookingSlice';
import { useAuth } from '../../hooks/useAuth';
import { Plane,  Users, ShieldAlert, Wifi, Utensils, ArrowLeft, Plus, Trash2, CreditCard, LayoutGrid } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice, formatTime, formatDate } from '../../utils';
import toast from 'react-hot-toast';
import { SeatSelectionModal } from '../../components/booking/SeatSelectionModal';


// This page is displayed after we click the "Book Flight" button on seach flight page

export const FlightDetailsPage = () => {
  const { id } = useParams();   //for reading route parameters
  const [searchParams] = useSearchParams(); //for reading query parameters
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { selectedFlight, isLoading } = useSelector((state) => state.flights);
  const bookingState = useSelector((state) => state.bookings);

  // selected seat class and passengers list
  const [seatClass, setSeatClass] = useState(searchParams.get('class') || 'economy');
  const [passengers, setPassengers] = useState([
    { firstName: '', lastName: '', age: '', passportNumber: '', nationality: '', seatClass: seatClass, seatNumber: '05A' },
  ]);  //passengers list is an array of objects
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

  // payment mock details
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    dispatch(getFlightById(id));
  }, [dispatch, id]);

  // this function will sync the passengers info with their selected cabin class
  useEffect(() => {
    setPassengers((prev) => prev.map((p) => ({ ...p, seatClass })));
  }, [seatClass]);

  if (isLoading || !selectedFlight) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const basePrice = seatClass === 'business' ? selectedFlight.seats.business.price : selectedFlight.seats.economy.price;
  const totalPrice = basePrice * passengers.length;

  const handleAddPassenger = () => {
    setPassengers([
      ...passengers,
      { firstName: '', lastName: '', age: '', passportNumber: '', nationality: '', seatClass },
    ]);
  };

  const handleRemovePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(( _ , idx) => idx !== index));
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to complete your booking.');
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });  //here we are navigating the user to the login page ,but also making sure to record the location where he desired to be so that we can redirect him to that page after he logs in
      return;
    }

    // validation
    const invalidPassenger = passengers.some(
      (p) => !p.firstName || !p.lastName || !p.age || !p.passportNumber || !p.nationality
    );

    if (invalidPassenger || !contactEmail || !contactPhone) {
      toast.error('Please fill in all passenger details and contact info.');
      return;
    }

    //converting the form data into clean api data
    const bookingData = {
      flightId: selectedFlight._id,
      passengers: passengers.map((p, idx) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        age: parseInt(p.age),
        passportNumber: p.passportNumber,
        nationality: p.nationality,
        seatClass: p.seatClass,
        seatNumber: p.seatNumber || `${idx + 5}A`,
      })),
      seatClass,
      payment: {
        method: paymentMethod,
        last4: '4242',  //dummy data
      },
      contactEmail,
      contactPhone,
    };

    const resultAction = await dispatch(createBooking(bookingData));

    if (createBooking.fulfilled.match(resultAction)) {
      toast.success('Flight booked successfully!');
      navigate('/dashboard/bookings');
    } else {
      toast.error(resultAction.payload?.message || 'Failed to book flight');
    }
  };

  return (
    <div className="skyway-container space-y-8 pb-16 pt-8">
      {/* header back button */}
      <button
        onClick={() => navigate(-1)}
        className=" cursor-pointer flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Search
      </button>

      {/* flight information panel */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                {selectedFlight.airline}
              </span>
              <span className="text-xs font-mono text-slate-400">{selectedFlight.flightNumber}</span>
              <Badge variant="success">Scheduled</Badge>
            </div>
            <h1 className="text-xl font-bold">
              {selectedFlight.origin.city} ({selectedFlight.origin.code}) to {selectedFlight.destination.city} ({selectedFlight.destination.code})
            </h1>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-slate-400">Departure Date</p>
            <p className="text-sm font-bold">{formatDate(selectedFlight.flightDate)}</p>
          </div>
        </div>

        {/* timeline details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Departure</p>
            <p className="text-lg font-bold text-slate-950 dark:text-white">{formatTime(selectedFlight.departureTime)}</p>
            <p className="font-semibold text-slate-600 dark:text-slate-400">{selectedFlight.origin.airport}</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-400 font-semibold">{selectedFlight.duration} minutes</span>
            <div className="relative w-full flex items-center justify-center py-2 max-w-[200px]">
              <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-800" />
              <Plane className="absolute h-4 w-4 text-primary-500 rotate-90" />
            </div>
            <span className="text-xs font-semibold text-slate-500">{selectedFlight.stops === 0 ? 'Non-stop' : `${selectedFlight.stops} Stops`}</span>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Arrival</p>
            <p className="text-lg font-bold text-slate-950 dark:text-white">{formatTime(selectedFlight.arrivalTime)}</p>
            <p className="font-semibold text-slate-600 dark:text-slate-400">{selectedFlight.destination.airport}</p>
          </div>
        </div>

        {/* amenities and aircraft */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Badge variant="secondary">Aircraft: {selectedFlight.aircraft}</Badge>
          {selectedFlight.amenities?.wifi && (
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Wifi className="h-3.5 w-3.5" /> High-speed Wi-Fi
            </span>
          )}
          {selectedFlight.amenities?.meals && (
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Utensils className="h-3.5 w-3.5" /> In-flight Meals
            </span>
          )}
        </div>
      </Card>

      {/* booking form layout */}
      <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">

        {/* left column: passenger details */}
        <div className="w-full lg:w-2/3 space-y-6">
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Cabin Class Selection */}
            <Card className="p-6 bg-slate-200 dark:bg-slate-900 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold mb-4">1. Select Cabin Class</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSeatClass('economy')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    seatClass === 'economy'
                      ? 'border-primary-500 bg-primary-50/20'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                  }`}
                >
                  <p className="font-bold">Economy Class</p>
                  <p className="text-xs text-slate-400 mt-1">{selectedFlight.seats.economy.available} seats left</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                    {formatPrice(selectedFlight.seats.economy.price)}
                  </p>
                </div>

                <div
                  onClick={() => setSeatClass('business')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    seatClass === 'business'
                      ? 'border-primary-500 bg-primary-50/20'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                  }`}
                >
                  <p className="font-bold">Business Class</p>
                  <p className="text-xs text-slate-400 mt-1">{selectedFlight.seats.business.available} seats left</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                    {formatPrice(selectedFlight.seats.business.price)}
                  </p>
                </div>
              </div>
            </Card>

            {/* passenger forms */}
            <Card className="p-6 bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-3">
                <h3 className="text-base font-bold flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-sky-400" /> 2. Passenger Information & Seats
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setIsSeatModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
                  >
                    <LayoutGrid className="h-4 w-4" /> Pick Cabin Seats
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddPassenger}
                    variant="outline"
                    size="sm"
                    icon={Plus}
                  >
                    Add Passenger
                  </Button>
                </div>
              </div>

              {passengers.map((passenger, idx) => (
                <div key={idx} className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold dark:text-slate-500 text-blue-950 uppercase tracking-wider">Passenger #{idx + 1}</span>
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePassenger(idx)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-blue-950 dark:text-slate-400 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(idx, 'firstName', e.target.value)}
                        className="w-full  dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-950 dark:text-slate-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(idx, 'lastName', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Your surname"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-blue-950 dark:text-slate-400 mb-1">Age</label>
                      <input
                        type="number"
                        required
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="30"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-blue-950 dark:text-slate-400 mb-1">Passport Number</label>
                      <input
                        type="text"
                        required
                        value={passenger.passportNumber}
                        onChange={(e) => handlePassengerChange(idx, 'passportNumber', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="A1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-blue-950 dark:text-slate-400 mb-1">Nationality</label>
                    <input
                      type="text"
                      required
                      value={passenger.nationality}
                      onChange={(e) => handlePassengerChange(idx, 'nationality', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Indian"
                    />
                  </div>
                </div>
              ))}
            </Card>

            {/* contact details and mock payment */}
            <Card className="p-6 bg-slate-200 dark:bg-slate-900 border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold border-b border-slate-100 dark:border-slate-800 pb-3">
                3. Contact & Payment Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-950 dark:text-slate-400 mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-950 dark:text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Payment Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    Credit / Debit Card
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    Net Banking
                  </label>
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* right column: pricing summary sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg sticky top-24">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              Price Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Base Fare ({passengers.length} Passenger{passengers.length > 1 ? 's' : ''})</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{formatPrice(basePrice * passengers.length)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Seat Class</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100 capitalize">{seatClass}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Taxes & Fees</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>

              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-4" />

              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <Button
              onClick={handleBookingSubmit}
              className="w-full justify-center mt-6 h-11 text-sm font-bold gap-2 shadow-lg shadow-primary-500/20"
              isLoading={bookingState.isLoading}
            >
              <CreditCard className="h-4 w-4" /> Complete Booking
            </Button>

            <div className="flex gap-2 items-start mt-4 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 p-2.5 rounded-lg">
              <ShieldAlert className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p>By clicking complete booking, you agree to our policies. Free cancellation available up to 24 hours prior departure.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Interactive Seat Selection Modal */}
      <SeatSelectionModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        seatClass={seatClass}
        passengers={passengers}
        onConfirmSeats={(updatedAssignments) => {
          setPassengers((prev) =>
            prev.map((p, idx) => ({
              ...p,
              seatNumber: updatedAssignments[idx]?.seatNumber || p.seatNumber,
            }))
          );
          toast.success('Seats assigned successfully!');
        }}
      />
    </div>
  );
};
