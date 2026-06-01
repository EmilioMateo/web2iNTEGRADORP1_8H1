import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { OrderHistoryItem } from '../../../models/user.model';
import { formatXmlForDownload } from '../../../utils/xml-download.util';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {
  private userService = inject(UserService);
  history$ = this.userService.getOrderHistory();

  descargarXml(item: OrderHistoryItem): void {
    if (!item.xml_cfdi) return;

    const xmlFormateado = formatXmlForDownload(item.xml_cfdi);

    const blob = new Blob([xmlFormateado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo_cfdi_${item.orden_paypal || item.id}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
