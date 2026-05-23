export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled';

export interface Booking {

  _id: string;

  propertyId: {
    _id: string;
    title: string;
    titleAr: string;
    location: string;
    locationAr: string;
  };

  clientId: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };

  startDate: string;

  endDate: string;

  totalDays: number;

  totalPrice: number;

  paidAmount: number;

  remainingAmount: number;

  status: BookingStatus;

  notes?: string;

}