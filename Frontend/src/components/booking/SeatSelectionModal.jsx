import React, { useState } from 'react';
import { X, Check, Info } from 'lucide-react';
import { Button } from '../ui/Button';

export const SeatSelectionModal = ({ isOpen, onClose, seatClass, passengers, onConfirmSeats }) => {
  if (!isOpen) return null;

  // Initial mock occupied seats
  const occupiedSeats = ['01A', '02F', '05C', '06D', '09A', '10B', '12E', '14F'];

  const rows = seatClass === 'business' ? [1, 2, 3, 4] : [5, 6, 7, 8, 9, 10, 11, 12, 14, 15];
  const columns = seatClass === 'business' ? ['A', 'B', 'E', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'];

  const [assignments, setAssignments] = useState(
    passengers.map((p, idx) => ({
      passengerName: `${p.firstName || `Passenger ${idx + 1}`} ${p.lastName || ''}`.trim(),
      seatNumber: p.seatNumber || `${rows[idx % rows.length]}${columns[idx % columns.length]}`,
    }))
  );

  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  const handleSeatClick = (seatCode) => {
    if (occupiedSeats.includes(seatCode)) return;

    // Check if assigned to another passenger
    const existingIndex = assignments.findIndex((a) => a.seatNumber === seatCode);
    if (existingIndex !== -1 && existingIndex !== activePassengerIndex) return;

    const updated = [...assignments];
    updated[activePassengerIndex].seatNumber = seatCode;
    setAssignments(updated);
  };

  const handleSave = () => {
    onConfirmSeats(assignments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white font-['Outfit']">Interactive Seat Selection</h3>
            <p className="text-xs text-slate-400">Choose preferred cabin seats for your passengers ({seatClass.toUpperCase()} Class)</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Passenger selector tabs */}
        <div className="flex flex-wrap gap-2">
          {assignments.map((assignment, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePassengerIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activePassengerIndex === idx
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{assignment.passengerName}</span>
              <span className="bg-slate-900/60 px-2 py-0.5 rounded font-mono text-[11px] text-white">
                {assignment.seatNumber}
              </span>
            </button>
          ))}
        </div>

        {/* Seat Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-slate-800 border border-slate-700" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-sky-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">✓</span>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-slate-950 border border-slate-800 opacity-40 cursor-not-allowed" />
            <span>Occupied</span>
          </div>
        </div>

        {/* Cabin Visualizer */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center space-y-4">
          <div className="w-full text-center py-2 border-b border-dashed border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-400">
            Cockpit / Front of Aircraft
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-4">
                <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">{row}</span>

                <div className="flex items-center gap-2">
                  {columns.map((col, cIdx) => {
                    const seatCode = `${row < 10 ? `0${row}` : row}${col}`;
                    const isOccupied = occupiedSeats.includes(seatCode);
                    const isSelectedByCurrent = assignments[activePassengerIndex]?.seatNumber === seatCode;
                    const isSelectedByOther = assignments.some((a, idx) => idx !== activePassengerIndex && a.seatNumber === seatCode);

                    return (
                      <React.Fragment key={col}>
                        {/* Aisle gap */}
                        {cIdx === columns.length / 2 && <div className="w-6 text-center text-[10px] text-slate-400">AISLE</div>}

                        <button
                          type="button"
                          disabled={isOccupied || isSelectedByOther}
                          onClick={() => handleSeatClick(seatCode)}
                          className={`h-9 w-9 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center ${
                            isSelectedByCurrent
                              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 scale-105'
                              : isSelectedByOther
                              ? 'bg-amber-500/30 border border-amber-500/40 text-amber-300 cursor-not-allowed'
                              : isOccupied
                              ? 'bg-slate-900 border border-slate-800 text-slate-700 cursor-not-allowed opacity-50'
                              : 'bg-slate-800 border border-slate-700 text-slate-200 hover:border-sky-500 hover:bg-slate-700 cursor-pointer'
                          }`}
                        >
                          {col}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-400">
            Selected Seat: <strong className="text-sky-400 font-mono">{assignments[activePassengerIndex]?.seatNumber}</strong>
          </p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave} className="bg-sky-500 text-slate-950 font-bold hover:bg-sky-400">
              Confirm Seat Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
