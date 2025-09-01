import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ErrorContext {
  auth?: {
    401?: string;
    409?: string;
  };
  books?: {
    403?: string;
    404?: string;
    409?: string;
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  
  handleError(context: keyof ErrorContext = 'default') {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = 'Сталася невідома помилка';
      
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = this.getErrorMessage(error.status, context);
      }

      return throwError(() => ({ ...error, message: errorMessage }));
    };
  }

  private getErrorMessage(status: number, context: keyof ErrorContext): string {
    // Context-specific error messages
    const contextMessages: ErrorContext = {
      auth: {
        401: 'Невірний email або пароль',
        409: 'Користувач з таким email або іменем уже існує'
      },
      books: {
        403: 'Недостатньо прав для виконання цієї дії',
        404: 'Книга не знайдена',
        409: 'Книга з такою назвою вже існує'
      }
    };

    // Check for context-specific message first
    if (contextMessages[context] && contextMessages[context][status]) {
      return contextMessages[context][status];
    }

    // Default messages
    switch (status) {
      case 400:
        return 'Невірні дані запиту';
      case 401:
        return 'Немає доступу. Увійдіть в систему';
      case 403:
        return 'Недостатньо прав доступу';
      case 404:
        return 'Ресурс не знайдено';
      case 409:
        return 'Конфлікт даних';
      case 422:
        return 'Неправильно заповнені поля';
      case 500:
        return 'Помилка сервера. Спробуйте пізніше';
      case 0:
        return 'Немає зв\'язку з сервером';
      default:
        return `Помилка ${status}: Невідома помилка`;
    }
  }
}