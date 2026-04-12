import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import Table, { TableRow } from '../../../types/table.type';
import { Utils } from '../../../shared/utils';
import { UpdateUserStatusResponse, UserService } from '../../../core/services/user.service';
import { StatsPageUser, StatsResponse } from '../../../types/entityTypes';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '../../../shared/pipes/currency-pipe';
import { JoinDatePipe } from '../../../shared/pipes/join-date-pipe';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [GenericTable],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class Stats {
  private utils = new Utils();
  private currencyPipe = new CurrencyPipe();
  private joinDatePipe = new JoinDatePipe();
  private destroyRef = inject(DestroyRef);
  constructor(private route : ActivatedRoute,
              private router: Router,
              private userSer : UserService,
              private toast: ToastrService
  ){}
  stats: StatsResponse | null = null;
  users: StatsPageUser[] = [];
  errorMessage: string | null = null;
  loading: boolean = true;
  tableData: Table = {
    name: 'User Activity',
    columns: ['Name', 'Email', 'Role', 'Status', 'Joined'],
    data: [],
    actionButtons: [
      {
        label: 'Activate',
        callback: (rowData: TableRow) => this.activateUser(rowData),
      },
      {
        label: 'Deactivate',
        callback: (rowData: TableRow) => this.deactivateUser(rowData),
      },
    ],
  };

  ngOnInit(): void{
      this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
           const stats = data['stats']?.stats ?? data['stats'];

           if(!stats){
              this.errorMessage = 'We could not load the stats.';
              this.loading = false;
              return;
           }
           this.stats = stats;
           this.users = stats.users ?? [];
           this.refreshTableData();
           this.loading = false;
      })
  }

  get statCards() {
    return [
      {
        label: 'Total Users',
        value: this.utils.formatNumber(this.stats?.totalUsers),
        tone: 'users',
      },
      {
        label: 'Orders',
        value: this.utils.formatNumber(this.stats?.totalOrders),
        tone: 'orders',
      },
      {
        label: 'Revenue',
        value: this.currencyPipe.transform(this.stats?.totalRevenue),
        tone: 'revenue',
      },
      {
        label: 'Products',
        value: this.utils.formatNumber(this.stats?.totalProducts),
        tone: 'products',
      },
    ];
  }

  onActionEvent(rowData: TableRow) {
    console.log('Stats table action:', rowData);
  }

  private refreshTableData(): void {
    this.tableData = {
      ...this.tableData,
      data: this.users.map((user) => [
        user.name,
        user.email,
        this.utils.toTitleCase(user.role ?? 'user'),
        this.getUserStatus(user),
        
        this.joinDatePipe.transform(user.createdAt),
      ]),
    };
  }

  private activateUser(rowData: TableRow): void {
    this.updateUserStatus(rowData, 'Active');
  }

  private deactivateUser(rowData: TableRow): void {
    this.updateUserStatus(rowData, 'Inactive');
  }

  private updateUserStatus(rowData: TableRow, nextStatus: string): void {
    const [name, email] = rowData;

    if (typeof name !== 'string' || typeof email !== 'string') {
      return;
    }

    this.userSer.updateStatus(email).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response: UpdateUserStatusResponse) =>{
            const isActive = response.user?.isActive ?? nextStatus === 'Active';
            const resolvedStatus = isActive ? 'Active' : 'Inactive';

            if(isActive){
                this.toast.success('User activated successfully!');
            } else {
                this.toast.success('User deactivated successfully!');
            }
            this.users = this.users.map((user) =>
            user.name === name && user.email === email
              ? { 
                  ...user, 
                  ...response.user,
                  status: resolvedStatus,
                  isActive
                }
              : user
          );

          this.refreshTableData();
        },
        error: (err)=>{
            this.toast.error('Failed to update user status. Please try again.');
            console.error('Error updating user status:', err);
        }
    })
  }

  private getUserStatus(user: StatsPageUser): string {
    if (user?.status) {
      return String(user.status);
    }

    if (typeof user?.isActive === 'boolean') {
      return user.isActive ? 'Active' : 'Inactive';
    }

    if (typeof user?.blocked === 'boolean') {
      return user.blocked ? 'Blocked' : 'Active';
    }

    return (String(user?.status ?? 'Active'));
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }
}
