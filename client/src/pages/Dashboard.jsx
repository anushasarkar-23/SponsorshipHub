import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import FilterBar from '../components/FilterBar';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IndianRupee, CheckCircle, Users, ArrowRight, AlertOctagon, AlertTriangle, Building2, Copy } from 'lucide-react';
import SponsorshipCard from '../components/SponsorshipCard';

const COLORS = ['#005CA9', '#F37021', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Format for Charts/Metrics (Keep abbreviation here for space)
const formatMetric = (val) => val >= 10000000 ? `₹${(val/10000000).toFixed(2)} Cr` : val >= 100000 ? `₹${(val/100000).toFixed(2)} L` : `₹${Number(val).toLocaleString('en-IN')}`;

// Format for Table (Full Amount as requested)
const formatTableAmount = (val) => `₹ ${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// Date: 18/Jan/2025
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Updated Filters State to include 'vendor'
  const [filters, setFilters] = useState({ company: 'All', location: 'All', department: 'All', vendor: 'All' });
  const [vendorList, setVendorList] = useState([]); // State for Vendor Dropdown List

  const [dateRange, setDateRange] = useState(() => JSON.parse(localStorage.getItem('dashboard_dates')) || { start: '2020-01-01', end: '2030-12-31' });
  
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [selectedRiskVendor, setSelectedRiskVendor] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => { localStorage.setItem('dashboard_dates', JSON.stringify(dateRange)); }, [dateRange]);

  // 1. Fetch Vendor List for Dropdown
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        // UPDATED: Removed http://localhost:5000
        const res = await axios.get('/api/vendors');
        setVendorList(res.data);
      } catch (err) {
        console.error("Error fetching vendors for filter:", err);
      }
    };
    fetchVendors();
  }, []);

  // 2. Fetch Dashboard Data (Including Vendor Filter)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ 
            startDate: dateRange.start, 
            endDate: dateRange.end, 
            company: filters.company, 
            location: filters.location, 
            department: filters.department,
            vendor: filters.vendor // Passing Vendor Filter to Backend
        });
        // UPDATED: Removed http://localhost:5000
        const res = await axios.get(`/api/analytics?${params}`);
        setData(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [filters, dateRange]);

  const openRiskAnalysis = (vendor) => { setSelectedRiskVendor(vendor); setShowRiskModal(true); };
  const openRecordDetails = (record) => { setSelectedRecord(record); setShowRecordModal(true); };

  if (loading) return <Layout><div className="p-10 text-center text-slate-500 font-bold">Loading...</div></Layout>;
  if (!data) return <Layout><div className="p-10 text-center text-red-500">System Error</div></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6">
        
        {/* CHANGED: Reduced top padding from pt-8 to pt-2 to move content up */}
        <div className="pt-2 mb-6">
          
          <div className="bg-[#005CA9]/5 border-l-4 border-[#005CA9] p-4 rounded-r-lg mb-6"><h1 className="text-xl font-bold text-[#005CA9]">Sponsorship Monitoring Dashboard</h1><p className="text-sm text-slate-600">Monitoring <strong>{data.summary.total_records} Approved Sponsorships</strong>.</p></div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              {/* Existing Filters */}
              <FilterBar currentFilters={filters} onFilterChange={setFilters} />
              
              {/* ROW 2: Vendor Filter AND Date Range - GRID LAYOUT FOR BALANCE */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                  
                  {/* Vendor Dropdown (Occupies 7/12 columns - approx 58%) */}
                  <div className="lg:col-span-7">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Vendor Selection</label>
                      <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#005CA9] transition-all cursor-pointer hover:border-slate-300"
                        value={filters.vendor}
                        onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                      >
                        <option value="All">All Vendors</option>
                        {vendorList.map((v) => (
                            <option key={v.id} value={v.vendor_name}>{v.vendor_name}</option>
                        ))}
                      </select>
                  </div>

                  {/* Analysis Period (Occupies 5/12 columns - approx 42%) */}
                  <div className="lg:col-span-5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Analysis Period</label>
                      <div className="flex items-center gap-3">
                         <input 
                            type="date" 
                            value={dateRange.start} 
                            onChange={e => setDateRange({...dateRange, start: e.target.value})} 
                            className="w-full p-3 border rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-[#005CA9] transition-all cursor-pointer hover:border-slate-300"
                         />
                         <span className="text-slate-300 font-bold shrink-0">-</span>
                         <input 
                            type="date" 
                            value={dateRange.end} 
                            min={dateRange.start} 
                            onChange={e => setDateRange({...dateRange, end: e.target.value})} 
                            className="w-full p-3 border rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-[#005CA9] transition-all cursor-pointer hover:border-slate-300"
                         />
                      </div>
                  </div>

              </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Approved</p><p className="text-2xl font-extrabold text-[#005CA9]">{formatMetric(data.summary.total_spent)}</p></div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Records</p><p className="text-2xl font-extrabold text-slate-700">{data.summary.total_records}</p></div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unique Vendors</p><p className="text-2xl font-extrabold text-slate-700">{data.summary.unique_vendors}</p></div>
          <div className={`p-5 rounded-xl border shadow-sm ${data.risk_analysis.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}><p className={`text-xs font-bold uppercase tracking-wider mb-1 ${data.risk_analysis.length > 0 ? 'text-red-600' : 'text-green-600'}`}>Duplicate Risk</p><div className="flex items-center gap-2"><p className={`text-2xl font-extrabold ${data.risk_analysis.length > 0 ? 'text-red-700' : 'text-green-700'}`}>{data.risk_analysis.length > 0 ? `${data.risk_analysis.length} Vendors` : 'None'}</p>{data.risk_analysis.length > 0 ? <AlertOctagon className="text-red-500"/> : <CheckCircle className="text-green-500"/>}</div></div>
        </div>

        {/* RISK ANALYSIS & CHARTS */}
        {data.risk_analysis.length > 0 && (
            <div className="mb-8 grid grid-cols-1 gap-4">
                {data.risk_analysis.map((vendor, idx) => (
                    <div key={idx} className="bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm p-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{vendor.vendor_name}</h3>
                            <p className="text-sm text-slate-600">Risk detected in <span className="font-bold text-red-600">{vendor.office_count} Office(s)</span></p>
                        </div>
                        <button onClick={() => openRiskAnalysis(vendor)} className="px-6 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold text-sm hover:bg-red-100 flex items-center gap-2">View Comparison <ArrowRight size={16}/></button>
                    </div>
                ))}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Users size={16}/> Vendor Spend</h3>
                <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.top_vendors} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{data.top_vendors.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(value) => formatMetric(value)} /><Legend wrapperStyle={{fontSize: "10px"}} /></PieChart></ResponsiveContainer></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Users size={16}/> Top 5 Beneficiaries</h3>
                 <div className="space-y-3">{data.top_vendors.map((v, i) => (<div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"><span className="text-sm font-bold text-slate-700">{i+1}. {v.name}</span><span className="text-sm font-bold text-[#005CA9]">{formatMetric(v.value)}</span></div>))}</div>
            </div>
        </div>

        {/* --- RECORDS TABLE --- */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-800">Sponsorship Records</h3></div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-xs uppercase text-slate-800 font-extrabold border-b border-slate-200 sticky top-0">
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
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {data.records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-4 pl-6 text-slate-900">{rec.vendor_name}</td>
                    <td className="px-3 py-4 text-[#005CA9]">{rec.event_name}</td>
                    <td className="px-3 py-4 whitespace-nowrap font-medium">{formatDate(rec.event_start_date)}</td>
                    <td className="px-3 py-4 whitespace-nowrap font-medium">{formatDate(rec.event_end_date)}</td>
                    <td className="px-3 py-4">{rec.loc_name}</td>
                    <td className="px-3 py-4 text-slate-700 font-bold">{rec.created_by_name}</td>
                    <td className="px-3 py-4 text-right text-slate-900 whitespace-nowrap">{formatTableAmount(rec.amount)}</td>
                    <td className="px-3 py-4 text-center pr-6">
                        <button onClick={() => openRecordDetails(rec)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-bold border border-blue-200">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: RISK COMPARISON (UPDATED) */}
        {showRiskModal && selectedRiskVendor && (
          // 1. Click Outside Closes Modal
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowRiskModal(false)}
          >
            {/* 2. Stop Propagation */}
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header - REMOVED X Button */}
              <div className="px-6 py-5 border-b border-slate-100 bg-red-50">
                <div>
                   <h2 className="text-lg font-extrabold text-red-900 flex items-center gap-2">
                     <AlertTriangle size={24}/> Duplicate Analysis
                   </h2>
                   <p className="text-sm font-bold text-red-700 mt-1">
                     Vendor: <span className="text-black">{selectedRiskVendor.vendor_name}</span>
                   </p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
                <div className="space-y-6">
                    {selectedRiskVendor.conflicting_events.map((cluster, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
                            <div className="bg-slate-100 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                                <div><h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-base"><Copy size={18} className="text-slate-500"/> Cluster Detected</h3><p className="text-xs font-bold text-slate-500 mt-1">Range: {formatDate(cluster.cluster_start)} — {formatDate(cluster.cluster_end)}</p></div>
                                <span className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1.5 rounded border border-red-200">{cluster.records.length} Records</span>
                            </div>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                {cluster.records.map((rec, rIdx) => (
                                    <div key={rIdx} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Office Location</p>
                                        <p className="text-sm font-bold text-[#005CA9] mb-4 flex items-center gap-1.5"><Building2 size={16}/> {rec.loc_name}</p>
                                        <div className="space-y-3 border-t border-slate-100 pt-3">
                                            <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Event Name</span><span className="text-sm font-bold text-slate-800 leading-tight block">{rec.event_name}</span></div>
                                            <div className="flex justify-between items-end">
                                                <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Amount</span><span className="text-base font-black text-slate-900">{formatTableAmount(rec.amount)}</span></div>
                                                <button onClick={() => openRecordDetails(rec)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">View Details</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
              
              {/* Footer - REMOVED BUTTON, ADDED TEXT */}
              <div className="p-4 bg-white border-t border-slate-200 text-center">
                  <p className="text-xs text-slate-400 font-medium italic">Click outside to close</p>
              </div>

            </div>
          </div>
        )}

        {showRecordModal && selectedRecord && <SponsorshipCard record={selectedRecord} onClose={() => setShowRecordModal(false)} />}
      </div>
    </Layout>
  );
};

export default Dashboard;