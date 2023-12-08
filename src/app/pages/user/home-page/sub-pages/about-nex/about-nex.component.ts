import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartComponent } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
} from 'ng-apexcharts';
import { NexTeamService } from '../../services/nex-team.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { NexTeamDTO } from '../../dtos/nex-team.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { LocalService } from 'src/app/core/services/local/local.service';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-about-nex',
  templateUrl: './about-nex.component.html',
  styleUrls: ['./about-nex.component.css'],
})
export class AboutNexComponent implements OnInit, OnDestroy {
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------- Corporatee Culture & Knowledge management ----
  nexTeamCorporatee: NexTeamDTO[];
  isNexTeamCorporateeLoading: boolean;
  nexTeamCorporateeMember: SoeDTO[];
  isNexTeamCorporateeMemberLoading: boolean[];
  //#endregion ---- Corporatee Culture & Knowledge management ----

  //#region ------- Learning Center Unit -------------------------
  nexTeamLearning: NexTeamDTO[];
  isNexTeamLearningLoading: boolean;
  nexTeamLearningMember: SoeDTO[];
  isNexTeamLearningMemberLoading: boolean[];
  //#endregion ---- Learning Center Unit -------------------------

  //#region ------- Developer -------------------------
  nexTeamDeveloper: NexTeamDTO[];
  isNexTeamDeveloperLoading: boolean;
  nexTeamDeveloperMember: SoeDTO[];
  isNexTeamDeveloperMemberLoading: boolean[];
  //#endregion ---- Learning Center Unit -------------------------

  soeDefaultValue: SoeDTO | undefined;

  constructor(
    private readonly router: Router,
    private readonly nexTeamService: NexTeamService,
    private readonly headerService: HeaderService,
    private readonly localService: LocalService
  ) {
    this.nexTeamCorporatee = [];
    this.nexTeamLearning = [];
    this.nexTeamDeveloper = [];
    this.isNexTeamCorporateeLoading = false;
    this.isNexTeamLearningLoading = false;
    this.isNexTeamDeveloperLoading = false;
    this.nexTeamCorporateeMember = [];
    this.nexTeamLearningMember = [];
    this.nexTeamDeveloperMember = [];
    this.isNexTeamCorporateeMemberLoading = [];
    this.isNexTeamLearningMemberLoading = [];
    this.isNexTeamDeveloperMemberLoading = [];

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
  }
  ngOnInit(): void {
    this.initNexTeamCorporatee();
    this.initNexTeamLearning();
    this.initNexTeamDeveloper();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //Get Personal Info from SOE
  private getUserData(
    personal_number: string,
    index: number,
    type: string
  ): void {
    if (type === 'corporatee') {
      this.isNexTeamCorporateeMemberLoading[index] = true;
    } else if (type === 'learning') {
      this.isNexTeamLearningMemberLoading[index] = true;
    } else if (type === 'developer') {
      this.isNexTeamDeveloperMemberLoading[index] = true;
    }
    this.headerService.getUserData(personal_number).subscribe(
      (response) => {
        if (type === 'corporatee') {
          this.isNexTeamCorporateeMemberLoading[index] = false;
          this.nexTeamCorporateeMember[index] = response.body;
        } else if (type === 'learning') {
          this.isNexTeamLearningMemberLoading[index] = false;
          this.nexTeamLearningMember[index] = response.body;
        } else if (type === 'developer') {
          this.isNexTeamDeveloperMemberLoading[index] = false;
          this.nexTeamDeveloperMember[index] = response.body;
        }
      },
      (error) => {
        if (type === 'corporatee') {
          this.isNexTeamCorporateeMemberLoading[index] = false;
        } else if (type === 'learning') {
          this.isNexTeamLearningMemberLoading[index] = false;
        } else if (type === 'developer') {
          this.isNexTeamDeveloperMemberLoading[index] = false;
        }
      }
    );
  }

  initNexTeamCorporatee(): void {
    this.isNexTeamCorporateeLoading = true;
    let params: string = `page=${1}&limit=${4}&position=Corporatee Culture & Knowledge Management`;

    this.nexTeamService
      .getNexTeamData(params)
      .pipe(
        tap((response) => {
          this.nexTeamCorporateeMember = new Array(
            response.data.result.length
          ).fill(this.soeDefaultValue);
          this.isNexTeamCorporateeMemberLoading = new Array(
            response.data.result.length
          ).fill(false);

          response.data.result.map((member, index) => {
            this.getUserData(member.personnelNumber, index, 'corporatee');
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isNexTeamCorporateeLoading = false;
          this.nexTeamCorporatee = response.data.result ?? [];
        },
        (error) => {
          this.isNexTeamCorporateeLoading = false;
        }
      );
  }

  initNexTeamLearning(): void {
    this.isNexTeamLearningLoading = true;
    let params: string = `page=${1}&limit=${4}&position=Learning Center Unit`;

    this.nexTeamService
      .getNexTeamData(params)
      .pipe(
        tap((response) => {
          this.nexTeamLearningMember = new Array(
            response.data.result.length
          ).fill(this.soeDefaultValue);

          this.isNexTeamLearningMemberLoading = new Array(
            response.data.result.length
          ).fill(false);

          response.data.result.map((member, index) => {
            this.getUserData(member.personnelNumber, index, 'learning');
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isNexTeamLearningLoading = false;
          this.nexTeamLearning = response.data.result ?? [];
        },
        (error) => {
          this.isNexTeamLearningLoading = false;
        }
      );
  }

  initNexTeamDeveloper(): void {
    this.isNexTeamDeveloperLoading = true;
    let params: string = `page=${1}&limit=${4}&position=IT Developer`;

    this.nexTeamService
      .getNexTeamData(params)
      .pipe(
        tap((response) => {
          this.nexTeamDeveloperMember = new Array(
            response.data.result.length
          ).fill(this.soeDefaultValue);

          this.isNexTeamDeveloperMemberLoading = new Array(
            response.data.result.length
          ).fill(false);

          response.data.result.map((member, index) => {
            this.getUserData(member.personnelNumber, index, 'developer');
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isNexTeamDeveloperLoading = false;
          this.nexTeamDeveloper = response.data.result ?? [];
        },
        (error) => {
          this.isNexTeamDeveloperLoading = false;
        }
      );
  }

  onViewUser(personalNumber: string): void {
    this.router.navigate(['/user/home-page/view-user/' + personalNumber]);
  }

  onGoToTeamList(teamCategory: string): void {
    this.localService.saveData(
      'selected_nex_team_category',
      JSON.stringify(teamCategory)
    );
    this.router.navigate(['/user/home-page/about-nex/team-list']);
  }
}
