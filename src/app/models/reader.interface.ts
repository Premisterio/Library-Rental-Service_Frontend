export interface Reader {
  _id: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  address: string;
  phone: string;
  email?: string;
  category: 'regular' | 'student' | 'senior';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReaderRequest {
  lastName: string;
  firstName: string;
  middleName?: string;
  address: string;
  phone: string;
  email?: string;
  category: 'regular' | 'student' | 'senior';
}

export interface UpdateReaderRequest {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  address?: string;
  phone?: string;
  email?: string;
  category?: 'regular' | 'student' | 'senior';
}

export interface ReadersResponse {
  success: boolean;
  message: string;
  data: {
    readers: Reader[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalReaders: number;
      readersPerPage: number;
    };
  };
}

export interface ReaderResponse {
  success: boolean;
  message: string;
  data: {
    reader: Reader;
  };
}

export interface ReaderSearchParams {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}