export interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  depositAmount: number;
  rentalPricePerDay: number;
  totalCopies: number;
  availableCopies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  genre: string;
  depositAmount: number;
  rentalPricePerDay: number;
  totalCopies: number;
  availableCopies: number;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  genre?: string;
  depositAmount?: number;
  rentalPricePerDay?: number;
  totalCopies?: number;
  availableCopies?: number;
}

export interface BooksResponse {
  success: boolean;
  message: string;
  data: {
    books: Book[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalBooks: number;
      booksPerPage: number;
    };
  };
}

export interface BookResponse {
  success: boolean;
  message: string;
  data: {
    book: Book;
  };
}

export interface BookSearchParams {
  search?: string;
  genre?: string;
  author?: string;
  available?: boolean;
  page?: number;
  limit?: number;
}