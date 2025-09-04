import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './shared/error-handler.service';
import { 
  Book, 
  BooksResponse, 
  BookResponse, 
  CreateBookRequest, 
  UpdateBookRequest, 
  BookSearchParams 
} from '../models/book.interface';

@Injectable({
  providedIn: 'root'
})

export class BookService {
  private readonly apiUrl = `${environment.apiUrl}/books`;
  
  books = signal<Book[]>([]);
  loading = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  getAllBooks(params?: BookSearchParams): Observable<BooksResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.genre) httpParams = httpParams.set('genre', params.genre);
      if (params.author) httpParams = httpParams.set('author', params.author);
      if (params.available !== undefined) httpParams = httpParams.set('available', params.available.toString());
    }
    
    // Remove pagination limit, pagination is not implemented
    httpParams = httpParams.set('limit', '200');

    this.loading.set(true);
    return this.http.get<BooksResponse>(this.apiUrl, { 
      headers: this.getHeaders(),
      params: httpParams 
    }).pipe(
      tap(response => {
        this.books.set(response.data.books);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return this.errorHandler.handleError('books')(error);
      })
    );
  }

  getAvailableBooks(): Observable<BooksResponse> {
    this.loading.set(true);
    return this.http.get<BooksResponse>(`${this.apiUrl}/available`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        this.books.set(response.data.books);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return this.errorHandler.handleError('books')(error);
      })
    );
  }

  getBookById(id: string): Observable<BookResponse> {
    return this.http.get<BookResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.errorHandler.handleError('books'))
    );
  }

  createBook(book: CreateBookRequest): Observable<BookResponse> {
    return this.http.post<BookResponse>(this.apiUrl, book, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        // Refresh books list after creation
        this.getAllBooks().subscribe();
      }),
      catchError(this.errorHandler.handleError('books'))
    );
  }

  updateBook(id: string, updates: UpdateBookRequest): Observable<BookResponse> {
    return this.http.put<BookResponse>(`${this.apiUrl}/${id}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        // Refresh books list after update
        this.getAllBooks().subscribe();
      }),
      catchError(this.errorHandler.handleError('books'))
    );
  }

  deleteBook(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        // Refresh books list after deletion
        this.getAllBooks().subscribe();
      }),
      catchError(this.errorHandler.handleError('books'))
    );
  }

  searchBooks(query: string): Observable<BooksResponse> {
    return this.getAllBooks({ search: query });
  }

  getBooksByGenre(genre: string): Observable<BooksResponse> {
    return this.http.get<BooksResponse>(`${this.apiUrl}/genre/${genre}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.errorHandler.handleError('books'))
    );
  }

}