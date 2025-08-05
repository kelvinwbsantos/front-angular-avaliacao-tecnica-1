import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface invite {
  email: string;
  sender: string;
}

@Injectable({
  providedIn: 'root'
})
export class InviteService {
  private baseUrl = 'http://localhost:3000/invites';

  private http = inject(HttpClient);

  sendInvite(invite: invite) {
    return this.http.post(this.baseUrl, invite);
  }

}
