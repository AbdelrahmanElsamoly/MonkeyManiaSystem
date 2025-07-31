import {
  Component,
  Input,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements AfterViewInit {
  @Input() collapsed = false;

  @ViewChildren(MatExpansionPanel) panels!: QueryList<MatExpansionPanel>;
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('ar');
    translate.use('ar');
    document.body.dir = 'rtl';
  }
  ngAfterViewInit(): void {
    this.collapsePanelsIfSidebarCollapsed();
  }

  ngOnChanges() {
    this.collapsePanelsIfSidebarCollapsed();
  }

  collapsePanelsIfSidebarCollapsed() {
    if (this.collapsed && this.panels) {
      setTimeout(() => {
        this.panels.forEach((panel) => panel.close());
      });
    }
  }
}
