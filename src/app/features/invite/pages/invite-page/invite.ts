import { Component, ViewChild } from '@angular/core';
import { ListInvites } from "../../components/list-invites/list-invites";
import { SendInvite } from "../../components/send-invite/send-invite";
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-invite',
  standalone: true, // Adiciona 'standalone'
  imports: [ListInvites, SendInvite, MatTabsModule],
  templateUrl: './invite.html',
  styleUrl: './invite.scss'
})
export class Invite {
  // O @ViewChild deve referenciar a classe do componente MatTabGroup
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  // Este método será chamado para mudar a aba
  changeTab(index: number) {
    if (this.tabGroup) {
      this.tabGroup.selectedIndex = index;
    }
  }
}