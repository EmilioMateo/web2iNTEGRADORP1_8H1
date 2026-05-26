import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {
  private userService = inject(UserService);
  history$ = this.userService.getOrderHistory();
}

