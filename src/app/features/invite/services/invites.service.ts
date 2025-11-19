import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface SendInviteDto {
  sender: string;
  email: string;
}

export interface InviteDto {
  email: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface InvitesResponseDto {
  invites: InviteDto[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class InviteService {
  private readonly API_URL = environment.apiUrl;
  private readonly BASE_PATH = `${this.API_URL}/invites`;
  
  private http = inject(HttpClient);

  private refreshSignal = signal(0);
  public refreshNeeded = this.refreshSignal.asReadonly();

  sendInvite(invite: SendInviteDto): Observable<any> {
    return this.http.post(this.API_URL, invite, { responseType: 'text' }).pipe(
      tap(() => {
        this.refreshSignal.set(this.refreshSignal() + 1);
      })
    );
  }

  getInvites(
    sender: string,
    email: string | null,
    status: string | null,
    page: number,
    limit: number
  ): Observable<InvitesResponseDto> {
    let params = new HttpParams()
      .set('sender', sender)
      .set('email', email ?? '')
      .set('status', status ?? '')
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<InvitesResponseDto>(this.API_URL, { params: params });
  }
}