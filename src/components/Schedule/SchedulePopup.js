import React, { useState } from "react";
import { DateRangePicker } from "@mui/x-date-pickers/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "@mui/x-date-pickers-pro/dist/x-date-pickers.css"; // Updated CSS import

const SchedulePopup = ({ onClose }) => {
  const [dateRange, setDateRange] = useState([null, null]);

  const handleConfirm = () => {
    const [start, end] = dateRange;
    if (start && end) {
      alert(`Selected Range: ${start.format("YYYY-MM-DD")} - ${end.format("YYYY-MM-DD")}`);
    } else {
      alert("Please select a date range.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Schedule Dates</h2>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangePicker
            value={dateRange}
            onChange={(newRange) => setDateRange(newRange)}
            renderInput={(startProps, endProps) => (
              <div className="flex gap-2">
                <input
                  {...startProps.inputProps}
                  ref={startProps.inputRef}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  placeholder="Start date"
                />
                <input
                  {...endProps.inputProps}
                  ref={endProps.inputRef}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  placeholder="End date"
                />
              </div>
            )}
          />
        </LocalizationProvider>
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={handleConfirm}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 ml-2"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePopup;
