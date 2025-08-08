import { Component } from '@angular/core';
import { ListUsers } from "./list-users/list-users";

@Component({
  selector: 'app-admin',
  imports: [ListUsers],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {

}
