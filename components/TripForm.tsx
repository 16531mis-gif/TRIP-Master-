
import React, { useState, useEffect } from 'react';
import { TripData, TripType } from '../types';

interface TripFormProps {
  initialData?: TripData;
  onSubmit: (data: TripData) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  onFormChange?: (data: TripData) => void;
}

const TripForm: React.FC<TripFormProps> = ({ initialData, onSubmit, onCancel, isEditing = false, onFormChange }) => {
  const [formData, setFormData] = useState<TripData>({
    date: new Date().toISOString().split('T')[0],
    tripType: TripType.EMPTY_GP,
    description: '',
    vehicleNumber: '',
    dmId: '',
    driverId: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (onFormChange) onFormChange(formData);
  }, [formData, onFormChange]);

  const formatVehicleNumber = (val: string) => {
    // Logic: DMU232020 (9 chars) -> D.M.U-23-2020
    const clean = val.replace(/[\.\-]/g, '').toUpperCase();
    if (clean.length === 9) {
      return `${clean[0]}.${clean[1]}.${clean[2]}-${clean.substring(3, 5)}-${clean.substring(5, 9)}`;
    }
    return clean;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'vehicleNumber') {
      finalValue = value.toUpperCase();
    }
    if (['dmId', 'driverId'].includes(name)) {
      finalValue = value.toUpperCase();
    }
    if (name === 'phoneNumber') {
      finalValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handlePhoneBlur = () => {
    const phone = formData.phoneNumber;
    // Condition: Only '0' or exactly 11 digits
    if (phone !== '' && phone !== '0' && phone.length !== 11) {
      alert("Please Enter 0 or 11 digit.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const phone = formData.phoneNumber;
    if (phone !== '0' && phone.length !== 11) {
      alert("Please Enter 0 or 11 digit.");
      return;
    }

    const finalData = {
      ...formData,
      vehicleNumber: formatVehicleNumber(formData.vehicleNumber)
    };

    onSubmit(finalData);

    if (!isEditing) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        tripType: TripType.EMPTY_GP,
        description: '',
        vehicleNumber: '',
        dmId: '',
        driverId: '',
        phoneNumber: ''
      });
    }
  };

  const inputClass = "w-full px-5 py-4 bg-black border border-white/10 rounded-2xl text-white placeholder-zinc-800 focus:bg-zinc-900 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner font-bold text-sm";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-3 ml-1";

  return (
    <form onSubmit={handleManualSubmit} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelClass}>Date (তারিখ)</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Trip Type (ট্রিপ টাইপ)</label>
          <select name="tripType" value={formData.tripType} onChange={handleChange} className={inputClass}>
            {Object.values(TripType).map(type => (
              <option key={type} value={type} className="bg-black text-white">{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Vehicle Number (e.g. DMU232020)</label>
          <input 
            type="text" 
            name="vehicleNumber" 
            placeholder="DMU232020" 
            value={formData.vehicleNumber} 
            onChange={handleChange} 
            required 
            className={`${inputClass} font-mono uppercase`}
          />
        </div>

        <div>
          <label className={labelClass}>DM ID (ডিএম আইডি)</label>
          <input type="text" name="dmId" placeholder="DM CODE" value={formData.dmId} onChange={handleChange} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Driver ID (ড্রাইভার আইডি)</label>
          <input type="text" name="driverId" placeholder="DRIVER CODE" value={formData.driverId} onChange={handleChange} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Phone Number (১১ ডিজিট বা ০)</label>
          <input 
            type="tel" 
            name="phoneNumber" 
            placeholder="01XXXXXXXXX" 
            value={formData.phoneNumber} 
            onChange={handleChange} 
            onBlur={handlePhoneBlur}
            required 
            className={inputClass} 
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description (বিবরণ)</label>
        <textarea name="description" rows={3} placeholder="Shipment details..." value={formData.description} onChange={handleChange} required className={inputClass}></textarea>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] py-5 rounded-2xl shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-1 flex items-center justify-center text-xs"
        >
          <i className="fas fa-save mr-3 text-lg"></i>
          {isEditing ? 'UPDATE RECORD' : 'EXECUTE & SAVE'}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
