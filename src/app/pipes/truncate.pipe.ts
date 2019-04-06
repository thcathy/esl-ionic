import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit = 20, ellipsis = '...') {
    if (value.length > limit) {
      return `${value.substr(0, limit - ellipsis.length)}${ellipsis}`;
    } else {
      return value;
    }
  }

}
