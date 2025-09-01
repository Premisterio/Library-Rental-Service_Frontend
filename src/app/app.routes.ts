import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BooksListComponent } from './components/books/books-list.component';
import { BookFormComponent } from './components/books/book-form.component';
import { ReadersListComponent } from './components/readers/readers-list.component';
import { ReaderFormComponent } from './components/readers/reader-form.component';
import { RentalsListComponent } from './components/rentals/rentals-list.component';
import { RentalFormComponent } from './components/rentals/rental-form.component';
import { ReturnBookComponent } from './components/rentals/return-book.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  
  // Books routes
  { path: 'books', component: BooksListComponent },
  { path: 'books/add', component: BookFormComponent },
  { path: 'books/edit/:id', component: BookFormComponent },
  
  // Readers routes
  { path: 'readers', component: ReadersListComponent },
  { path: 'readers/add', component: ReaderFormComponent },
  { path: 'readers/edit/:id', component: ReaderFormComponent },
  
  // Rentals routes
  { path: 'rentals', component: RentalsListComponent },
  { path: 'rentals/add', component: RentalFormComponent },
  { path: 'rentals/return/:id', component: ReturnBookComponent },
  { path: 'rentals/reader/:readerId', component: RentalsListComponent },
  { path: 'rentals/:id', component: RentalsListComponent },
  
  { path: '**', redirectTo: '/login' }
];
