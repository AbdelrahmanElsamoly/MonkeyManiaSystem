import {
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ElementRef,
} from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent {
  @Input() items: any[] = [];
  @Input() itemTemplate!: TemplateRef<any>;

  @ViewChild('carouselWrapper', { static: false }) carouselWrapper!: ElementRef;

  scrollLeft() {
    this.carouselWrapper.nativeElement.scrollBy({
      left: -300,
      behavior: 'smooth',
    });
  }

  scrollRight() {
    this.carouselWrapper.nativeElement.scrollBy({
      left: 300,
      behavior: 'smooth',
    });
  }
}
