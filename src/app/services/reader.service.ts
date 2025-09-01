import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './shared/error-handler.service';
import { 
  Reader, 
  ReadersResponse, 
  ReaderResponse, 
  CreateReaderRequest, 
  UpdateReaderRequest, 
  ReaderSearchParams 
} from '../models/reader.interface';

@Injectable({
  providedIn: 'root'
})

export class ReaderService {
  private readonly apiUrl = `${environment.apiUrl}/readers`;
  
  readers = signal<Reader[]>([]);
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

  getAllReaders(params?: ReaderSearchParams): Observable<ReadersResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.q) httpParams = httpParams.set('q', params.q);
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }

    this.loading.set(true);
    return this.http.get<ReadersResponse>(this.apiUrl, { 
      headers: this.getHeaders(),
      params: httpParams 
    }).pipe(
      tap(response => {
        this.readers.set(response.data.readers);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return this.errorHandler.handleError('readers')(error);
      })
    );
  }

  getReaderById(id: string): Observable<ReaderResponse> {
    return this.http.get<ReaderResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.errorHandler.handleError('readers'))
    );
  }

  createReader(reader: CreateReaderRequest): Observable<ReaderResponse> {
    return this.http.post<ReaderResponse>(this.apiUrl, reader, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.getAllReaders().subscribe();
      }),
      catchError(this.errorHandler.handleError('readers'))
    );
  }

  updateReader(id: string, updates: UpdateReaderRequest): Observable<ReaderResponse> {
    return this.http.put<ReaderResponse>(`${this.apiUrl}/${id}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.getAllReaders().subscribe();
      }),
      catchError(this.errorHandler.handleError('readers'))
    );
  }

  deleteReader(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.getAllReaders().subscribe();
      }),
      catchError(this.errorHandler.handleError('readers'))
    );
  }

  searchReaders(query: string): Observable<ReadersResponse> {
    return this.http.get<ReadersResponse>(`${this.apiUrl}/search`, {
      headers: this.getHeaders(),
      params: new HttpParams().set('q', query)
    }).pipe(
      catchError(this.errorHandler.handleError('readers'))
    );
  }

  getReadersByCategory(category: string): Observable<ReadersResponse> {
    return this.http.get<ReadersResponse>(`${this.apiUrl}/category/${category}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.errorHandler.handleError('readers'))
    );
  }
}