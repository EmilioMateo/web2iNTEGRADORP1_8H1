import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { formatXmlForDownload } from '../../utils/xml-download.util';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent implements OnInit {
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  ticketXml = '';
  ordenPaypal = '';
  xmlColoreado: SafeHtml = '';

  ngOnInit(): void {
    const state = window.history.state as { xml?: string; ordenPaypal?: string };

    if (state?.xml) {
      this.ticketXml = state.xml;
      this.ordenPaypal = state.ordenPaypal || '';
      this.xmlColoreado = this.sanitizer.bypassSecurityTrustHtml(this.colorearXml(state.xml));
    } else {
      this.router.navigate(['/introduccion']);
    }
  }

  private colorearXml(xml: string): string {
    let escaped = xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    escaped = escaped.replace(
      /(&lt;\/?)([\w:]+)([^&]*?)(\/?&gt;)/g,
      (_m, open, tag, attrs, close) => {
        const coloredAttrs = attrs.replace(
          /([\w:]+)(=)(&quot;[^&]*&quot;|"[^"]*")/g,
          '<span class="xml-attr">$1</span><span class="xml-eq">$2</span><span class="xml-val">&quot;$3&quot;</span>'
        ).replace(/="([^"]*)"/g, '=<span class="xml-val">"$1"</span>');
        return `<span class="xml-bracket">${open}</span><span class="xml-tag">${tag}</span>${coloredAttrs}<span class="xml-bracket">${close}</span>`;
      }
    );

    escaped = escaped.replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="xml-comment">$1</span>'
    );

    escaped = escaped.replace(/&quot;"([^"]+)"&quot;/g, '<span class="xml-val">"$1"</span>');

    return escaped;
  }

  descargarXML(): void {
    const xmlFormateado = formatXmlForDownload(this.ticketXml);
    
    const blob = new Blob([xmlFormateado], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo_cfdi_${this.ordenPaypal || 'compra'}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  }

  irAlHistorial(): void {
    this.router.navigate(['/history']);
  }

  irAlCatalogo(): void {
    this.router.navigate(['/Catalogo']);
  }
}
