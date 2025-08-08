import { Component } from '@angular/core';
import { ListInvites } from "./list-invites/list-invites";

@Component({
  selector: 'app-invite',
  imports: [ListInvites],
  templateUrl: './invite.html',
  styleUrl: './invite.scss'
})
export class Invite {

}
