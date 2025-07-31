import { Component } from '@angular/core';

@Component({
  selector: 'app-print-btn',
  templateUrl: './print-btn.component.html',
  styleUrls: ['./print-btn.component.scss'],
})
export class PrintBtnComponent {
  printPage() {
    window.print();
  }
}
