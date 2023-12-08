import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, debounceTime, takeUntil, tap } from 'rxjs';
import { NexTeamDTO } from '../../../dtos/nex-team.dto';
import { Router } from '@angular/router';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { NexTeamService } from '../../../services/nex-team.service';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { LocalService } from 'src/app/core/services/local/local.service';
import { FormControl, FormGroup } from '@angular/forms';
import {
  faCircleChevronLeft,
  faCircleChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { BaseController } from 'src/app/core/BaseController/base-controller';

@Component({
  selector: 'app-nex-team-list',
  templateUrl: './nex-team-list.component.html',
  styleUrls: ['./nex-team-list.component.css'],
})
export class NexTeamListComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  faCircleChevronRight = faCircleChevronRight;
  faCircleChevronLeft = faCircleChevronLeft;

  obs!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  nexTeam: NexTeamDTO[];
  isNexTeamLoading: boolean;
  nexTeamMember: SoeDTO[];
  isNexTeamMemberLoading: boolean[];

  soeDefaultValue: SoeDTO | undefined;

  selectedTeam: string;

  page: number = 1;
  limit: number = 15;
  search: string = '';
  sortBy: string = 'memberASC';
  isAdmin: boolean = false;
  totalData: number = 0;
  pageData: Array<number> = [];

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  constructor(
    private readonly router: Router,
    private readonly nexTeamService: NexTeamService,
    private readonly headerService: HeaderService,
    private readonly localService: LocalService
  ) {
    super(NexTeamListComponent.name);

    this.nexTeam = [];
    this.isNexTeamLoading = false;
    this.nexTeamMember = [];
    this.isNexTeamMemberLoading = [];

    this.soeDefaultValue = {
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

    const selectedTeam = this.localService.getData(
      'selected_nex_team_category'
    );
    if (selectedTeam !== null) {
      const teamName = JSON.parse(selectedTeam);

      if (teamName === 'developer') {
        this.selectedTeam = 'IT Developer';
      } else if (teamName === 'corporatee') {
        this.selectedTeam = 'Corporatee Culture & Knowledge Management';
      } else if (teamName === 'learning') {
        this.selectedTeam = 'Learning Center Unit';
      } else {
        this.selectedTeam = 'No Team Selected';
      }
    } else {
      this.selectedTeam = 'No Team Selected';
    }
  }

  ngOnInit(): void {
    this.initNexTeam(this.page, this.limit, this.search, this.sortBy);

    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.initNexTeam(data.page, data.limit, data.search, data.sortBy);
        }
      });
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();

    this.obs.unsubscribe();
  }

  //Get Personal Info from SOE
  private getUserData(personal_number: string, index: number): void {
    this.isNexTeamMemberLoading[index] = true;
    this.headerService.getUserData(personal_number).subscribe(
      (response) => {
        this.isNexTeamMemberLoading[index] = false;
        this.nexTeamMember[index] = response.body;
      },
      (error) => {
        this.isNexTeamMemberLoading[index] = false;
      }
    );
  }

  initNexTeam(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): void {
    if (this.selectedTeam !== 'No Team Selected') {
      this.isNexTeamLoading = true;
      let params: string = `page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&position=${this.selectedTeam}`;

      this.nexTeamService
        .getNexTeamData(params)
        .pipe(
          tap((response) => {
            this.nexTeamMember = new Array(response.data.result.length).fill(
              this.soeDefaultValue
            );

            this.isNexTeamMemberLoading = new Array(
              response.data.result.length
            ).fill(false);

            response.data.result.map((member, index) => {
              this.getUserData(member.personnelNumber, index);
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.isNexTeamLoading = false;
            this.nexTeam = response.data.result ?? [];
            this.totalData = response.data.total;
            this.paginate(this.totalData, this.limit, this.pageData);
          },
          (error) => {
            this.isNexTeamLoading = false;
          }
        );
    }
  }

  onViewUser(personalNumber: string): void {
    console.log('dadad');
    this.router.navigate(['/user/home-page/view-user/' + personalNumber]);
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
}
