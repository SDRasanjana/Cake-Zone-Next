import React from "react";

type PeriodType = "daily" | "weekly" | "monthly";

interface PeriodDateSelectorProps {
  period: PeriodType;
  selectedDate: string;
  setPeriod: (p: PeriodType) => void;
  setSelectedDate: (d: string) => void;
}

const PeriodDateSelector: React.FC<PeriodDateSelectorProps> = ({
  period,
  selectedDate,
  setPeriod,
  setSelectedDate,
}) => (
  <div className="flex flex-wrap gap-6 items-center mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg shadow-sm">
    <div className="flex flex-col">
      <label htmlFor="period-select" className="font-bold text-orange-700 mb-1">
        Period
      </label>
      <select
        id="period-select"
        value={period}
        onChange={(e) => setPeriod(e.target.value as PeriodType)}
        className="border-2 border-orange-300 rounded px-3 py-2 text-lg font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900"
        title="Select report period"
      >
        <option value="daily" className="text-black">
          Daily
        </option>
        <option value="weekly" className="text-black">
          Weekly
        </option>
        <option value="monthly" className="text-black">
          Monthly
        </option>
      </select>
    </div>
    <div className="flex flex-col">
      <label htmlFor="date-select" className="font-bold text-orange-700 mb-1">
        Reference Date
      </label>
      <input
        id="date-select"
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="border-2 border-orange-300 rounded px-3 py-2 text-lg font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-black"
        title="Select reference date"
      />
    </div>
  </div>
);

export default PeriodDateSelector;
