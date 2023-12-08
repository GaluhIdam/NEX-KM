import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { SummernoteOptions } from 'ngx-summernote/lib/summernote-options';
import { filter, of, switchMap, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import {
  RedeemDTO,
  RedeemUpdateDTO,
} from 'src/app/pages/user/nex-level/dtos/redeem.dto';
import { NexLevelService } from 'src/app/pages/user/nex-level/nex-level.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detail-redeemed',
  templateUrl: './detail-redeemed.component.html',
  styleUrls: ['./detail-redeemed.component.css'],
})
export class DetailRedeemedComponent
  extends BaseController
  implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexlevelservice: NexLevelService,
    private readonly keycloackService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    super(DetailRedeemedComponent.name);
    this.initTitle();
    this.isUnderConstruction = true;
  }

  faSave = faSave;
  isUnderConstruction: boolean;
  title: any;
  currentDate = new Date();
  year = this.currentDate.getFullYear();
  month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
  day = String(this.currentDate.getDate()).padStart(2, '0');
  formattedDate = `${this.year}-${this.month}-${this.day}`;
  dataRedeem: RedeemDTO = {
    count: 0,
    id: 0,
    uuid: '',
    merchandiseId: 0,
    personalNumber: '',
    personalName: '',
    personalUnit: '',
    personalEmail: '',
    redeemDate: null,
    status: null,
    createdAt: this.currentDate,
    updatedAt: this.currentDate,
    merchandiseRedeem: {
      _count: 0,
      id: 0,
      uuid: '',
      personalNumber: '',
      title: '',
      description: '',
      qty: 0,
      point: 0,
      isPinned: false,
      createdAt: this.currentDate,
      updatedAt: this.currentDate,
      imageMerchandise: [],
    },
  };
  uuid!: string;
  image!: string;

  mform: FormGroup = new FormGroup({
    merchandise: new FormControl(''),
    description: new FormControl(''),
    unit: new FormControl(''),
    requestDate: new FormControl(''),
    redeemDate: new FormControl('', [Validators.required]),
    status: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required])
  });

  //Summernote Config
  config: SummernoteOptions = {
    placeholder: 'type your content',
    tabsize: 2,
    height: 500,
    uploadImagePath: '/api/upload',
    toolbar: [
      ['misc', ['codeview', 'undo', 'redo']],
      ['style', ['bold', 'italic', 'underline', 'clear']],
      [
        'font',
        [
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'superscript',
          'subscript',
          'clear',
        ],
      ],
      ['fontsize', ['fontname', 'fontsize', 'color']],
      ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
      ['insert', ['link', 'hr']],
    ],
    fontNames: [
      'Helvetica',
      'Arial',
      'Arial Black',
      'Comic Sans MS',
      'Courier New',
      'Roboto',
      'Times',
    ],
  };
  //Summernote Config

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.uuid = uuid;
      this.getData(this.uuid);
    });
  }
  ngOnDestroy(): void {}

  initTitle(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.title = data;
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        var rt = this.getChild(this.activatedRoute);

        rt.data.subscribe((data: { title: string }) => {
          this.titleService.setTitle('Nex ' + data.title);
        });
      });
  }
  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  async getData(uuid: string): Promise<void> {
    try {
      this.nexlevelservice
        .getRedeemByUuid(uuid)
        .pipe(
          tap((data) => {
            if (data.data.merchandiseRedeem.imageMerchandise.length != 0) {
              data.data.merchandiseRedeem.imageMerchandise[0].path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                data.data.merchandiseRedeem.imageMerchandise[0].path;
            }
          })
        )
        .subscribe((data) => {
          this.dataRedeem = data.data;
          this.mform
            .get('merchandise')
            ?.setValue(this.dataRedeem.merchandiseRedeem.title);
          this.mform.get('merchandise')?.disable();
          this.mform
            .get('description')
            ?.setValue(this.dataRedeem.merchandiseRedeem.description);
          this.mform.get('description')?.disable();
          this.mform.get('unit')?.setValue(this.dataRedeem.personalUnit);
          this.mform.get('unit')?.disable();
          this.mform
            .get('requestDate')
            ?.setValue(
              new Date(this.dataRedeem.createdAt).toISOString().split('T')[0]
            );
          this.mform.get('requestDate')?.disable();
          const redeemedDate = new Date(this.dataRedeem.createdAt);
          this.mform.get('redeemDate')?.setValue(this.formatDate(redeemedDate));
          this.mform.get('status')?.setValue(this.dataRedeem.status);
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
        });
    } catch (error) {
      throw error;
    }
  }

  async update(): Promise<void> {
    try {
      if (this.mform.get('status')?.valid) {
        const socket: NotificationRequestDTO = {
          senderPersonalNumber: this.keycloackService.getUsername(),
          receiverPersonalNumber: this.dataRedeem.personalNumber,
          title: 'Your status redeem updated',
          description: `Your redeem with the merchandise ${this.dataRedeem.merchandiseRedeem.title} has been updated status`,
          isRead: 'false',
          contentType: "redeem",
          contentUuid: `${this.dataRedeem.merchandiseRedeem.uuid}`
        }
        this.webSocket.sendSocket(socket).subscribe()
        this.homepageService.createNotification(socket).subscribe()
        const dto: RedeemUpdateDTO = {
          merchandiseId: this.dataRedeem.merchandiseRedeem.id,
          personalNumber: this.dataRedeem.personalNumber,
          personalName: this.dataRedeem.personalName,
          personalUnit: this.dataRedeem.personalUnit,
          personalEmail: this.dataRedeem.personalEmail,
          redeemDate: this.mform.get('redeemDate')?.value,
          status: this.mform.get('status')?.value,
        };
        this.nexlevelservice.updateRedeem(this.uuid, dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Redeem was successfully updated.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.router.navigate(['/admin/redeemed']);
          });
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          Object.keys(this.mform.controls).forEach((key) => {
            const control = this.mform.get(key);
            if (control?.invalid) {
              control.markAsTouched();
            }
          });
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
