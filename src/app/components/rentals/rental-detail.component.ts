import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { RentalService } from '../../services/rental.service';
import { AuthService } from '../../services/auth.service';
import { Rental } from '../../models/rental.interface';

@Component({
  selector: 'app-rental-detail',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="rental-detail-header">
      <button mat-icon-button routerLink="/rentals" class="back-button" aria-label="Повернутися до списку орендів">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <h1>Деталі оренди</h1>
    </div>

    <div class="rental-detail-content">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Завантаження деталей оренди...</p>
        </div>
      } @else if (rental()) {
        <mat-card class="rental-detail-card">
          <mat-card-header>
            <mat-card-title>{{ rental()!.book.title }}</mat-card-title>
            <mat-card-subtitle>{{ rental()!.book.author }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="detail-sections">
              <div class="section">
                <h3>Інформація про книгу</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Назва:</label>
                    <span>{{ rental()!.book.title }}</span>
                  </div>
                  <div class="info-item">
                    <label>Автор:</label>
                    <span>{{ rental()!.book.author }}</span>
                  </div>
                  <div class="info-item">
                    <label>Жанр:</label>
                    <span>{{ rental()!.book.genre }}</span>
                  </div>
                  <div class="info-item">
                    <label>Застава:</label>
                    <span>{{ rental()!.book.depositAmount }} грн</span>
                  </div>
                  <div class="info-item">
                    <label>Вартість за день:</label>
                    <span>{{ rental()!.book.rentalPricePerDay }} грн</span>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3>Інформація про читача</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>ПІБ:</label>
                    <span>{{ rental()!.reader.lastName }} {{ rental()!.reader.firstName }} {{ rental()!.reader.middleName || '' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Категорія:</label>
                    <span>{{ getCategoryLabel(rental()!.reader.category) }}</span>
                  </div>
                  <div class="info-item">
                    <label>Телефон:</label>
                    <span>{{ rental()!.reader.phone }}</span>
                  </div>
                  @if (rental()!.reader.email) {
                    <div class="info-item">
                      <label>Email:</label>
                      <span>{{ rental()!.reader.email }}</span>
                    </div>
                  }
                  <div class="info-item">
                    <label>Адреса:</label>
                    <span>{{ rental()!.reader.address }}</span>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3>Деталі оренди</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Дата видачі:</label>
                    <span>{{ formatDate(rental()!.issueDate) }}</span>
                  </div>
                  <div class="info-item">
                    <label>Очікувана дата повернення:</label>
                    <span>{{ formatDate(rental()!.expectedReturnDate) }}</span>
                  </div>
                  @if (rental()!.actualReturnDate) {
                    <div class="info-item">
                      <label>Фактична дата повернення:</label>
                      <span>{{ formatDate(rental()!.actualReturnDate!) }}</span>
                    </div>
                  }
                  <div class="info-item">
                    <label>Статус:</label>
                    <mat-chip [color]="getStatusColor(rental()!.status)">
                      {{ getStatusLabel(rental()!.status) }}
                    </mat-chip>
                  </div>
                  @if (rental()!.isOverdue && rental()!.status === 'active') {
                    <div class="info-item">
                      <label>Прострочено на:</label>
                      <span class="overdue-text">{{ getOverdueDays(rental()!.expectedReturnDate) }} днів</span>
                    </div>
                  }
                </div>
              </div>

              @if (rental()!.status === 'returned' || rental()!.fineAmount || rental()!.discount) {
                <div class="section">
                  <h3>Фінансові деталі</h3>
                  <div class="info-grid">
                    @if (rental()!.totalRentalCost) {
                      <div class="info-item">
                        <label>Вартість оренди:</label>
                        <span>{{ rental()!.totalRentalCost }} грн</span>
                      </div>
                    }
                    @if (rental()!.fineAmount && rental()!.fineAmount! > 0) {
                      <div class="info-item">
                        <label>Штраф:</label>
                        <span class="fine-amount">{{ rental()!.fineAmount }} грн</span>
                      </div>
                    }
                    @if (rental()!.discount && rental()!.discount! > 0) {
                      <div class="info-item">
                        <label>Знижка:</label>
                        <span class="discount-amount">-{{ rental()!.discount }} грн</span>
                      </div>
                    }
                    @if (rental()!.finalAmount) {
                      <div class="info-item final-amount-item">
                        <label>Підсумкова сума:</label>
                        <span class="final-amount">{{ rental()!.finalAmount }} грн</span>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (rental()!.notes) {
                <div class="section">
                  <h3>Примітки</h3>
                  <p class="notes">{{ rental()!.notes }}</p>
                </div>
              }
            </div>
          </mat-card-content>
          
          <mat-card-actions align="start">
            @if (rental()!.status === 'active') {
              <button mat-raised-button color="accent" [routerLink]="['/rentals/return', rental()!._id]">
                <mat-icon>keyboard_return</mat-icon>
                Повернути книгу
              </button>
            }
            <button mat-button routerLink="/rentals">
              <mat-icon>arrow_back</mat-icon>
              Повернутися до списку
            </button>
          </mat-card-actions>
        </mat-card>
      } @else {
        <div class="no-rental">
          <mat-icon>error</mat-icon>
          <h3>Оренда не знайдена</h3>
          <p>Можливо, вказано неправильний ідентифікатор або оренда була видалена</p>
          <button mat-raised-button routerLink="/rentals" color="primary">
            Повернутися до списку орендів
          </button>
        </div>
      }
    </div>
  `,
  styleUrls: ['./rental-detail.component.scss']
})
export class RentalDetailComponent implements OnInit {
  rental = signal<Rental | null>(null);
  loading = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rentalService: RentalService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const rentalId = this.route.snapshot.paramMap.get('id');
    if (rentalId) {
      this.loadRental(rentalId);
    } else {
      this.router.navigate(['/rentals']);
    }
  }


  getStatusLabel(status: string): string {
    const labels = {
      'active': 'Активна',
      'returned': 'Повернено',
      'overdue': 'Прострочена'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getStatusColor(status: string): string {
    const colors = {
      'active': 'primary',
      'returned': 'accent',
      'overdue': 'warn'
    };
    return colors[status as keyof typeof colors] || 'primary';
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

  getOverdueDays(expectedReturnDate: string): number {
    const today = new Date();
    const expectedDate = new Date(expectedReturnDate);
    const diffTime = today.getTime() - expectedDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  private loadRental(id: string): void {
    this.loading.set(true);
    this.rentalService.getRentalById(id).subscribe({
      next: (response) => {
        this.rental.set(response.data.rental);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.snackBar.open(error.message || 'Помилка завантаження деталей оренди', 'Закрити', {
          duration: 5000
        });
        this.router.navigate(['/rentals']);
      }
    });
  }
}