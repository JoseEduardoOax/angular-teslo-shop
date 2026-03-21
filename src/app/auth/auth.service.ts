import { computed, inject, Injectable, signal } from "@angular/core";
import { User } from "./interfaces/user.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { AuthResponse } from "@auth/interfaces/auth-response.interface";
import { catchError, map, Observable, of, tap } from "rxjs";
import { rxResource } from "@angular/core/rxjs-interop";
import { TokenStatus } from "./interfaces/token.interface";

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  private http = inject(HttpClient);

  private tokenStatus = signal<TokenStatus | null>(null);
  private lastCheck = signal<number>(0);
  private checkInProgress = signal<boolean>(false);

  private readonly CACHE_DURATION = 5 * 60 * 1000;

  checkStatusResource = rxResource({
    loader: () => this.checkStatus(),
  })

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) return 'authenticated';

    return 'not-authenticated';
  })

  user = computed<User | null>(() => this._user());
  token = computed(this._token);

  isAdmin = computed(() => this._user()?.roles.includes('admin') ?? false);

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {
      email: email,
      password: password,
    }).pipe(
      map(resp => this.handleAuthSuccess(resp)),
      catchError((error: any) => this.handleAuthError(error))
    );
  }

  checkStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }

    // const now = Date.now();
    //
    // if ((now - this.lastCheck()) > this.CACHE_DURATION) {
    //   this.logout();
    //   return of(false);
    // }

    // if (this.checkInProgress()) {
    //   this.waitForCurrentCheck();
    //   if (this.tokenStatus() != 'valid') {
    //     this.logout();
    //     return of(false);
    //   }
    //
    //   return of(true);
    // }
    //
    // this.checkInProgress.set(true);

    return this.http.get<AuthResponse>(`${baseUrl}/auth/check-status`, {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // }
    }).pipe(
      map((resp) => this.handleAuthSuccess(resp)),
      catchError((error: any) => this.handleAuthError(error))
    );
  }

  private waitForCurrentCheck(): Observable<TokenStatus> {
    return new Observable(subscriber => {
      const interval = setInterval(() => {
        if (!this.checkInProgress()) {
          clearInterval(interval);
          subscriber.next(this.tokenStatus() || 'expired');
          subscriber.complete();
        }
      }, 100);
    });
  }

  logout() {
    this._user.set(null)
    this._token.set(null)
    this._authStatus.set('not-authenticated')

    localStorage.removeItem('token')
  }

  register(fullName: string, email: string, password: string): Observable<boolean> {

    return this.http.post<AuthResponse>(`${baseUrl}/auth/register`, {
      fullName: fullName,
      email: email,
      password: password
    }).pipe(
      map((resp) => this.handleAuthSuccess(resp)),
      catchError((error: any) => this.handleAuthError(error))
    );
  }

  private handleAuthSuccess({ token, user }: AuthResponse) {
    this._user.set(user)
    this._authStatus.set('authenticated');
    this._token.set(token)

    this.tokenStatus.set('valid');
    this.lastCheck.set(Date.now());
    this.checkInProgress.set(false);

    localStorage.setItem('token', token)

    return true;
  }

  private handleAuthError(error: any) {
    this.logout();

    this.tokenStatus.set('expired');
    this.lastCheck.set(Date.now());
    this.checkInProgress.set(false);

    return of(false);
  }
}
