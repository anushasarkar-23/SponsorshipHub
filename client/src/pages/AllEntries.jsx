import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import FilterBar from '../components/FilterBar'; 
import { Search, Calendar, Download } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import SponsorshipCard from '../components/SponsorshipCard';

// --- UTILITIES ---
const formatCurrency = (num) => 
  `₹ ${Number(num).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const AllEntries = () => {
  const [allRecords, setAllRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({ company: "All", location: "All", department: "All" });
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2026-12-31"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // CHANGE HERE: Removed 'http://localhost:5000' to allow single-app deployment
        const res = await axios.get('/api/sponsorships');
        
        const processed = res.data.map(item => ({
          ...item,
          final_company: item.final_company || item.company_name || 'Unknown', 
          final_location: item.final_location || item.loc_name || 'Unknown', 
          final_dept: item.final_dept || item.department || 'Unknown',       
          final_creator: item.created_by_name || 'Unknown'
        }));
        
        setAllRecords(processed);
        setFilteredRecords(processed);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    init();
  }, []);

  useEffect(() => {
    let result = allRecords;
    
    if (activeFilters.company !== 'All') result = result.filter(r => r.final_company === activeFilters.company || r.company_code === activeFilters.company);
    if (activeFilters.location !== 'All') result = result.filter(r => r.final_location === activeFilters.location);
    if (activeFilters.department !== 'All') result = result.filter(r => r.final_dept === activeFilters.department);
    
    if (startDate && endDate) {
        const start = new Date(startDate); const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        result = result.filter(r => { const eventDate = new Date(r.event_start_date); return eventDate >= start && eventDate <= end; });
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => r.vendor_name?.toLowerCase().includes(lower) || r.event_name?.toLowerCase().includes(lower) || r.final_creator?.toLowerCase().includes(lower));
    }
    setFilteredRecords(result);
  }, [activeFilters, startDate, endDate, searchTerm, allRecords]);

  // --- EXCEL EXPORT ---
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert("No records to export!");
      return;
    }

    const excelData = filteredRecords.map(rec => ({
      "Reference ID": rec.sponsorship_uid || `MKT/SYS/${rec.id}`,
      "Vendor Name": rec.vendor_name,
      "Vendor Code": rec.vendor_code,
      "Event Name": rec.event_name,
      "Start Date": formatDate(rec.event_start_date),
      "End Date": formatDate(rec.event_end_date),
      "Location": rec.final_location, 
      "Department": rec.final_dept,   
      "Created By": rec.final_creator,
      "Amount": Number(rec.amount),
      "Deliverables": rec.deliverables || "",
      "Remarks": rec.remarks || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const wscols = [
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 25 },
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 30 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sponsorships");
    XLSX.writeFile(workbook, `Sponsorship_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-end gap-4 pt-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">All Sponsorship Records</h1>
            <p className="text-slate-500 mt-1 font-medium">Audit-ready list of all approved sponsorships.</p>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition shadow-sm"
          >
            <Download size={18}/> Export Excel
          </button>
        </div>

        {/* --- UNIFIED CONTROL BOX --- */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          
          {/* ROW 1: FILTERS */}
          <div className="mb-6">
              <FilterBar currentFilters={activeFilters} onFilterChange={setActiveFilters} />
          </div>

          {/* DIVIDER LINE */}
          <div className="border-t border-slate-100 mb-6"></div>

          {/* ROW 2: DATE & SEARCH (Updated Layout) */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* Left: Date Picker (Fixed Width) */}
            <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
               <div className="p-2 bg-white rounded-lg text-slate-500 shadow-sm border border-slate-200"><Calendar size={18}/></div>
               
               <input 
                 type="date" 
                 value={startDate} 
                 onChange={e => setStartDate(e.target.value)} 
                 className="p-2 bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
               />
               
               <span className="text-slate-400 font-bold">-</span>
               
               <input 
                 type="date" 
                 value={endDate} 
                 min={startDate} 
                 onChange={e => setEndDate(e.target.value)} 
                 className="p-2 bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
                 disabled={!startDate}
               />
            </div>

            {/* Right: Search Bar (Flex Grow - Takes remaining space) */}
            <div className="relative w-full md:flex-1">
               <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search by Vendor, Event or Creator..." 
                 className="w-full pl-12 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#005CA9] transition-all" 
                 value={searchTerm} 
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? <div className="p-12 text-center text-slate-500 font-bold text-lg">Loading Records...</div> : 
           filteredRecords.length === 0 ? <div className="p-12 text-center text-slate-400 font-medium">No records found.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-800 font-extrabold tracking-wider">
                  <tr>
                    <th className="px-3 py-4 pl-6">Vendor</th>
                    <th className="px-3 py-4">Event Name</th>
                    <th className="px-3 py-4 whitespace-nowrap">Start Date</th>
                    <th className="px-3 py-4 whitespace-nowrap">End Date</th>
                    <th className="px-3 py-4">Location</th>
                    <th className="px-3 py-4">Created By</th>
                    <th className="px-3 py-4 text-right">Amount</th>
                    <th className="px-3 py-4 text-center pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-4 pl-6 text-slate-900">{rec.vendor_name}</td>
                      <td className="px-3 py-4 text-[#005CA9]">{rec.event_name}</td>
                      <td className="px-3 py-4 whitespace-nowrap font-medium">{formatDate(rec.event_start_date)}</td>
                      <td className="px-3 py-4 whitespace-nowrap font-medium">{formatDate(rec.event_end_date)}</td>
                      <td className="px-3 py-4">{rec.final_location}</td>
                      <td className="px-3 py-4 text-slate-700 font-bold">{rec.final_creator}</td>
                      <td className="px-3 py-4 text-right text-slate-900 whitespace-nowrap">{formatCurrency(rec.amount)}</td>
                      <td className="px-3 py-4 text-center pr-6">
                        <button onClick={() => { setSelectedRecord(rec); setShowModal(true); }} className="px-4 py-2 bg-[#005CA9] text-white rounded-lg text-xs font-bold hover:bg-blue-800 shadow-md transition active:scale-95">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && selectedRecord && <SponsorshipCard record={selectedRecord} onClose={() => setShowModal(false)} />}
      </div>
    </Layout>
  );
};

export default AllEntries;