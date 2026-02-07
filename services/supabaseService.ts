
import { TripData, AppSettings } from '../types';

// Simple Supabase client implementation since we can't install external libs easily in this environment
// We will use the REST API of Supabase directly for maximum compatibility
export const supabaseRequest = async (
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  table: string,
  settings: AppSettings,
  body?: any,
  query?: string
) => {
  if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
    throw new Error("Supabase credentials not configured.");
  }

  const url = `${settings.supabaseUrl}/rest/v1/${table}${query ? `?${query}` : ''}`;
  
  const headers: Record<string, string> = {
    'apikey': settings.supabaseAnonKey,
    'Authorization': `Bearer ${settings.supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Supabase request failed");
  }

  return response.json();
};

export const fetchTripsFromSupabase = async (settings: AppSettings): Promise<TripData[]> => {
  const data = await supabaseRequest('GET', 'trips', settings, null, 'order=created_at.desc');
  return data.map((item: any) => ({
    id: item.id.toString(),
    date: item.date,
    tripType: item.trip_type,
    description: item.description,
    vehicleNumber: item.vehicle_number,
    dmId: item.dm_id,
    driverId: item.driver_id,
    phoneNumber: item.phone_number,
    gpNumber: item.gp_number || '',
    created_at: item.created_at
  }));
};

export const insertTripToSupabase = async (trip: TripData, settings: AppSettings) => {
  const payload = {
    date: trip.date,
    trip_type: trip.tripType,
    description: trip.description,
    vehicle_number: trip.vehicleNumber,
    dm_id: trip.dmId,
    driver_id: trip.driverId,
    phone_number: trip.phoneNumber,
    gp_number: trip.gpNumber
  };
  return supabaseRequest('POST', 'trips', settings, payload);
};

export const updateTripInSupabase = async (id: string, trip: TripData, settings: AppSettings) => {
  const payload = {
    date: trip.date,
    trip_type: trip.tripType,
    description: trip.description,
    vehicle_number: trip.vehicleNumber,
    dm_id: trip.dmId,
    driver_id: trip.driverId,
    phone_number: trip.phoneNumber,
    gp_number: trip.gpNumber
  };
  return supabaseRequest('PATCH', 'trips', settings, payload, `id=eq.${id}`);
};

export const deleteTripFromSupabase = async (id: string, settings: AppSettings) => {
  return supabaseRequest('DELETE', 'trips', settings, null, `id=eq.${id}`);
};
