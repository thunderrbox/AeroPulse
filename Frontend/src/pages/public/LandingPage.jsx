import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {

  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { getFeaturedFlights } from '../../store/slices/flightSlice';
import { AIRPORTS } from '../../constants';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatPrice } from '../../utils';
import { useAuth } from '../../hooks/useAuth';

export const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { featuredFlights, isLoading } = useSelector((state) => state.flights);
  const {isAuthenticated}=useAuth();

  const [searchParams, setSearchParams] = useState({
    origin: 'DEL',
    destination: 'BOM',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],    //current day + 2 days -> 2026-06-25T07:30:00.000Z , split and only get the date part
    passengers: 1,
    seatClass: 'economy',
  });

  useEffect(() => {
    dispatch(getFeaturedFlights());
  }, [dispatch]);

  const updateSearchParam = (key, value) => {
    setSearchParams((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchParams.origin === searchParams.destination) {
      return;
    }

    if(isAuthenticated){
    navigate(`/flights?${new URLSearchParams(searchParams).toString()}`);
    }
    else{
         toast.error('Please log in to search for flights.');
         navigate(`/login`)
    }
  };

  const features = [
    {
      icon: ShieldCheck,
      title: 'Safe and secure',
      description: 'Reliable booking, protected payments, and a smooth travel experience.',
    },
    {
      icon: Award,
      title: 'Premium comfort',
      description: 'Compare travel options clearly and choose the cabin experience that fits you.',
    },
    {
      icon: HeartHandshake,
      title: 'Support when needed',
      description: 'Manage bookings with confidence and get help whenever plans change.',
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 sm:py-24">
        {/* Background Subtle Atmosphere */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-slate-700/80 bg-slate-900/90 px-4 py-1.5 text-xs font-semibold text-sky-400 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Flight Engine by <strong className="text-white font-bold">Abhijeet Singh Rana</strong></span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl font-['Outfit'] leading-[1.08]"
            >
              Fly Smarter.
              <br />
              Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300">AeroPulse</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14 }}
              className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed font-normal"
            >
              Search real-time routes, compare cabin fares with zero hidden charges, and manage instant digital boarding passes on one unified travel platform.
            </motion.p>
          </div>

          {/* ================= REALISTIC FLIGHT SEARCH ENGINE ================= */}
          <motion.form
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            onSubmit={handleSearch}
            className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
          >
            {/* Search Header Controls */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
                  <Plane className="h-5 w-5 transform -rotate-12" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">Search Flights</h3>
                  <p className="text-xs text-slate-400">Compare non-stop & connecting routes worldwide</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Live Fare Engine
                </span>
                <span className="inline-flex items-center gap-1.5 text-sky-400">
                  <ShieldCheck className="h-4 w-4" /> Verified Inventory
                </span>
              </div>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
              {/* Origin */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <PlaneTakeoff className="h-4 w-4 text-sky-400" />
                  Departure Airport
                </label>
                <select
                  value={searchParams.origin}
                  onChange={(e) => updateSearchParam('origin', e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm font-bold text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                >
                  {AIRPORTS.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.city} ({airport.code}) — {airport.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <PlaneLanding className="h-4 w-4 text-sky-400" />
                  Arrival Airport
                </label>
                <select
                  value={searchParams.destination}
                  onChange={(e) => updateSearchParam('destination', e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm font-bold text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                >
                  {AIRPORTS.map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.city} ({airport.code}) — {airport.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Travel Date */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Calendar className="h-4 w-4 text-sky-400" />
                  Travel Date
                </label>
                <input
                  type="date"
                  value={searchParams.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => updateSearchParam('date', e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm font-bold text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>

              {/* Passengers & Cabin */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Users className="h-4 w-4 text-sky-400" />
                  Class & Passengers
                </label>
                <select
                  value={searchParams.seatClass}
                  onChange={(e) => updateSearchParam('seatClass', e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 text-sm font-bold text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                >
                  <option value="economy">Economy Class (Standard)</option>
                  <option value="business">Business Class (Premium)</option>
                </select>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full bg-sky-500 text-slate-950 font-extrabold hover:bg-sky-400 shadow-lg shadow-sky-500/20 transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Find Flights
              </Button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ================= FEATURED ROUTES ================= */}
      <section className="py-16 sm:py-24 bg-slate-950 border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-400">Top Trending Routes</p>
              <h2 className="mt-1 text-2xl sm:text-4xl font-extrabold text-white font-['Outfit']">Featured Daily Schedules</h2>
              <p className="mt-1 text-sm text-slate-400">Verified airline schedules updated live across major regional hubs.</p>
            </div>

            <Link
              to="/flights"
              className="inline-flex items-center gap-2 text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors"
            >
              View Full Route Map <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8">
            {isLoading ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
                ))}
              </div>
            ) : featuredFlights?.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {featuredFlights.slice(0, 4).map((flight) => (
                  <Card
                    key={flight._id}
                    hoverEffect
                    onClick={() => navigate(`/flights/${flight._id}`)}
                    className="cursor-pointer border-slate-800/90 bg-slate-900/90 p-5 shadow-lg hover:border-sky-500/40 hover:shadow-sky-500/10 transition-all rounded-2xl group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-200">
                          {flight.airline}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Available
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-2xl font-black text-white font-['Outfit']">{flight.origin.code}</p>
                          <p className="text-xs text-slate-400 font-medium">{flight.origin.city}</p>
                        </div>

                        <div className="flex flex-col items-center px-2">
                          <Plane className="h-4 w-4 text-sky-400 transform -rotate-12 group-hover:scale-110 transition-transform" />
                          <div className="h-[1px] w-12 bg-slate-700 my-1" />
                          <span className="text-[10px] font-semibold text-slate-400">{flight.stops === 0 ? 'Direct' : `${flight.stops} Stop`}</span>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-black text-white font-['Outfit']">{flight.destination.code}</p>
                          <p className="text-xs text-slate-400 font-medium">{flight.destination.city}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fares From</p>
                          <p className="text-lg font-black text-white font-['Outfit']">{formatPrice(flight.seats.economy.price)}</p>
                        </div>
                        <span className="rounded-lg bg-sky-500/10 p-2 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <p className="text-sm text-slate-400">No featured routes active right now. Browse our full flight catalog.</p>
                <Link to="/flights" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">Explore All Flights</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= HUMAN DESIGN CREATOR SIGNATURE ================= */}
      <section className="py-16 bg-slate-900/80 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-48 w-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-bold text-sky-300 uppercase tracking-widest">
                  Lead Engineering & Product Architecture
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
                  Crafted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-amber-300">Abhijeet Singh Rana</span>
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  AeroPulse is built with an uncompromising focus on humanized UI/UX, transactional reliability, real-time database locks, and executive boarding management.
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-300 pt-2">
                  <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">✓ MERN Architecture</span>
                  <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">✓ JWT Dual Token Auth</span>
                  <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">✓ Real-Time MongoDB Atlas</span>
                  <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">✓ Responsive Tailwind UI</span>
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-8">
                <div className="text-left lg:text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Project Lead</p>
                  <p className="text-lg font-bold text-white">Abhijeet Singh Rana</p>
                  <p className="text-xs text-sky-400">abhijeet@aeropulse.com</p>
                </div>

                <a
                  href="https://github.com/thunderrbox/AeroPulse.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-colors"
                >
                  Inspect Source Code
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST & VALUE PROPOSITION ================= */}
      <section className="py-16 bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};