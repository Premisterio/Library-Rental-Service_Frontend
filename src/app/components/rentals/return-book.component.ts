import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RentalService } from '../../services/rental.service';
import { AuthService } from '../../services/auth.service';
import { Rental, ReturnBookRequest } from '../../models/rental.interface';

@Component({
  selector: 'app-return-book',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatIconModule,
    MatToolbarModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="goBack()" aria-label="Повернутися до орендів">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>Повернення книги</span>
    </mat-toolbar>

    <div class="form-container">
      @if (loading && !rental) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Завантаження інформації про оренду...</p>
        </div>
      } @else if (rental) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>Повернення книги</mat-card-title>
            <mat-card-subtitle>Оформлення повернення книги читачем</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>

          <div class="rental-info">
              <h3>Інформація про оренду</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Книга:</strong>
                  <span>{{ rental.book.title }} - {{ rental.book.author }}</span>
                </div>
                <div class="info-item">
                  <strong>Читач:</strong>
                  <span>{{ rental.reader.lastName }} {{ rental.reader.firstName }}</span>
                </div>
                <div class="info-item">
                  <strong>Категорія читача:</strong>
                  <span>{{ getCategoryLabel(rental.reader.category) }}</span>
                </div>
                <div class="info-item">
                  <strong>Дата видачі:</strong>
                  <span>{{ formatDate(rental.issueDate) }}</span>
                </div>
                <div class="info-item">
                  <strong>Очікувана дата повернення:</strong>
                  <span>{{ formatDate(rental.expectedReturnDate) }}</span>
                </div>
                <div class="info-item">
                  <strong>Дні прокату:</strong>
                  <span>{{ daysRented }} {{ daysRented === 1 ? 'день' : daysRented < 5 ? 'дні' : 'днів' }}</span>
                </div>
              </div>

              <mat-chip-set>
                <mat-chip [color]="rental.isOverdue ? 'warn' : 'primary'">
                  {{ rental.isOverdue ? 'Прострочена оренда' : 'Вчасне повернення' }}
                </mat-chip>
                @if (rental.isOverdue) {
                  <mat-chip color="warn">
                    Прострочення: {{ overdueDays }} {{ overdueDays === 1 ? 'день' : overdueDays < 5 ? 'дні' : 'днів' }}
                  </mat-chip>
                }
              </mat-chip-set>
            </div>

            <!-- Cost Calculation -->
            <div class="cost-calculation">
              <h3>Розрахунок вартості</h3>
              <div class="cost-details">
                <div class="cost-item">
                  <span>Вартість за {{ daysRented }} {{ daysRented === 1 ? 'день' : daysRented < 5 ? 'дні' : 'днів' }}:</span>
                  <span>{{ baseCost }} грн</span>
                </div>
                
                @if (discount > 0) {
                  <div class="cost-item discount">
                    <span>Знижка ({{ discountPercentage }}%):</span>
                    <span>-{{ discount }} грн</span>
                  </div>
                }
                
                @if (overdueFine > 0) {
                  <div class="cost-item fine">
                    <span>Штраф за прострочення:</span>
                    <span>{{ overdueFine }} грн</span>
                  </div>
                }
                
                <div class="cost-item total">
                  <span><strong>Підсумок до сплати:</strong></span>
                  <span><strong>{{ totalAmount }} грн</strong></span>
                </div>
              </div>
            </div>

            <form [formGroup]="returnForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Додатковий штраф (грн)</mat-label>
                  <input matInput 
                         type="number" 
                         formControlName="fineAmount" 
                         placeholder="0"
                         (input)="onFineAmountChange()">
                  <mat-hint>Штраф за пошкодження або інші порушення</mat-hint>
                  @if (returnForm.get('fineAmount')?.hasError('min')) {
                    <mat-error>Штраф не може бути від'ємним</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Примітки</mat-label>
                  <textarea matInput 
                            formControlName="notes" 
                            rows="3"
                            placeholder="Додаткові коментарі щодо повернення..."></textarea>
                </mat-form-field>
              </div>

              @if (additionalFine > 0) {
                <div class="additional-fine">
                  <p><strong>Додатковий штраф:</strong> {{ additionalFine }} грн</p>
                  <p><strong>Загальна сума до сплати:</strong> {{ finalTotalAmount }} грн</p>
                </div>
              }
            </form>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button type="button" (click)="goBack()">Скасувати</button>
            <button mat-raised-button 
                    color="primary" 
                    type="submit" 
                    [disabled]="returnForm.invalid || loading"
                    (click)="onSubmit()">
              @if (loading) {
                Обробка...
              } @else {
                Підтвердити повернення
              }
            </button>
          </mat-card-actions>
        </mat-card>
      } @else {
        <div class="error-container">
          <mat-icon>error</mat-icon>
          <h3>Помилка</h3>
          <p>Неможливо завантажити інформацію про оренду</p>
          <button mat-raised-button (click)="goBack()">Повернутися назад</button>
        </div>
      }
    </div>
  `,
  styleUrls: ['./return-book.component.scss']
})
export class ReturnBookComponent implements OnInit {
  returnForm!: FormGroup;
  loading = false;
  rental: Rental | null = null;
  rentalId?: string;

  // Calculated values
  daysRented = 0;
  overdueDays = 0;
  baseCost = 0;
  discount = 0;
  discountPercentage = 0;
  overdueFine = 0;
  additionalFine = 0;
  totalAmount = 0;
  finalTotalAmount = 0;

  constructor(
    private fb: FormBuilder,
    private rentalService: RentalService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.rentalId = this.route.snapshot.params['id'];
    if (this.rentalId) {
      this.loadRental(this.rentalId);
    } else {
      this.router.navigate(['/rentals']);
    }
  }

  private initializeForm(): void {
    this.returnForm = this.fb.group({
      fineAmount: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  private loadRental(id: string): void {
    this.loading = true;
    this.rentalService.getRentalById(id).subscribe({
      next: (response) => {
        this.rental = response.data.rental;
        this.calculateCosts();
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка завантаження оренди', 'Закрити', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  private calculateCosts(): void {
    if (!this.rental) return;

    const issueDate = new Date(this.rental.issueDate);
    const expectedReturnDate = new Date(this.rental.expectedReturnDate);
    const today = new Date();

    // Calculate days rented
    const diffTime = today.getTime() - issueDate.getTime();
    this.daysRented = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (this.daysRented < 1) this.daysRented = 1;

    // Calculate overdue days
    if (today > expectedReturnDate) {
      const overdueTime = today.getTime() - expectedReturnDate.getTime();
      this.overdueDays = Math.ceil(overdueTime / (1000 * 60 * 60 * 24));
    } else {
      this.overdueDays = 0;
    }

    // Calculate base cost
    this.baseCost = this.daysRented * this.rental.book.rentalPricePerDay;

    // Calculate discount based on reader category
    switch (this.rental.reader.category) {
      case 'student':
        this.discountPercentage = 20;
        this.discount = this.baseCost * 0.2;
        break;
      case 'senior':
        this.discountPercentage = 15;
        this.discount = this.baseCost * 0.15;
        break;
      default:
        this.discountPercentage = 0;
        this.discount = 0;
    }

    // Calculate overdue fine (50% of daily rate per overdue day)
    if (this.overdueDays > 0) {
      this.overdueFine = this.overdueDays * (this.rental.book.rentalPricePerDay * 0.5);
    }

    this.calculateTotalAmount();
  }

  private calculateTotalAmount(): void {
    this.additionalFine = this.returnForm.get('fineAmount')?.value || 0;
    this.totalAmount = this.baseCost - this.discount + this.overdueFine;
    this.finalTotalAmount = this.totalAmount + this.additionalFine;
  }

  onFineAmountChange(): void {
    this.calculateTotalAmount();
  }

  getCategoryLabel(category: string): string {
    const labels = {
      'regular': 'Звичайний',
      'student': 'Студент',
      'senior': 'Пенсіонер'
    };
    return labels[category as keyof typeof labels] || category;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA');
  }


  onSubmit(): void {
    if (this.returnForm.invalid || !this.rental) {
      return;
    }

    this.loading = true;
    const returnData: ReturnBookRequest = {
      fineAmount: this.finalTotalAmount,
      notes: this.returnForm.value.notes || undefined
    };

    this.rentalService.returnBook(this.rental._id, returnData).subscribe({
      next: () => {
        this.snackBar.open('Книгу успішно повернено', 'Закрити', {
          duration: 3000
        });
        this.router.navigate(['/rentals']);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка повернення книги', 'Закрити', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}