import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  faSearch,
  faBookOpen,
  faBullhorn,
  faBell,
  faGear,
  faPencil,
  faPlus,
  faCheck,
  faXmark,
  faChevronRight,
  faEllipsis,
  faPenToSquare,
  faEllipsisVertical,
  faClock,
  faTimes,
  faArrowRight,
  faEye,
  faCircleChevronRight,
  faCircleChevronLeft,
  faCircleDot,
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { Subject, Subscription, debounceTime, takeUntil, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { KeycloakService } from 'keycloak-angular';
import { Modal, initTE, Ripple } from 'tw-elements';
import { FormControl, FormGroup } from '@angular/forms';
import {
  NotificationDTO,
  NotificationReadRequestDTO,
} from '../../home-page/dtos/notification.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import Swal from 'sweetalert2';
import { NotificationService } from '../../home-page/services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  @ViewChild(ToastContainerDirective, { static: true })
  faSearch = faSearch;
  faBookOpen = faBookOpen;
  faBullhorn = faBullhorn;
  faBell = faBell;
  faGear = faGear;
  faPencil = faPencil;
  faPlus = faPlus;
  faCheck = faCheck;
  faXmark = faXmark;
  faChevronRight = faChevronRight;
  faEllipsis = faEllipsis;
  faPenToSquare = faPenToSquare;
  faEllipsisVertical = faEllipsisVertical;
  faClock = faClock;
  faTimes = faTimes;
  faArrowRight = faArrowRight;
  faEye = faEye;
  faCircleChevronRight = faCircleChevronRight;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleDot = faCircleDot;

  obs!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  personalNumber: string = '';
  soeSenders: SoeDTO[] = [];
  soeDefaultValue: SoeDTO = {
    personalNumber: '',
    personalName: '-',
    personalTitle: '',
    personalUnit: '',
    personalBirthPlace: '',
    personalBirthDate: '',
    personalGrade: '',
    personalJobDesc: '',
    personalEmail: '',
    personalImage:
      'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg',
  };

  notificationData: NotificationDTO[] = [];
  isAllNotifRead: boolean = true;

  page: number = 1;
  limit: number = 5;
  search: string = '';
  sortBy: string = 'desc';
  totalData: number = 0;
  pageData: Array<number> = [];
  isLoading: boolean = false;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  constructor(
    private readonly toastr: ToastrService,
    private readonly notificationService: NotificationService,
    private readonly keycloakService: KeycloakService,
    private readonly headerService: HeaderService
  ) {
    super(NotificationsComponent.name);
  }

  ngOnInit(): void {
    initTE({ Modal, Ripple });

    this.initializeUserOptions();
    this.getAllNotificationsByReceiver(
      this.page,
      this.limit,
      this.search,
      this.sortBy,
      this.personalNumber,
      true
    );
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getAllNotificationsByReceiver(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            this.personalNumber,
            true
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.obs.unsubscribe();
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  //Get Personal Info from SOE
  private getUserData(personal_number: string, index: number): void {
    this.headerService.getUserData(personal_number).subscribe((response) => {
      this.soeSenders[index] = response.body;
    });
  }

  //Get Notification
  async getAllNotificationsByReceiver(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    receiverPersonalNumber: string,
    refresh?: boolean
  ): Promise<void> {
    try {
      if (refresh) {
        this.isLoading = true;
      }
      this.isAllNotifRead = true;
      this.notificationService
        .getNotificationsByReceiver(
          page,
          limit,
          search,
          sortBy,
          receiverPersonalNumber
        )
        .pipe(
          tap((response) => {
            this.soeSenders = new Array(response.data.result.length).fill(
              this.soeDefaultValue
            );
            response.data.result.map((notif, index) => {
              this.getUserData(notif.senderPersonalNumber, index);
              if (!notif.isRead) {
                this.isAllNotifRead = false;
              }
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            if (refresh) {
              this.isLoading = false;
            }
            this.notificationData = response.data.result ?? [];
            this.totalData = response.data.total;
            this.paginate(this.totalData, this.limit, this.pageData);
          },
          (error) => {
            if (refresh) {
              this.isLoading = false;
            }
          }
        );
    } catch (error) {
      throw error;
    }
  }

  //Read Selected Notification
  async readAllNotifications(): Promise<void> {
    try {
      const dto: NotificationReadRequestDTO = {
        isRead: true,
      };
      this.notificationService.readAllNotifications(dto).subscribe(
        () => {
          this.toastr.success(
            'All notifications have been read',
            'Read Notifications'
          );
          this.getAllNotificationsByReceiver(
            this.page,
            this.limit,
            this.search,
            this.sortBy,
            this.personalNumber
          );
        },
        (error) => {
          this.toastr.error('Something wrong', 'Read Notifications');
        }
      );
    } catch (error) {
      throw error;
    }
  }

  //Read Selected Notification
  async readSelectedNotification(uuid: string): Promise<void> {
    try {
      const dto: NotificationReadRequestDTO = {
        isRead: true,
      };
      this.notificationService.readNotification(uuid, dto).subscribe(
        () => {
          this.toastr.success(
            'Selected Notification has been readed',
            'Read Notification'
          );
          this.getAllNotificationsByReceiver(
            this.page,
            this.limit,
            this.search,
            this.sortBy,
            this.personalNumber,
            true
          );
        },
        (error) => {
          this.toastr.error(
            'Selected notification cannot be readed',
            'Read Notification'
          );
        }
      );
    } catch (error) {
      throw error;
    }
  }

  //Delete Notification
  async deleteNotification(uuid: string): Promise<void> {
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.notificationService.deleteNotification(uuid).subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Notification has deleted.',
              showConfirmButton: false,
            }).then(() => {
              this.getAllNotificationsByReceiver(
                this.page,
                this.limit,
                this.search,
                this.sortBy,
                this.personalNumber
              );
            });
          });
        }
      });
    } catch (error) {
      throw error;
    }
  }

  nextPage(): void {
    if (
      this.pageData.length > 1 &&
      this.mform.get('page')?.value < this.pageData.length
    ) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value + 1);
    }
  }

  changePage(page: number): void {
    if (this.pageData.length) {
      this.mform.get('page')?.setValue(page);
    }
  }

  prevPage(): void {
    if (this.pageData.length > 1 && this.mform.get('page')?.value > 1) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value - 1);
    }
  }

  showReadAllNotificationAlert() {
    Swal.fire({
      icon: 'info',
      title: 'Alert Confirmation',
      text: 'Are you sure want to read all notifications?',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.readAllNotifications();
      }
    });
  }
}
