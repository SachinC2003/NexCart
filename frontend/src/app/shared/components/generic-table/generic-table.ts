import { Component, EventEmitter, Input, Output } from '@angular/core';
import Table, { TableRow } from '../../../types/table.type';

@Component({
  selector: 'app-generic-table',
  imports: [],
  standalone: true,
  templateUrl: './generic-table.html',
  styleUrl: './generic-table.css',
})
export class GenericTable {
      @Input() tableData!: Table;
      @Output() actionEvent = new EventEmitter<TableRow>();

      onActionButtonClick(rowData: TableRow, callback: (rowData: TableRow) => void) {
         this.actionEvent.emit(rowData);
         callback(rowData);
      }
}
