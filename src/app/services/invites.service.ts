import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

// DTO for a single invite
export interface SendInviteDto {
  sender: string;
  email: string;
}

export interface InviteDto {
  email: string;
  status: string;
}

// DTO for the paginated response from the backend
export interface InvitesResponseDto {
  invites: InviteDto[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class InviteService {
  private baseUrl = 'http://localhost:3000/invites';
  private http = inject(HttpClient);

  // Signal for refreshing data
  private refreshSignal = signal(0);
  public refreshNeeded = this.refreshSignal.asReadonly();

  // Method to send an invite
  sendInvite(invite: SendInviteDto): Observable<any> {
    return this.http.post(this.baseUrl, invite, { responseType: 'text' }).pipe(
      tap(() => {
        this.refreshSignal.set(this.refreshSignal() + 1);
      })
    );
  }

  // Refactored method to get invites with server-side pagination
  getInvites(
    sender: string,
    page: number,
    limit: number
  ): Observable<InvitesResponseDto> {
    let params = new HttpParams()
      .set('sender', sender)
      .set('page', page.toString()) // Set page parameter
      .set('limit', limit.toString()); // Set limit parameter

    // The endpoint is just the base URL, as the controller now handles queries
    return this.http.get<InvitesResponseDto>(this.baseUrl, { params: params });
  }
}