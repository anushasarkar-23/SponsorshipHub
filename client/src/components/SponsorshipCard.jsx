import React from 'react';
import { 
  FileText, Calendar, ShieldCheck, Briefcase, MapPin, LayoutGrid, Clock, AlertCircle, Hash 
} from 'lucide-react';

const formatCurrency = (num) => {
  if (!num) return "₹ 0";
  return `₹ ${Number(num).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const SponsorshipCard = ({ record, onClose }) => {
  if (!record) return null;

  // --- UNIVERSAL DATA MAPPING ---
  const data = {
      id: record.id,
      uniqueId: record.sponsorship_uid || `MKT/SYS/${record.id}`,
      
      vendor_name: record.vendor_name,
      vendor_code: record.vendor_code,
      event_name: record.event_name,
      deliverables: record.deliverables, 
      remarks: record.remarks,           
      
      event_start_date: record.event_start_date,
      event_end_date: record.event_end_date,
      amount: record.amount,
      approval_doc: record.approval_doc,
      brochure_doc: record.brochure_doc,
      created_at: record.created_at,
      
      // --- INTELLIGENT FIELD SELECTION ---
      // Prioritizes "final_" (Snapshot) fields, falls back to live/standard fields.
      creatorName: record.created_by_name || record.final_creator || 'Unknown',
      
      locationName: record.final_location || record.loc_name || record.location || 'Unknown',
      departmentName: record.final_dept || record.department || record.psa || 'Unknown',
      companyName: record.final_company || record.company_name || 'Unknown',
      
      // --- CREATOR DETAILS (NOW VISIBLE) ---
      creatorDesignation: record.final_designation || record.designation || '', 
      creatorId: record.final_emp_code || record.created_by || '',
  };

  return (
    // 1. CLICK OUTSIDE TO CLOSE
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn"
        onClick={onClose} 
    >
      {/* 2. OPTIMIZED SIZE */}
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl min-h-[650px] overflow-hidden flex flex-col transform scale-100 transition-all border-t-8 border-[#005CA9] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white">
          <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sponsorship Details</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sponsorship ID:</span>
                <span className="text-sm font-mono font-bold text-[#005CA9] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {data.uniqueId}
                </span>
              </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50/30">
          
            {/* SECTION 1: Core Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                
                {/* Row 1: Vendor & Financials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div>
                        <p className="text-xs font-bold text-slate-600 uppercase mb-1 tracking-wide">Vendor Name</p>
                        <p className="text-lg font-extrabold text-slate-900">{data.vendor_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 rounded">Code</span>
                            <span className="text-xs font-mono font-bold text-slate-700">{data.vendor_code}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-600 uppercase mb-1 tracking-wide">Approved Amount</p>
                        <p className="text-2xl font-black text-[#005CA9]">{formatCurrency(data.amount)}</p>
                    </div>
                </div>

                <div className="border-t border-slate-100 my-5"></div>

                {/* Row 2: Event Details */}
                <div className="mb-6">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-1 tracking-wide">Event Name</p>
                    <p className="text-xl font-bold text-slate-800">{data.event_name}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm font-bold text-slate-700">
                        <Calendar size={16} className="text-[#005CA9]"/> 
                        {formatDate(data.event_start_date)} 
                        <span className="text-slate-400 mx-1">➜</span> 
                        {formatDate(data.event_end_date)}
                    </div>
                </div>

                {/* Row 3: Deliverables & Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-2">
                            <FileText size={14}/> Deliverables
                        </p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed min-h-[80px]">
                            {data.deliverables || "No deliverables specified."}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-2">
                            <AlertCircle size={14}/> Remarks
                        </p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed min-h-[80px]">
                            {data.remarks || "No remarks provided."}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Footer Info (Context & Files) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Context Column (2/3 width) */}
                <div className="md:col-span-2">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-3">System Context</h3>
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#005CA9] text-white flex items-center justify-center font-bold text-lg shadow-md">
                                {data.creatorName ? data.creatorName.charAt(0) : 'U'}
                            </div>
                            <div>
                                <p className="text-[10px] text-blue-600 font-bold uppercase mb-0.5">Created By</p>
                                <p className="text-sm font-extrabold text-slate-900 leading-tight">{data.creatorName}</p>
                                
                                {/* DISPLAY DESIGNATION */}
                                {data.creatorDesignation && (
                                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">{data.creatorDesignation}</p>
                                )}
                                
                                {/* DISPLAY ID */}
                                <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">ID: {data.creatorId}</p>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                <MapPin size={14} className="text-slate-400"/> {data.locationName}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                <LayoutGrid size={14} className="text-slate-400"/> {data.departmentName}
                            </div>
                        </div>
                        <div className="ml-auto text-right hidden md:block">
                             <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Timestamp</p>
                             <p className="text-xs font-mono font-bold text-slate-600 flex items-center justify-end gap-1">
                                <Clock size={12}/> {new Date(data.created_at).toLocaleDateString()}
                             </p>
                        </div>
                    </div>
                </div>

                {/* Attachments Column (1/3 width) */}
                <div className="md:col-span-1">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-3">Attachments</h3>
                    <div className="space-y-2">
                        {data.approval_doc ? (
                            // UPDATED: Removed http://localhost:5000
                            <a href={`/uploads/${data.approval_doc}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full p-3 bg-white border border-slate-200 rounded-lg hover:border-[#005CA9] hover:text-[#005CA9] transition group shadow-sm">
                                <div className="p-2 bg-blue-50 text-[#005CA9] rounded-md group-hover:bg-[#005CA9] group-hover:text-white transition"><FileText size={16}/></div>
                                <span className="text-xs font-bold text-slate-700 group-hover:text-[#005CA9]">Approval Note</span>
                            </a>
                        ) : <div className="text-xs text-slate-400 italic p-2">No Approval Note</div>}
                        
                        {data.brochure_doc ? (
                            // UPDATED: Removed http://localhost:5000
                            <a href={`/uploads/${data.brochure_doc}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full p-3 bg-white border border-slate-200 rounded-lg hover:border-[#F37021] hover:text-[#F37021] transition group shadow-sm">
                                <div className="p-2 bg-orange-50 text-[#F37021] rounded-md group-hover:bg-[#F37021] group-hover:text-white transition"><FileText size={16}/></div>
                                <span className="text-xs font-bold text-slate-700 group-hover:text-[#F37021]">Event Brochure</span>
                            </a>
                        ) : <div className="text-xs text-slate-400 italic p-2">No Brochure</div>}
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default SponsorshipCard;