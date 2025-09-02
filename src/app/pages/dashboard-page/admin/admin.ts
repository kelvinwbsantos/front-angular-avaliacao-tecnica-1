import { Component } from '@angular/core';
import { ListUsers } from "./list-users/list-users";
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin',
  imports: [ListUsers, MatTabsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {

}
