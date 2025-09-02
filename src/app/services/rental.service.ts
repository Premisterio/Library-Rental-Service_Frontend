import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './shared/error-handler.service';
import { 
  Rental, 
  RentalsResponse, 
  RentalResponse, 
  CreateRentalRequest, 
  ReturnBookRequest,
  RentalStatsResponse
} from '../models/rental.interface';

@Injectable({
  providedIn: 'root'
})
export class RentalService {
  private readonly apiUrl = `${environment.apiUrl}/rentals`;
  
  rentals = signal<Rental[]>([]);
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

  getAllRentals(): Observable<RentalsResponse> {
    this.loading.set(true);
    return this.http.get<RentalsResponse>(this.apiUrl, { 
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        this.rentals.set(response.data.rentals);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return this.errorHandler.handleError('rentals')(error);
      })
    );
  }

  getActiveRentals(): Observable<RentalsResponse> {
    this.loading.set(true);
    return this.http.get<RentalsResponse>(`${this.apiUrl}/active`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        this.rentals.set(response.data.rentals);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return this.errorHandler.handleError('rentals')(error);
      })
    );
  }

  getOverdueRentals(): Observable<RentalsResponse> {
    this.loading.set(true);
    return this.http.get<RentalsResponse>(`${this.apiUrl}/overdue`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        this.rentals.set(response.data.rentals);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return this.errorHandler.handleError('rentals')(error);
      })
    );
  }

  getRentalStats(): Observable<RentalStatsResponse> {
    return this.http.get<RentalStatsResponse>(`${this.apiUrl}/stats`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.errorHandler.handleError('rentals'))
    );
  }

  getReaderRentals(readerId: string): Observable<RentalsResponse> {
    this.loading.set(true);
    return this.http.get<RentalsResponse>(`${this.apiUrl}/reader/${readerId}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        this.rentals.set(response.data.rentals);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return this.errorHandler.handleError('rentals')(error);
      })
    );
  }

  getRentalById(id: string): Observable<RentalResponse> {
    return this.http.get<RentalResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.errorHandler.handleError('rentals'))
    );
  }

  createRental(rental: CreateRentalRequest): Observable<RentalResponse> {
    return this.http.post<RentalResponse>(this.apiUrl, rental, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.getAllRentals().subscribe();
      }),
      catchError(this.errorHandler.handleError('rentals'))
    );
  }

  returnBook(id: string, returnData: ReturnBookRequest): Observable<RentalResponse> {
    return this.http.put<RentalResponse>(`${this.apiUrl}/${id}/return`, returnData, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        this.getAllRentals().subscribe();
      }),
      catchError(this.errorHandler.handleError('rentals'))
    );
  }
}