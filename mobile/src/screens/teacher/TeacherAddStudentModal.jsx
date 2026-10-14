import React, { useState } from 'react';
import {
  X,
  Copy,
  Share2,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';
import { INITIAL_ROUTE_STOPS } from '../../data/mockData';

export default function TeacherAddStudentModal({ isOpen, onClose }) {
  const { enrollStudent, showToast } = useMobileAuth();

  const [formData, setFormData] = useState({
    name: '',
    studentId: `STU-${Math.floor(100 + Math.random() * 900)}`,
    class: '10',
    division: 'A',
    parentName: '',
    parentMobile: '',
    relationship: 'FATHER',
    parentEmail: '',
    busNumber: 'BUS 01',
    pickupStopName: 'Nilambur Junction (Main)',
    feePlan: 'Standard Annual Bus Fee (₹1,800/mo)',
  });

  const [generatedResult, setGeneratedResult] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.parentName || !formData.parentMobile) {
      showToast('Please fill all required student and parent fields', 'error');
      return;
    }

    const res = enrollStudent(formData);
    setGeneratedResult(res);
    showToast('Student successfully enrolled!', 'success');
  };

  const handleCopyCode = () => {
    if (generatedResult?.familyCode) {
      navigator.clipboard?.writeText(generatedResult.familyCode);
      showToast(`Copied ${generatedResult.familyCode} to clipboard`, 'success');
    }
  };

  const handleShareWhatsApp = () => {
    if (generatedResult?.familyCode) {
      const text = encodeURIComponent(
        `Hello ${formData.parentName},\n\nYour child ${formData.name} has been enrolled into Busly School Transport for ABC Public School.\n\n🚌 Assigned Bus: ${formData.busNumber}\n📍 Pickup Stop: ${formData.pickupStopName}\n🔑 Parent Family Login Code: *${generatedResult.familyCode}*\n\nDownload the Busly mobile app and enter your Family Code to track the bus in real time!`
      );
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleCloseAll = () => {
    setGeneratedResult(null);
    setFormData({
      name: '',
      studentId: `STU-${Math.floor(100 + Math.random() * 900)}`,
      class: '10',
      division: 'A',
      parentName: '',
      parentMobile: '',
      relationship: 'FATHER',
      parentEmail: '',
      busNumber: 'BUS 01',
      pickupStopName: 'Nilambur Junction (Main)',
      feePlan: 'Standard Annual Bus Fee (₹1,800/mo)',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in font-sans">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-5 shadow-2xl text-gray-900 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-busly-primary text-slate-900 flex items-center justify-center font-bold text-sm shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Add New Student</h3>
              <p className="text-[11px] text-gray-500">Enrollment & Family Code Generation</p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If generated result is ready: Show Celebratory Success Card */}
        {generatedResult ? (
          <div className="space-y-4 text-center py-2 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center text-2xl shadow-sm">
              🎉
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Enrollment Complete
              </span>
              <h4 className="text-lg font-bold text-gray-900 mt-1">{formData.name} Enrolled!</h4>
              <p className="text-xs text-gray-500">
                Assigned to {formData.busNumber} • {formData.pickupStopName}
              </p>
            </div>

            {/* Family Code Badge */}
            <div className="bg-amber-50/60 border-2 border-dashed border-amber-300 rounded-xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                Official Parent Family Code
              </span>
              <p className="text-3xl font-black font-mono tracking-widest text-amber-600">
                {generatedResult.familyCode}
              </p>
              <p className="text-[11px] text-gray-600">
                Provide this code to <strong className="text-gray-900">{formData.parentName}</strong> to log in.
              </p>
            </div>

            {/* Sharing Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCopyCode}
                className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-800 font-bold text-xs hover:bg-gray-200 transition flex items-center justify-center gap-2 border border-gray-200"
              >
                <Copy className="w-4 h-4 text-amber-600" />
                <span>Copy Family Code</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition flex items-center justify-center gap-2 shadow-sm touch-press"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Details on WhatsApp</span>
              </button>

              <button
                onClick={handleCloseAll}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 pt-1"
              >
                Done / Return to Class Roster
              </button>
            </div>
          </div>
        ) : (
          /* Step-by-Step Admission Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Step 1: Student Information */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block">
                1. Student Details
              </span>

              <div>
                <label className="text-[11px] text-gray-600 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Adithya Nambiar"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-gray-600 font-medium block mb-1">Student ID</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-2 text-xs font-mono text-gray-700 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 font-medium block mb-1">Class</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-900 focus:outline-none"
                  >
                    <option value="10">Class 10</option>
                    <option value="9">Class 9</option>
                    <option value="8">Class 8</option>
                    <option value="7">Class 7</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 font-medium block mb-1">Division</label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-900 focus:outline-none"
                  >
                    <option value="A">Div A</option>
                    <option value="B">Div B</option>
                    <option value="C">Div C</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Parent Information */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block">
                2. Guardian / Parent Contact
              </span>

              <div>
                <label className="text-[11px] text-gray-600 font-medium block mb-1">Parent Name</label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="e.g. Suresh Nambiar"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-600 font-medium block mb-1">Parent Mobile</label>
                  <input
                    type="tel"
                    value={formData.parentMobile}
                    onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                    placeholder="9876543299"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-600 font-medium block mb-1">Relationship</label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-900 focus:outline-none"
                  >
                    <option value="FATHER">Father</option>
                    <option value="MOTHER">Mother</option>
                    <option value="GUARDIAN">Guardian</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Transport Assignment */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block">
                3. Transport & Bus Assignment
              </span>

              <div>
                <label className="text-[11px] text-gray-600 font-medium block mb-1">Select Bus</label>
                <select
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                >
                  <option value="BUS 01">BUS 01 (Nilambur Route - Driver: Rajesh Kumar)</option>
                  <option value="BUS 02">BUS 02 (Town Church Route - Driver: Suresh Babu)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-600 font-medium block mb-1">Pickup Stop</label>
                <select
                  value={formData.pickupStopName}
                  onChange={(e) => setFormData({ ...formData, pickupStopName: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none"
                >
                  {INITIAL_ROUTE_STOPS.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} (ETA: {s.eta})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-busly-primary hover:bg-busly-primary-hover text-slate-900 font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 mt-4 touch-press"
            >
              <span>Save & Generate Family Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
