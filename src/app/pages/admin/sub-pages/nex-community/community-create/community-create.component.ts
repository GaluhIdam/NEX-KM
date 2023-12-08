import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  faArrowRight,
  faCircleCheck,
  faCircleArrowLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { SoeService } from 'src/app/core/soe/soe.service';
import { Select, initTE } from 'tw-elements';
import { NexCommunityService } from 'src/app/pages/user/nex-community/nex-community.service';
import Swal from 'sweetalert2';
import { CommunityPublishDTO } from 'src/app/pages/user/nex-community/dto/community.dto';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-community-create',
  templateUrl: './community-create.component.html',
  styleUrls: ['./community-create.component.css'],
})
export class CommunityCreateComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly soeService: SoeService,
    private readonly nexcommunityService: NexCommunityService,
    private readonly keycloakService: KeycloakService
  ) {
    super(CommunityCreateComponent.name);
    this.initTab();
  }

  ngOnInit(): void {
    this.load = false;
  }
  ngOnDestroy(): void {}

  ngAfterContentChecked(): void {
    initTE({ Select });
  }

  faArrowRight = faArrowRight;
  faChevronRight = faChevronRight;
  faCircleCheck = faCircleCheck;
  faCircleArrowLeft = faCircleArrowLeft;
  title: any;
  load: boolean = true;
  dateCreated!: Date;

  dataUser: SoeDTO[] = [];

  image!: File;
  imageShow!: string;
  imageValidator: boolean | null = null;
  imageValidatorMessage!: string;

  imageCover!: File;
  imageShowCover!: string;
  imageValidatorCover: boolean | null = null;
  imageValidatorMessageCover!: string;

  imageLogo!: File;
  imageShowLogo!: string;
  imageValidatorLogo: boolean | null = null;
  imageValidatorMessageLogo!: string;

  mform: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    leaderPersonalNumber: new FormControl(null, [Validators.required]),
    founded: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    about: new FormControl('', [Validators.required]),
    leaderProfile: new FormControl('', [Validators.required]),
    instagram: new FormControl('', [Validators.required]),

    status: new FormControl(),
    approveBy: new FormControl(),
  });

  initTab(): void {
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

  async searchData(event: any): Promise<void> {
    this.getAllDataUser(event.term);
  }

  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  //Get All User Data
  async getAllDataUser(personalName: string): Promise<void> {
    this.soeService.getUserByName(personalName).subscribe((response) => {
      this.dataUser = response;
    });
  }

  //Post Community Data
  async createCommunity(): Promise<void> {
    try {
      if (
        this.mform.valid &&
        this.imageValidator === true &&
        this.imageValidatorCover === true &&
        this.imageValidatorLogo === true
      ) {
        this.soeService
          .getUserData(this.mform.get('leaderPersonalNumber')?.value)
          .subscribe((data) => {
            const dto: CommunityPublishDTO = {
              name: this.mform.get('name')?.value,
              personalNumber: this.keycloakService.getUsername(),
              location: this.mform.get('location')?.value,
              about: this.mform.get('about')?.value,
              leader: data.personalName,
              leaderProfile: this.mform.get('leaderProfile')?.value,
              instagram: this.mform.get('instagram')?.value,
              thumbnailPhotoFile: this.image,
              headlinePhotoFile: this.imageCover,
              leaderPersonalNumber: this.mform.get('leaderPersonalNumber')
                ?.value,
              leaderUnit: data.personalUnit,
              leaderEmail: data.personalEmail,
              iconFile: this.imageLogo,
              founded: this.mform.get('founded')?.value,
            };
            if (
              this.mform.valid &&
              this.imageValidator === true &&
              this.imageValidatorCover === true
            ) {
              this.nexcommunityService.createCommunity(dto).subscribe(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'Your community was successfully created.',
                  timer: 1000,
                  showConfirmButton: false,
                }).then(() => {
                  this.router.navigate(['/admin/community']);
                  this.mform.reset();
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
                  if (!this.imageCover) {
                    this.imageValidatorCover = false;
                    this.imageValidatorMessageCover = 'Image is Required';
                  }
                  if (!this.image) {
                    this.imageValidator = false;
                    this.imageValidatorMessage = 'Image is Required';
                  }
                });
              });
            }
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.imageValidation(file, 1).then((data) => {
      this.imageValidator = data.status;
      this.imageValidatorMessage = data.message;
    });
    if (file) {
      this.image = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageShow = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onFileSelectedCover(event: any) {
    const file: File = event.target.files[0];
    this.imageValidation(file, 1).then((data) => {
      this.imageValidatorCover = data.status;
      this.imageValidatorMessageCover = data.message;
    });
    if (file) {
      this.imageCover = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageShowCover = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onFileSelectedLogo(event: any) {
    const file: File = event.target.files[0];
    this.imageValidation(file, 1).then((data) => {
      this.imageValidatorLogo = data.status;
      this.imageValidatorMessageLogo = data.message;
    });
    if (file) {
      this.imageLogo = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageShowLogo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
