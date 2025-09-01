import { Book } from './book.interface';
import { Reader } from './reader.interface';

export interface Rental {
  _id: string;
  book: Book;
  reader: Reader;
  issueDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  totalRentalCost?: number;
  fineAmount?: number;
  discount?: number;
  finalAmount?: number;
  notes?: string;
  status: 'active' | 'returned' | 'overdue';
  isOverdue?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRentalRequest {
  bookId: string;
  readerId: string;
  expectedReturnDate: string;
}

export interface ReturnBookRequest {
  fineAmount?: number;
  notes?: string;
}

export interface RentalsResponse {
  success: boolean;
  message: string;
  data: {
    rentals: Rental[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalRentals: number;
      rentalsPerPage: number;
    };
  };
}

export interface RentalResponse {
  success: boolean;
  message: string;
  data: {
    rental: Rental;
  };
}

export interface RentalStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalRentals: number;
    activeRentals: number;
    overdueRentals: number;
    totalRevenue: number;
    totalFines: number;
    mostRentedBooks: Array<{
      book: Book;
      rentCount: number;
    }>;
    readerStats: Array<{
      reader: Reader;
      rentCount: number;
      totalSpent: number;
    }>;
  };
}