import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface InviteRequest {
  email: string;
  sender: string;
}

export interface InviteResponse {
  email: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class InviteService {
  private baseUrl = 'http://localhost:3000/invites';

  private http = inject(HttpClient);

  sendInvite(invite: InviteRequest) {
    return this.http.post(this.baseUrl, invite);
  }

  getInvites(senderEmail?: string): Observable<InviteResponse[]> {
    let params = new HttpParams();

    if (senderEmail) {
      params = params.set('senderEmail', senderEmail);
    }

    return this.http.get<InviteResponse[]>(`${this.baseUrl}/getInvites`, { params: params });
  }
}
