import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, Calendar, FileText, CheckCircle, 
  AlertCircle, IndianRupee, Save, Briefcase, ExternalLink, X, FileWarning
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SponsorshipCard from '../components/SponsorshipCard';

const NewEntry = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Define default empty state
  const initialFormState = { 
    vendor_code: '', vendor_name: '', event_name: '', 
    start_date: '', end_date: '', amount: '', 
    is_vip: false, remarks: '', deliverables: '' 
  };

  // --- 1. STATE INITIALIZATION ---
  const [formData, setFormData] = useState(initialFormState);
  const [displayAmount, setDisplayAmount] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [files, setFiles] = useState({ approval_doc: null, brochure_doc: null });
  const [conflict, setConflict] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Custom Validation State
  const [errors, setErrors] = useState({});
  
  // NEW: State for File Error Modal (Replaces default alert)
  const [fileErrorModal, setFileErrorModal] = useState(null); // { title: '', message: '' }

  // Refs for Auto-Scrolling
  const fieldRefs = {
    start_date: useRef(null), end_date: useRef(null), vendor_code: useRef(null),
    event_name: useRef(null), deliverables: useRef(null), remarks: useRef(null),
    amount: useRef(null), approval_doc: useRef(null), brochure_doc: useRef(null),
  };
  
  const [showModal, setShowModal] = useState(false);
  const [selectedConflictRecord, setSelectedConflictRecord] = useState(null);

  // --- 2. AUTOSAVE LOGIC ---
  useEffect(() => {
    if (user?.id) {
        const storageKey = `new_entry_autosave_${user.id}`;
        const savedData = localStorage.getItem(storageKey);

        if (savedData) {
            const parsed = JSON.parse(savedData);
            setFormData(parsed);
            if (parsed.amount) {
                setDisplayAmount(Number(parsed.amount).toLocaleString('en-IN'));
            }
        } else {
            setFormData(initialFormState);
            setDisplayAmount('');
        }
        setIsDataLoaded(true);
    }
  }, [user]); 

  useEffect(() => { 
    if (user?.id && isDataLoaded) {
        const storageKey = `new_entry_autosave_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(formData)); 
    }
  }, [formData, user, isDataLoaded]);

  // Conflict Detection
  useEffect(() => {
    const { start_date, end_date, vendor_name } = formData;
    if (start_date && end_date && vendor_name) {
        const timer = setTimeout(async () => {
            try {
                // UPDATED: Removed http://localhost:5000
                const res = await axios.post('/api/check-conflict', { start_date, end_date, vendor_name });
                setConflict(res.data.conflict ? res.data : null);
            } catch (err) { console.error(err); }
        }, 500); 
        return () => clearTimeout(timer);
    } else { setConflict(null); }
  }, [formData.start_date, formData.end_date, formData.vendor_name]);

  // --- 3. HANDLERS ---
  
  const clearError = (field) => {
    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e, field) => { 
    const file = e.target.files[0];
    if(file) {
        // 1. Check File Type
        if (file.type !== 'application/pdf') { 
            // UPDATED: Use Custom Modal instead of alert
            setFileErrorModal({
                title: "Invalid File Format",
                message: "Only PDF documents are allowed. Please convert your file and try again."
            });
            e.target.value = ""; 
            return; 
        }
        
        // 2. Check File Size (2MB)
        if (file.size > 2 * 1024 * 1024) { 
            // UPDATED: Use Custom Modal instead of alert
            setFileErrorModal({
                title: "File Too Large",
                message: "The selected file exceeds the 2MB limit. Please compress the PDF or upload a smaller file."
            });
            e.target.value = ""; 
            return; 
        }
        
        setFiles({...files, [field]: file});
        clearError(field); 
    }
  };

  const handleVendorCode = (e) => {
    const code = e.target.value;
    clearError('vendor_code');
    let name = '';
    // Mock Data
    if (code === '12345678') name = 'Reliance Industries';
    else if (code === '90001001') name = 'Tata Motors Ltd';
    else if (code === '90001002') name = 'Infosys Limited';
    else if (code === '90001003') name = 'Adani Power';
    else if (code === '90001004') name = 'Larsen & Toubro';
    setFormData(prev => ({ ...prev, vendor_code: code, vendor_name: name }));
  };

  const handleDateChange = (e) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
      clearError(e.target.name);
  };
  
  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/,/g, '');
    if (!isNaN(val)) { 
        setFormData(prev => ({...prev, amount: val})); 
        setDisplayAmount(Number(val).toLocaleString('en-IN')); 
        clearError('amount');
    }
  };

  const handleTextChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
      clearError(e.target.name);
  }

  // --- 4. VALIDATION ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.start_date) newErrors.start_date = "Please select the start date.";
    if (!formData.end_date) newErrors.end_date = "Please select the end date.";
    if (!formData.vendor_code) newErrors.vendor_code = "Please enter a valid vendor code.";
    if (!formData.event_name.trim()) newErrors.event_name = "Please enter the event name.";
    if (!formData.deliverables.trim()) newErrors.deliverables = "Please list the deliverables.";
    if (!formData.remarks.trim()) newErrors.remarks = "Please enter remarks.";
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = "Please enter a valid amount.";
    if (!files.approval_doc) newErrors.approval_doc = "Upload Approval Note (PDF).";
    if (!files.brochure_doc) newErrors.brochure_doc = "Upload Event Brochure (PDF).";

    setErrors(newErrors);

    const fieldOrder = [
        'start_date', 'end_date', 'vendor_code', 'event_name', 
        'deliverables', 'remarks', 'amount', 'approval_doc', 'brochure_doc'
    ];

    const firstErrorField = fieldOrder.find(field => newErrors[field]);

    if (firstErrorField) {
        const element = fieldRefs[firstErrorField].current;
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus({ preventScroll: true }); 
        }
        return false; 
    }
    return true; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return; 
    
    setSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    data.append('approval_doc', files.approval_doc);
    data.append('brochure_doc', files.brochure_doc);
    if (user?.id) data.append('created_by', user.id);
    
    try {
      // UPDATED: Removed http://localhost:5000
      await axios.post('/api/sponsorships', data);
      
      if (user?.id) {
          localStorage.removeItem(`new_entry_autosave_${user.id}`);
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) { alert("Error: " + err.message); } finally { setSubmitting(false); }
  };

  const getInputClass = (fieldName) => `w-full p-3 border rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#005CA9] transition-all ${errors[fieldName] ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'bg-slate-50 border-slate-400'}`;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Create New Sponsorship</h1>
                <p className="text-slate-600 mt-1 flex items-center gap-2 font-medium">
                    <Save size={14} className="text-green-700"/>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                        {isDataLoaded ? `Autosaving for ${user?.name || 'User'}` : 'Loading...'}
                    </span>
                </p>
            </div>
            {user && (
                <div className="bg-white border border-slate-300 shadow-sm px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#005CA9] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {user.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-[#005CA9] tracking-wider">Posting As</p>
                        <p className="text-xs font-extrabold text-slate-900">{user.name}</p>
                    </div>
                </div>
            )}
        </div>
        
        {success ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center animate-fadeIn shadow-lg">
            <CheckCircle size={32} className="mx-auto text-green-600 mb-4"/>
            <h2 className="text-xl font-extrabold text-green-900">Sponsorship Record Created!</h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* 1. VENDOR SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md">
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-md">1</div> 
                    Vendor Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Vendor Code <span className="text-red-500">*</span></label>
                        <input 
                            ref={fieldRefs.vendor_code}
                            type="text" 
                            placeholder="Enter Code" 
                            className={`${getInputClass('vendor_code')} font-mono`}
                            value={formData.vendor_code} 
                            onChange={handleVendorCode}
                        />
                        {errors.vendor_code && <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {errors.vendor_code}</p>}
                        <p className="text-[11px] text-slate-500 mt-1.5 font-semibold">Try: 12345678</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Vendor Name</label>
                        <input 
                            type="text"
                            readOnly
                            placeholder="Auto-populated..."
                            className={`w-full p-3 border rounded-xl font-bold text-sm shadow-inner outline-none ${formData.vendor_name ? 'bg-green-50 border-green-400 text-green-900' : 'bg-slate-100 border-slate-300 text-slate-400'}`}
                            value={formData.vendor_name}
                        />
                    </div>
                </div>
            </div>

            {/* 2. EVENT SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md">
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-md">2</div> 
                    Event Schedule
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Start Date <span className="text-red-500">*</span></label>
                        <input 
                            ref={fieldRefs.start_date}
                            type="date" 
                            name="start_date" 
                            className={getInputClass('start_date')}
                            value={formData.start_date} 
                            onChange={handleDateChange}
                        />
                        {errors.start_date && <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {errors.start_date}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">End Date <span className="text-red-500">*</span></label>
                        <input 
                            ref={fieldRefs.end_date}
                            type="date" 
                            name="end_date" 
                            min={formData.start_date}
                            className={getInputClass('end_date')}
                            value={formData.end_date} 
                            onChange={handleDateChange} 
                            disabled={!formData.start_date}
                        />
                        {errors.end_date && <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {errors.end_date}</p>}
                    </div>
                </div>

                {/* DUPLICATE ALERT */}
                {conflict && (
                    <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm animate-fadeIn relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                        <div className="flex items-start gap-4 mb-5">
                            <div className="p-3 bg-red-100 rounded-full text-red-600 shrink-0 shadow-sm">
                                <AlertCircle size={28} strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Duplicate Sponsorship Detected</h3>
                                <p className="text-sm font-medium text-slate-600 mt-1">
                                    We found <span className="font-bold text-red-600 text-base">{conflict.count} existing records</span> for <span className="font-bold text-slate-800">{formData.vendor_name}</span> within ±10 days.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 pl-0 md:pl-14">
                            {conflict.list.map((c, i) => (
                                <div key={i} className="group bg-white p-4 rounded-xl border border-red-100 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                                <Calendar size={12} className="text-slate-400"/>
                                                {new Date(c.event_start_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 flex items-center gap-1.5">
                                                <Briefcase size={12} className="text-blue-400"/>
                                                {c.loc_name || 'Unknown Office'}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-bold text-slate-800 group-hover:text-[#005CA9] transition-colors">
                                            {c.event_name}
                                        </h4>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => { setSelectedConflictRecord(c); setShowModal(true); }} 
                                        className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-bold rounded-lg transition-all duration-200 border border-red-200 hover:border-red-600 flex items-center justify-center gap-2"
                                    >
                                        View Details <ExternalLink size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Event Name <span className="text-red-500">*</span></label>
                    <input 
                        ref={fieldRefs.event_name}
                        type="text" 
                        name="event_name" 
                        placeholder="e.g. Annual Tech Summit"
                        className={getInputClass('event_name')}
                        value={formData.event_name} 
                        onChange={handleTextChange}
                    />
                    {errors.event_name && <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {errors.event_name}</p>}
                </div>
                <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Deliverables <span className="text-red-500">*</span></label>
                    <textarea 
                        ref={fieldRefs.deliverables}
                        rows="3" 
                        name="deliverables"
                        placeholder="List the deliverables..."
                        className={getInputClass('deliverables')}
                        value={formData.deliverables} 
                        onChange={handleTextChange}
                    ></textarea>
                    {errors.deliverables && <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {errors.deliverables}</p>}
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Remarks <span className="text-red-500">*</span></label>
                    <textarea 
                        ref={fieldRefs.remarks}
                        rows="2" 
                        name="remarks"
                        placeholder="Any additional notes..."
                        className={getInputClass('remarks')}
                        value={formData.remarks} 
                        onChange={handleTextChange}
                    ></textarea>
                    {errors.remarks && <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {errors.remarks}</p>}
                </div>
            </div>

            {/* 3. FINANCIALS SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-md">
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-md">3</div> 
                    Financials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">Amount (INR) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <IndianRupee size={16} className="absolute left-3.5 top-3.5 text-slate-500"/>
                            <input 
                                ref={fieldRefs.amount}
                                type="text" 
                                placeholder="0" 
                                className={`w-full pl-10 p-3 border rounded-xl text-base font-bold outline-none focus:ring-2 focus:ring-[#005CA9] transition-all ${errors.amount ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'bg-slate-50 border-slate-400'}`}
                                value={displayAmount} 
                                onChange={handleAmountChange}
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> {errors.amount}</p>}
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                        <input type="checkbox" id="vip" className="w-5 h-5 accent-[#005CA9]" checked={formData.is_vip} onChange={(e) => setFormData({...formData, is_vip: e.target.checked})}/>
                        <label htmlFor="vip" className="ml-2.5 text-sm font-bold text-slate-800 cursor-pointer">VIP Event</label>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* APPROVAL NOTE UPLOAD */}
                    <div 
                        ref={fieldRefs.approval_doc}
                        className={`border-2 border-dashed rounded-xl p-4 text-center hover:bg-blue-50 relative group transition-colors ${errors.approval_doc ? 'border-red-400 bg-red-50' : 'border-slate-400 bg-slate-50/50'}`}
                    >
                        <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'approval_doc')}/>
                        <Upload size={20} className={`mx-auto ${files.approval_doc ? 'text-green-600' : (errors.approval_doc ? 'text-red-500' : 'text-slate-400')} group-hover:text-[#005CA9]`}/>
                        <p className={`text-xs font-bold mt-2 ${errors.approval_doc ? 'text-red-600' : 'text-slate-700'}`}>
                            {files.approval_doc ? files.approval_doc.name : "Upload Approval Note"}
                        </p>
                        <p className={`text-[10px] font-bold mt-1 ${errors.approval_doc ? 'text-red-500' : 'text-slate-500'}`}>
                            {errors.approval_doc || "* Required (PDF, Max 2MB)"}
                        </p>
                    </div>
                    
                    {/* BROCHURE UPLOAD */}
                    <div 
                        ref={fieldRefs.brochure_doc}
                        className={`border-2 border-dashed rounded-xl p-4 text-center hover:bg-orange-50 relative group transition-colors ${errors.brochure_doc ? 'border-red-400 bg-red-50' : 'border-slate-400 bg-slate-50/50'}`}
                    >
                        <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'brochure_doc')}/>
                        <FileText size={20} className={`mx-auto ${files.brochure_doc ? 'text-green-600' : (errors.brochure_doc ? 'text-red-500' : 'text-slate-400')} group-hover:text-[#F37021]`}/>
                        <p className={`text-xs font-bold mt-2 ${errors.brochure_doc ? 'text-red-600' : 'text-slate-700'}`}>
                            {files.brochure_doc ? files.brochure_doc.name : "Upload Brochure"}
                        </p>
                        <p className={`text-[10px] font-bold mt-1 ${errors.brochure_doc ? 'text-red-500' : 'text-slate-500'}`}>
                            {errors.brochure_doc || "* Required (PDF, Max 2MB)"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-4 text-right pb-8">
                <button disabled={submitting} className="bg-[#005CA9] text-white text-base px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-blue-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                    {submitting ? "Processing..." : "Submit Record"}
                </button>
            </div>
          </form>
        )}

        {/* --- NEW: FILE ERROR MODAL --- */}
        {fileErrorModal && (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
                onClick={() => setFileErrorModal(null)}
            >
                <div 
                    className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileWarning className="text-red-600 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{fileErrorModal.title}</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        {fileErrorModal.message}
                    </p>
                    <button 
                        onClick={() => setFileErrorModal(null)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        OK, I Understand
                    </button>
                </div>
            </div>
        )}

        {/* REUSABLE CARD POPUP */}
        {showModal && selectedConflictRecord && <SponsorshipCard record={selectedConflictRecord} onClose={() => setShowModal(false)} />}
      </div>
    </Layout>
  );
};

export default NewEntry;