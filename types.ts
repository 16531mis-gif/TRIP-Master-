
export enum TripType {
  EMPTY_GP = 'Empty GP',
  IMPORT_GP = 'Import GP',
  THIRD_PARTY_GP = 'Third Party GP',
  INTER_COMPANY_GP = 'Inter Company GP',
  SCM = 'SCM'
}

export interface TripData {
  id?: string;
  date: string;
  tripType: TripType;
  description: string;
  vehicleNumber: string;
  dmId: string;
  driverId: string;
  phoneNumber: string;
  gpNumber?: string; // New field for GP Import
  timestamp?: number;
  created_at?: string;
}

export interface AppSettings {
  whatsappDefaultNumber: string;
  googleSheetsUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}
