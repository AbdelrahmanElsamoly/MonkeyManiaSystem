import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs/esm';
import { LocaleConfig } from 'ngx-daterangepicker-material';

export interface DateTimeRangeValue {
  start: Date | null;
  end: Date | null;
}

export interface DateTimeRangeChange extends DateTimeRangeValue {
  startTimestamp: string | null;
  endTimestamp: string | null;
}

interface PickerRange {
  startDate: Dayjs;
  endDate: Dayjs;
}

type TimeMenu = 'startHour' | 'startMinute' | 'startPeriod' | 'endHour' | 'endMinute' | 'endPeriod' | null;
type TimeEdge = 'start' | 'end';
type TimePeriod = 'AM' | 'PM';
type PickerOpenDirection = 'left' | 'center' | 'right';

export function formatTimestampWithOffset(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(absoluteOffset / 60);
  const offsetRemainderMinutes = absoluteOffset % 60;
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:00${sign}${pad(offsetHours)}:${pad(offsetRemainderMinutes)}`;
}

@Component({
  selector: 'app-date-time-range-filter',
  templateUrl: './date-time-range-filter.component.html',
  styleUrls: ['./date-time-range-filter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DateTimeRangeFilterComponent implements OnChanges {
  @Input() value: DateTimeRangeValue = { start: null, end: null };
  @Input() disabled = false;
  @Input() label = 'SELECT_DATE_RANGE';

  @Output() rangeChange = new EventEmitter<DateTimeRangeChange>();

  selected: PickerRange | null = null;
  activeTimeMenu: TimeMenu = null;
  pickerOpenDirection: PickerOpenDirection = 'center';

  startHour = 12;
  startMinute = 0;
  startPeriod: TimePeriod = 'AM';
  endHour = 11;
  endMinute = 59;
  endPeriod: TimePeriod = 'PM';

  readonly hours = Array.from({ length: 12 }, (_, index) => index + 1);
  readonly minutes = Array.from({ length: 60 }, (_, index) => index);
  readonly periods: TimePeriod[] = ['AM', 'PM'];

  readonly locale: LocaleConfig = {
    format: 'DD/MM/YYYY',
    displayFormat: 'DD/MM/YYYY',
    separator: ' - ',
    applyLabel: '\u062A\u0637\u0628\u064A\u0642',
    cancelLabel: '\u0625\u0644\u063A\u0627\u0621',
    customRangeLabel: '\u062A\u0627\u0631\u064A\u062E \u0645\u062E\u0635\u0635',
    daysOfWeek: [
      '\u0627\u0644\u0623\u062D\u062F',
      '\u0627\u0644\u0627\u062B\u0646\u064A\u0646',
      '\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621',
      '\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621',
      '\u0627\u0644\u062E\u0645\u064A\u0633',
      '\u0627\u0644\u062C\u0645\u0639\u0629',
      '\u0627\u0644\u0633\u0628\u062A',
    ],
    monthNames: [
      '\u064A\u0646\u0627\u064A\u0631',
      '\u0641\u0628\u0631\u0627\u064A\u0631',
      '\u0645\u0627\u0631\u0633',
      '\u0623\u0628\u0631\u064A\u0644',
      '\u0645\u0627\u064A\u0648',
      '\u064A\u0648\u0646\u064A\u0648',
      '\u064A\u0648\u0644\u064A\u0648',
      '\u0623\u063A\u0633\u0637\u0633',
      '\u0633\u0628\u062A\u0645\u0628\u0631',
      '\u0623\u0643\u062A\u0648\u0628\u0631',
      '\u0646\u0648\u0641\u0645\u0628\u0631',
      '\u062F\u064A\u0633\u0645\u0628\u0631',
    ],
    firstDay: 0,
  };

  readonly ranges: { [key: string]: [Dayjs, Dayjs] } = {
    '\u0627\u0644\u064A\u0648\u0645': [dayjs().startOf('day'), dayjs().endOf('day')],
    '\u0623\u0645\u0633': [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')],
    '3 \u0623\u064A\u0627\u0645': [dayjs().subtract(2, 'day').startOf('day'), dayjs().endOf('day')],
    '5 \u0623\u064A\u0627\u0645': [dayjs().subtract(4, 'day').startOf('day'), dayjs().endOf('day')],
    '\u0623\u0633\u0628\u0648\u0639': [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')],
    '\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631': [dayjs().startOf('month'), dayjs().endOf('month')],
  };
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.selected = this.value.start && this.value.end
        ? {
            startDate: dayjs(this.value.start),
            endDate: dayjs(this.value.end),
          }
        : null;

      if (this.value.start) {
        this.setTimeFromDate('start', this.value.start);
      }

      if (this.value.end) {
        this.setTimeFromDate('end', this.value.end);
      }
    }
  }

  onDatesUpdated(range: PickerRange | null): void {
    if (!range?.startDate || !range?.endDate) {
      this.emitRange(null, null);
      return;
    }

    this.selected = range;
    this.emitSelectedRange();
  }

  onClear(): void {
    this.selected = null;
    this.emitRange(null, null);
  }

  toggleTimeMenu(menu: TimeMenu, event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }

    this.activeTimeMenu = this.activeTimeMenu === menu ? null : menu;
  }

  selectHour(edge: TimeEdge, hour: number): void {
    if (edge === 'start') {
      this.startHour = hour;
    } else {
      this.endHour = hour;
    }

    this.activeTimeMenu = null;
  }

  selectMinute(edge: TimeEdge, minute: number): void {
    if (edge === 'start') {
      this.startMinute = minute;
    } else {
      this.endMinute = minute;
    }

    this.activeTimeMenu = null;
  }

  selectPeriod(edge: TimeEdge, period: TimePeriod): void {
    if (edge === 'start') {
      this.startPeriod = period;
    } else {
      this.endPeriod = period;
    }

    this.activeTimeMenu = null;
  }

  pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  applyRange(): void {
    this.activeTimeMenu = null;
    this.emitSelectedRange();
  }

  preparePickerOpen(event?: Event): void {
    if (typeof window === 'undefined') {
      return;
    }

    const trigger = event?.target instanceof HTMLElement ? event.target : null;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 12;
      const estimatedPickerWidth = Math.min(520, window.innerWidth - viewportPadding * 2);
      const leftSpace = rect.left - viewportPadding;
      const rightSpace = window.innerWidth - rect.right - viewportPadding;

      if (rightSpace < estimatedPickerWidth / 2 && leftSpace > rightSpace) {
        this.pickerOpenDirection = 'left';
      } else if (leftSpace < estimatedPickerWidth / 2 && rightSpace > leftSpace) {
        this.pickerOpenDirection = 'right';
      } else {
        this.pickerOpenDirection = 'center';
      }
    }

    this.schedulePickerClamp();
  }

  @HostListener('window:resize')
  schedulePickerClamp(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    [0, 60, 180, 320].forEach((delay) => {
      window.setTimeout(() => this.clampOpenPickerToViewport(), delay);
    });
  }

  private clampOpenPickerToViewport(): void {
    const picker = document.querySelector<HTMLElement>('.md-drppicker.shown');
    if (!picker) {
      return;
    }

    const viewportPadding = 12;
    picker.style.transform = '';

    const rect = picker.getBoundingClientRect();
    let shiftX = 0;

    if (rect.right > window.innerWidth - viewportPadding) {
      shiftX = window.innerWidth - viewportPadding - rect.right;
    }

    if (rect.left + shiftX < viewportPadding) {
      shiftX += viewportPadding - (rect.left + shiftX);
    }

    picker.style.right = 'auto';
    picker.style.transform = shiftX ? `translateX(${shiftX}px)` : '';
  }

  private emitSelectedRange(): void {
    if (!this.selected?.startDate || !this.selected?.endDate) {
      return;
    }

    const start = this.withTime(this.selected.startDate.toDate(), 'start');
    const end = this.withTime(this.selected.endDate.toDate(), 'end');
    this.emitRange(start, end);
  }

  private emitRange(start: Date | null, end: Date | null): void {
    this.rangeChange.emit({
      start,
      end,
      startTimestamp: start ? formatTimestampWithOffset(start) : null,
      endTimestamp: end ? formatTimestampWithOffset(end) : null,
    });
  }

  private withTime(date: Date, edge: TimeEdge): Date {
    const next = new Date(date);
    const hour = edge === 'start' ? this.to24Hour(this.startHour, this.startPeriod) : this.to24Hour(this.endHour, this.endPeriod);
    const minute = edge === 'start' ? this.startMinute : this.endMinute;
    next.setHours(hour, minute, 0, 0);
    return next;
  }

  private setTimeFromDate(edge: TimeEdge, date: Date): void {
    const hour24 = date.getHours();
    const period: TimePeriod = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;

    if (edge === 'start') {
      this.startHour = hour12;
      this.startMinute = date.getMinutes();
      this.startPeriod = period;
    } else {
      this.endHour = hour12;
      this.endMinute = date.getMinutes();
      this.endPeriod = period;
    }
  }

  private to24Hour(hour: number, period: TimePeriod): number {
    if (period === 'AM') {
      return hour === 12 ? 0 : hour;
    }

    return hour === 12 ? 12 : hour + 12;
  }
}










