import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, RefreshCcw } from 'lucide-react';

const FilterBar = ({ currentFilters, onFilterChange }) => {
  const [masterData, setMasterData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Filter Data from Backend
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // UPDATED: Removed http://localhost:5000
        const res = await axios.get('/api/filters');
        setMasterData(res.data);
      } catch (err) {
        console.error("Error loading filters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  // === HELPER: Get Unique Options ===
  const getUnique = (items) => [...new Set(items)].filter(Boolean).sort();

  // === CALCULATE VALID OPTIONS (Cascading Logic) ===
  
  // 1. Company Options: Always show all available companies
  const companyOptions = getUnique(masterData.map(d => d.company_code_desc));

  // 2. Location Options: Filter based on selected Company
  const locationOptions = getUnique(
    masterData
      .filter(item => currentFilters.company === "All" || item.company_code_desc === currentFilters.company)
      .map(item => item.loc_name)
  );

  // 3. Department Options: Filter based on selected Company AND Location
  const departmentOptions = getUnique(
    masterData
      .filter(item => {
        const matchCompany = currentFilters.company === "All" || item.company_code_desc === currentFilters.company;
        const matchLocation = currentFilters.location === "All" || item.loc_name === currentFilters.location;
        return matchCompany && matchLocation;
      })
      .map(item => item.psa)
  );

  // === HANDLERS ===
  const handleChange = (field, value) => {
    // Reset dependent filters when a parent filter changes
    let newFilters = { ...currentFilters, [field]: value };
    
    if (field === 'company') {
      newFilters.location = "All";
      newFilters.department = "All";
    } else if (field === 'location') {
      newFilters.department = "All";
    }

    onFilterChange(newFilters);
  };

  const handleReset = () => {
    onFilterChange({ company: "All", location: "All", department: "All" });
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center gap-2 mb-3 text-slate-800">
        <Filter size={16} />
        <span className="text-xs font-extrabold uppercase tracking-wider">Data Filters</span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* COMPANY SELECT */}
        <div className="flex-1">
          {/* Made Label Darker (text-slate-700) */}
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Company</label>
          <div className="relative">
            <select 
              value={currentFilters.company} 
              onChange={(e) => handleChange('company', e.target.value)}
              // Made Text Darker (text-slate-900)
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:ring-2 focus:ring-[#005CA9] outline-none cursor-pointer appearance-none"
              disabled={loading}
            >
              <option value="All">All</option>
              {companyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* LOCATION SELECT */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
          <div className="relative">
            <select 
              value={currentFilters.location} 
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:ring-2 focus:ring-[#005CA9] outline-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 appearance-none"
              disabled={loading || locationOptions.length === 0}
            >
              <option value="All">All</option>
              {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* DEPARTMENT SELECT */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
          <div className="relative">
            <select 
              value={currentFilters.department} 
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-bold focus:ring-2 focus:ring-[#005CA9] outline-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 appearance-none"
              disabled={loading || departmentOptions.length === 0}
            >
              <option value="All">All</option>
              {departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* RESET BUTTON */}
        <div className="flex items-end">
          <button 
            onClick={handleReset}
            className="p-2.5 mb-[1px] text-slate-500 hover:text-[#005CA9] hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition"
            title="Reset Filters"
          >
            <RefreshCcw size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterBar;