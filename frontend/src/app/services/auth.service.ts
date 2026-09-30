import {
  Injectable,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  tap,
  map
} from 'rxjs';

import {
  isPlatformBrowser
} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl =
    'http://localhost:3000/api/auth/bipolar';

  constructor(
    private http: HttpClient,

    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {}

  // =========================
  // CHECK BROWSER
  // =========================

  private isBrowser(): boolean {

    return isPlatformBrowser(
      this.platformId
    );

  }

  // =========================
  // SIGNUP
  // =========================

  signup(data: any): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/signup`,
      data
    ).pipe(

      tap((res: any) => {

        console.log(
          'SIGNUP RESPONSE:',
          res
        );

        if (
          res.token &&
          this.isBrowser()
        ) {

          // TOKEN
          localStorage.setItem(
            'token',
            res.token
          );

          // USER
          localStorage.setItem(
            'user',
            JSON.stringify(res.user)
          );

          // USER ID
          localStorage.setItem(
            'userId',
            String(res.user.id)
          );

          // ROLE
          localStorage.setItem(
            'role',
            res.user.role
          );

          // FULLNAME
          localStorage.setItem(
            'fullname',
            res.user.fullname
          );

        }

      }),

      map((res: any) => res.user)

    );

  }

  // =========================
  // LOGIN
  // =========================

  login(data: any): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/login`,
      data
    ).pipe(

      tap((res: any) => {

        console.log(
          'LOGIN RESPONSE:',
          res
        );

        if (
          res.token &&
          this.isBrowser()
        ) {

          // TOKEN
          localStorage.setItem(
            'token',
            res.token
          );

          // USER
          localStorage.setItem(
            'user',
            JSON.stringify(res.user)
          );

          // USER ID
          localStorage.setItem(
            'userId',
            String(res.user.id)
          );

          // ROLE
          localStorage.setItem(
            'role',
            res.user.role
          );

          // FULLNAME
          localStorage.setItem(
            'fullname',
            res.user.fullname
          );

          console.log(
            'USER ID SAVED:',
            localStorage.getItem('userId')
          );

        }

      }),

      map((res: any) => res.user)

    );

  }

  // =========================
  // PROFILE
  // =========================

  getProfile(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/profile`,
      {

        headers: {

          Authorization:
            `Bearer ${this.getToken()}`

        }

      }
    );

  }

  // =========================
  // TOKEN
  // =========================

  getToken(): string | null {

    return this.isBrowser()

      ? localStorage.getItem('token')

      : null;

  }

  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    if (this.isBrowser()) {

      localStorage.removeItem('token');

      localStorage.removeItem('user');

      localStorage.removeItem('userId');

      localStorage.removeItem('role');

      localStorage.removeItem('fullname');

    }

  }

  // =========================
  // CHECK LOGIN
  // =========================

  isLoggedIn(): boolean {

    return (
      this.isBrowser()
      &&
      !!localStorage.getItem('token')
    );

  }

  // =========================
  // GET USER
  // =========================

  getUser(): any {

    if (!this.isBrowser()) {
      return null;
    }

    const user =
      localStorage.getItem('user');

    return user

      ? JSON.parse(user)

      : null;

  }

}
