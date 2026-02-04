import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Search, MapPin, Phone, Mail, 
  CreditCard 
} from 'lucide-react';
import axios from 'axios';

const VendorMaster = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // --- MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // 1. Fetch Vendors from Database
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        // UPDATED: Removed http://localhost:5000
        const res = await axios.get('/api/vendors');
        setVendors(res.data);
        setFilteredVendors(res.data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  // 2. Search Logic
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const results = vendors.filter(v => 
      v.vendor_name?.toLowerCase().includes(lowerTerm) ||
      v.vendor_code?.toLowerCase().includes(lowerTerm)
    );
    setFilteredVendors(results);
  }, [searchTerm, vendors]);

  const openVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVendor(null);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pt-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Vendor Master Directory</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage and view details of all registered vendors.</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:flex-1">
                <Search size={20} className="absolute left-3.5 top-3 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by Vendor Name or Code..." 
                    className="w-full pl-11 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#005CA9] focus:bg-white transition-all placeholder:font-normal"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* VENDOR TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
                <div className="p-12 text-center text-slate-500 font-bold text-lg">Loading Directory...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-600 font-extrabold tracking-wider">
                            <tr>
                                <th className="p-5">Vendor Identity</th>
                                <th className="p-5">Vendor Code</th>
                                <th className="p-5">Phone</th>
                                <th className="p-5">Email</th>
                                <th className="p-5">Location</th>
                                <th className="p-5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-slate-400 font-medium">
                                        No vendors found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredVendors.map((vendor) => (
                                    <tr key={vendor.vendor_code} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm">
                                                    {vendor.vendor_name ? vendor.vendor_name.charAt(0) : 'V'}
                                                </div>
                                                <div>
                                                    <p className="text-base font-extrabold text-slate-900 leading-tight">{vendor.vendor_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-mono text-sm font-bold inline-block shadow-sm">
                                                {vendor.vendor_code}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 whitespace-nowrap">
                                                <Phone size={14} className="text-[#005CA9]"/> {vendor.contact_number || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                                                <Mail size={14} className="text-[#F37021]"/> {vendor.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-start gap-2.5">
                                                <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0"/>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 break-words max-w-[150px] leading-snug">
                                                        {vendor.address || 'Address not available'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button 
                                                onClick={() => openVendorDetails(vendor)}
                                                className="px-4 py-2 bg-white border border-slate-200 text-[#005CA9] rounded-lg text-xs font-bold hover:bg-blue-50 hover:border-[#005CA9] transition shadow-sm"
                                            >
                                                View Card
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* === VENDOR DETAILS MODAL === */}
        {showModal && selectedVendor && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
            onClick={closeModal}
          >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform scale-100 transition-all border-t-8 border-[#005CA9]"
                onClick={(e) => e.stopPropagation()}
            >
              
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-extrabold text-slate-900">Vendor Profile Card</h2>
              </div>

              <div className="p-8 space-y-8">
                
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-3xl shadow-sm">
                        {selectedVendor.vendor_name ? selectedVendor.vendor_name.charAt(0) : 'V'}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedVendor.vendor_name}</h3>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6 shadow-inner">
                    
                    <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-6">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">Vendor Code</p>
                            <span className="text-lg font-mono font-bold text-slate-800 bg-white px-3 py-1 rounded border border-slate-200 inline-block">{selectedVendor.vendor_code}</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">GSTIN</p>
                            <span className="text-sm font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 inline-block">{selectedVendor.gstin || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">Official Address</p>
                            <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200">
                                <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0"/>
                                <p className="text-sm font-bold text-slate-800 leading-snug">{selectedVendor.address || 'Address not provided'}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                                <Phone size={18} className="text-[#005CA9]"/>
                                <span className="text-sm font-bold text-slate-800">{selectedVendor.contact_number || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                                <Mail size={18} className="text-[#F37021]"/>
                                <span className="text-sm font-bold text-slate-800 truncate" title={selectedVendor.email}>{selectedVendor.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                </div>

              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                  <p className="text-xs text-slate-400 font-medium italic">Click outside to close</p>
              </div>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default VendorMaster;