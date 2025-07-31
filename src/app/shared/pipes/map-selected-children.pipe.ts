// mapSelectedChildren.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mapSelectedChildren' })
export class MapSelectedChildrenPipe implements PipeTransform {
  transform(
    selectedIds: number[],
    allChildren: { id: number; name: string }[]
  ): string {
    return allChildren
      .filter((c) => selectedIds.includes(c.id))
      .map((c) => c.name)
      .join(', ');
  }
}
