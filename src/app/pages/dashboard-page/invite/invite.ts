import { Component } from '@angular/core';
import { ListInvites } from "./list-invites/list-invites";
import { SendInvite } from "./send-invite/send-invite";

@Component({
  selector: 'app-invite',
  imports: [ListInvites, SendInvite],
  templateUrl: './invite.html',
  styleUrl: './invite.scss'
})
export class Invite {

}
