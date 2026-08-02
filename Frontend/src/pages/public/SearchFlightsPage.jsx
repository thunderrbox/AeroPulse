import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchFlights } from '../../store/slices/flightSlice';
import { AIRPORTS } from '../../constants';
import { Plane, Search,  ChevronLeft, ChevronRight, Sliders} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatPrice, formatTime } from '../../utils';

// This page will be displayed when we click the search flight button on landing page

export const SearchFlightsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { flights, pagination, isLoading } = useSelector((state) => state.flights);

  // search parameters state

  //api/flights?origin=DEL&destination=BOM&date=2026-06-26&seatClass=economy&passengers=1&page=1&limit=5&sort=price_asc
  const [origin, setOrigin] = useState(searchParams.get('origin') || 'DEL');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'BOM');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [seatClass, setSeatClass] = useState(searchParams.get('seatClass') || 'economy');

  // filter state
  const [stops, setStops] = useState(searchParams.get('stops') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'seats.economy.price');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

//these are filters which are optional so we will include them after performing a check
  const buildSortParam = (field, order) => {
    if (field.includes('price')) {
      return order === 'desc' ? 'price_desc' : 'price_asc';
    }
    if (field === 'duration') return 'duration';
    return 'departureTime';
  };

  // trigger search flights
  const executeSearch = () => {
    const params = {
      origin: searchParams.get('origin') || origin,
      destination: searchParams.get('destination') || destination,
      date: searchParams.get('date') || date,
      seatClass: searchParams.get('seatClass') || seatClass,
      passengers: searchParams.get('passengers') || 1,
      page: parseInt(searchParams.get('page') || String(page)),
      limit: 5,
      sort: buildSortParam(
        searchParams.get('sortBy') || sortBy,    //price
        searchParams.get('sortOrder') || sortOrder  //departure time
      ), 
    };

    const stopsParam = searchParams.get('stops') ?? stops;
    const minPriceParam = searchParams.get('minPrice') ?? minPrice;
    const maxPriceParam = searchParams.get('maxPrice') ?? maxPrice;

    //converting it into number as url passes data in the form of string
    if (stopsParam !== '') params.stops = Number(stopsParam);
    if (minPriceParam !== '') params.minPrice = Number(minPriceParam);
    if (maxPriceParam !== '') params.maxPrice = Number(maxPriceParam);

    dispatch(searchFlights(params));
  };

  useEffect(() => {
    executeSearch();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateQueryParams({ origin, destination, date, seatClass, page: 1 });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateQueryParams({ stops, minPrice, maxPrice, sortBy, sortOrder, page: 1 });
  };

  //this query saves the existing params
  const updateQueryParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());  //converting current params values into proper json format
    const merged = { ...current, ...newParams };  //inserting the new params into existing ones
    // remove empty parameters
    Object.keys(merged).forEach((key) => {
      if (merged[key] === '' || merged[key] === undefined || merged[key] === null) {
        delete merged[key];
      }
    });
    setSearchParams(merged);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.pages) {
      setPage(newPage);
      updateQueryParams({ page: newPage });
    }
  };

  return (
    <div className="skyway-container space-y-8 pb-16 pt-8">
      {/* search header */}

      <Card className="p-6 bg-slate-300 dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-md">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

          {/* from */}
          <div>
            <label className="block text-xs font-bold dark:text-slate-400 text-blue-950 uppercase tracking-wider mb-2">From</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {AIRPORTS.map((airport) => (
                <option key={airport.code} value={airport.code}>{airport.city} ({airport.code})</option>
              ))}
            </select>
          </div>

        {/*to */}
          <div>
            <label className="block text-xs font-bold dark:text-slate-400 text-blue-950 uppercase tracking-wider mb-2">To</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {AIRPORTS.map((airport) => (
                <option key={airport.code} value={airport.code}>{airport.city} ({airport.code})</option>
              ))}
            </select>
          </div>

           {/* date */}
          <div>
            <label className="block text-xs font-bold dark:text-slate-400 text-blue-950 uppercase tracking-wider mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* cabin class */}
          <div>
            <label className="block text-xs font-bold dark:text-slate-400 text-blue-950 uppercase tracking-wider mb-2">Cabin Class</label>
            <select
              value={seatClass}
              onChange={(e) => setSeatClass(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </select>
          </div>


         <button type="submit" className="w-full flex justify-center items-center h-11 bg-cyan-700 hover:bg-cyan-800 rounded-md cursor-pointer text-white text-xs font-bold py-2 ">
            <Search className="h-4 w-4" /> Search Again
          </button>
        </form>
      </Card>



      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* filters sidebar */}

        <Card className="w-full lg:w-1/4 p-6 bg-slate-300 dark:bg-slate-900 border-blue-500 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="h-5 w-5 dark:text-slate-400 text-white" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Filters & Sort</h3>
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-5">
            {/* sort options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold dark:text-slate-400 text-primary-700 uppercase tracking-wider">Sort Flights By</label>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(':');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="cursor-pointer w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="seats.economy.price:asc">Price: Low to High</option>
                <option value="seats.economy.price:desc">Price: High to Low</option>
                <option value="departureTime:asc">Departure: Early first</option>
                <option value="departureTime:desc">Departure: Late first</option>
                <option value="duration:asc">Shortest duration</option>
              </select>
            </div>

            {/* stops filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold dark:text-slate-400 text-primary-700 uppercase tracking-wider">Stops</label>
              <select
                value={stops}
                onChange={(e) => setStops(e.target.value)}
                className="cursor-pointer w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any stops</option>
                <option value="0">Non-stop (Direct)</option>
                <option value="1">1 Stop</option>
                <option value="2">2 Stops</option>
              </select>
            </div>


            {/* price limits */}
            <div className="space-y-2">
              <label className="block text-xs font-bold dark:text-slate-400  text-primary-700 uppercase tracking-wider">Price Limits (INR)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <button type="submit" className="w-full h-11 bg-cyan-700 hover:bg-cyan-800 rounded-md cursor-pointer text-white text-xs font-bold py-2 justify-center">
              Apply Filters
            </button>
          </form>
        </Card>

        {/* results list */}
        <div className="w-full  lg:w-3/4 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-slate-300 dark:bg-slate-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : flights?.length > 0 ? (
            <>
              {flights.map((flight) => {
                const seatInfo = seatClass === 'business' ? flight.seats.business : flight.seats.economy;
                return (
                  <Card
                    key={flight._id}
                    className="p-6 bg-slate-900/90 border border-slate-800/90 shadow-lg hover:border-sky-500/40 hover:shadow-sky-500/10 transition-all duration-300 rounded-2xl group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* flight details info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold bg-slate-800 border border-slate-700 px-3 py-1 rounded-md text-slate-200">
                            {flight.airline}
                          </span>
                          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                            {flight.flightNumber}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            ✓ 7kg Cabin + 15kg Baggage Included
                          </span>
                          {flight.status !== 'scheduled' && (
                            <Badge variant={flight.status === 'delayed' ? 'warning' : 'danger'}>
                              {flight.status}
                            </Badge>
                          )}
                        </div>

                        {/* route timeline */}
                        <div className="flex items-center justify-between gap-2 sm:gap-6 max-w-md pt-2">
                          <div>
                            <p className="text-2xl font-black text-white font-['Outfit']">{formatTime(flight.departureTime)}</p>
                            <p className="text-xs font-bold text-slate-300">{flight.origin.code}</p>
                            <p className="text-[11px] text-slate-400">{flight.origin.city}</p>
                          </div>

                          <div className="flex flex-col items-center flex-1">
                            <span className="text-xs text-slate-400 font-medium">{flight.duration || 120} mins</span>
                            <div className="relative w-full flex items-center justify-center py-2">
                              <div className="h-[1px] w-full bg-slate-800" />
                              <Plane className="absolute h-4 w-4 text-sky-400 transform -rotate-12 bg-slate-900 px-0.5" />
                            </div>
                            <span className="text-[10px] font-semibold text-sky-400">{flight.stops === 0 ? 'Direct Non-stop' : `${flight.stops} Stop(s)`}</span>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-black text-white font-['Outfit']">{formatTime(flight.arrivalTime)}</p>
                            <p className="text-xs font-bold text-slate-300">{flight.destination.code}</p>
                            <p className="text-[11px] text-slate-400">{flight.destination.city}</p>
                          </div>
                        </div>
                      </div>

                      {/* pricing and call to action */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:border-l md:border-slate-800 md:pl-6 min-w-[170px]">
                        <div className="text-left md:text-right">
                          <p className="text-xs text-slate-400 font-medium capitalize">{seatClass} Class Fare</p>
                          <p className="text-2xl font-black text-white font-['Outfit']">{formatPrice(seatInfo.price)}</p>
                          <p className="text-[11px] font-semibold text-emerald-400">{seatInfo.available} seats left at this price</p>
                        </div>
                        <button
                          onClick={() => navigate(`/flights/${flight._id}?class=${seatClass}`)}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer w-full md:w-auto"
                        >
                          Book Ticket <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* pagination controls */}
              {pagination?.pages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500">
                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total flights)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No flights match your search"
              description="Please check back later or try changing your origin/destination parameters."
              actionLabel="Return Home"
              onAction={() => navigate('/')}
              
            />
          )}
        </div>
      </div>
    </div>
  );
};
