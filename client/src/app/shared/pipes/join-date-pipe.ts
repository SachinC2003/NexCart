import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinDate'
})
export class JoinDatePipe implements PipeTransform {

  transform(date: any): string {
    const rawDate = date

    if (!rawDate) {
      return 'Recently added';
    }

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
      return 'Recently added';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  }

}
