import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './generic-searchBar.html',
  styleUrl: './generic-searchBar.css',
})
export class SearchBar implements OnInit, OnDestroy {
      searchQuery: string = '';

      @Input() placeholder: string = 'Search';
      @Input() set value(val: string){
          this.searchQuery = val;
      }
      @Output() searchChange = new EventEmitter<string>();
      private readonly searchInput$ = new Subject<string>();
      private readonly destroy$ = new Subject<void>();

      ngOnInit(): void {
         this.searchInput$
            .pipe(
               debounceTime(300),
               distinctUntilChanged(),
               switchMap((query) => of(query.trim())),
               takeUntil(this.destroy$),
            )
            .subscribe((query) => this.searchChange.emit(query));
      }

      onSearchChange(value: string): void {
         this.searchInput$.next(value);
      }

      ngOnDestroy(): void {
         this.destroy$.next();
         this.destroy$.complete();
      }
}
