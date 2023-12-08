import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  faPlus,
  faTrashAlt,
  faEllipsis,
  faUpload,
  faTrash,
  faFile,
  faAdd,
  faSearch,
  faCircleChevronLeft,
  faCircleChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { PlyrComponent } from 'ngx-plyr';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { Subject, Subscription, debounceTime, takeUntil, tap } from 'rxjs';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { KeycloakService } from 'keycloak-angular';
import { SerieDataService } from '../../../../../core/services/nex-talk/serie-data.service';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { CreatorDataService } from 'src/app/core/services/nex-talk/creator-data.service';
import { CreatorDTO } from 'src/app/core/dtos/nex-talk/creator.dto';
import { UserListDTO } from '../../../home-page/dtos/user-list.dto';
import { environment } from 'src/environments/environment.prod';
import { PodcastCollaboratorDataService } from 'src/app/core/services/nex-talk/podcast-collaborator.service';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-podcast-upload-podcast',
  templateUrl: './podcast-upload-podcast.component.html',
  styleUrls: ['./podcast-upload-podcast.component.css'],
})
export class PodcastUploadPodcastComponent implements OnInit, OnDestroy {
  faPlus = faPlus;
  faTrashAlt = faTrashAlt;
  faEllipsis = faEllipsis;
  faChevronRight = faChevronRight;
  faUpload = faUpload;
  faTrash = faTrash;
  faFile = faFile;
  faAdd = faAdd;
  faSearch = faSearch;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;

  files: File[] = [];
  check: any = [];
  addedFiles: any;

  obs!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //Cover Podcast File Action
  @ViewChild('podcastCoverFileInput', { static: false })
  podcastCoverFileInput!: ElementRef<HTMLInputElement>;
  selectedPodcastCoverFile: File | null = null;
  podcastCoverFileDragging: Boolean = false;
  previewPodcastCover: string | undefined;

  //MP3 Podcast File Action
  @ViewChild('podcastFileInput', { static: false })
  podcastFileInput!: ElementRef<HTMLInputElement>;
  selectedPodcastFile: File | null = null;
  podcastFileDragging: Boolean = false;
  previewPodcast: string | undefined;

  serieData: SerieDTO[];

  podcastForm!: FormGroup;
  personalNumber: string;

  progress: number;
  progressCollaborator: number[];

  isLoading: boolean;

  user: SoeDTO | undefined;

  isColaboratorModalOpen: boolean;
  colaboratorData: UserListDTO[];
  selectedColaboratorData: UserListDTO[];
  isSelectedCollaboratorChecked: boolean[];
  isCollaboratorLoading: boolean;

  uploadedFileSucces: boolean[];
  uploadedFileCount: number;

  page: number = 1;
  limit: number = 6;
  search: string = '';
  sortBy: string = 'asc';
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
    private readonly formBuilder: FormBuilder,
    private readonly keycloakService: KeycloakService,
    private readonly serieDataService: SerieDataService,
    private readonly podcastDataService: PodcastDataService,
    private readonly creatorDataService: CreatorDataService,
    private readonly headerService: HeaderService,
    private readonly podcastCollaboratorDataService: PodcastCollaboratorDataService,
    private readonly toastr: ToastrService
  ) {
    this.isLoading = false;
    this.serieData = [];
    this.personalNumber = '';
    this.progress = 0;
    this.colaboratorData = [];
    this.selectedColaboratorData = [];
    this.isColaboratorModalOpen = false;
    this.isCollaboratorLoading = false;
    this.isSelectedCollaboratorChecked = [];
    this.uploadedFileSucces = [];
    this.uploadedFileCount = 0;
    this.progressCollaborator = [];
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.getUserData(this.personalNumber);
    this.createPodcastForm();
    this.initSerieData();

    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.initCollaboratorData(
            data.page,
            data.limit,
            data.search,
            data.sortBy
          );
        }
      });
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();

    this.obs.unsubscribe();
  }

  initSerieData(): void {
    this.isLoading = true;
    let params: string = `page=${1}&limit=${1000}&personal_number=${
      this.personalNumber
    }`;

    this.serieDataService
      .getSerieData(params)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.serieData = response.data.data;
      });
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  //Get Personal Info from SOE
  private getUserData(personal_number: string): void {
    this.headerService.getUserData(personal_number).subscribe((response) => {
      this.user = response.body;
    });
  }

  createPodcastForm(): void {
    this.podcastForm = this.formBuilder.nonNullable.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      seriesId: ['', [Validators.required]],
      cover_podcast: [null, [Validators.required]],
      file_podcast: [null, [Validators.required]],
      //collaborators: this.formBuilder.array([]),
    });
  }

  get title() {
    return this.podcastForm.get('title');
  }

  get description() {
    return this.podcastForm.get('description');
  }

  get seriesId() {
    return this.podcastForm.get('seriesId');
  }

  get cover_podcast() {
    return this.podcastForm.get('cover_podcast');
  }

  get file_podcast() {
    return this.podcastForm.get('file_podcast');
  }

  onPodcastCoverDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.podcastCoverFileDragging = true;
  }

  onPodcastFileDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.podcastFileDragging = true;
  }

  onPodcastCoverDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.podcastCoverFileDragging = false;
  }

  onPodcastFileDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.podcastFileDragging = false;
  }

  onPodcastCoverDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.podcastCoverFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readPodcastCoverImageFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.podcastForm.controls['cover_podcast'].markAsTouched();
  }

  onPodcastFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.podcastFileDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      if (this.isMP3File(file)) {
        this.readPodcastFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only MP3 file!',
        });
      }
    }
    this.podcastForm.controls['file_podcast'].markAsTouched();
  }

  onPodcastCoverUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isImageFile(file)) {
        this.readPodcastCoverImageFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only image file!',
        });
      }
    }
    this.podcastForm.controls['cover_podcast'].markAsTouched();
    fileInput.value = '';
  }

  onPodcastFileUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      if (this.isMP3File(file)) {
        this.readPodcastFile(file);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Wrong File',
          text: 'Please select only MP3 file!',
        });
      }
    }
    this.podcastForm.controls['file_podcast'].markAsTouched();
    fileInput.value = '';
  }

  isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return file && acceptedImageTypes.includes(file.type);
  }

  isMP3File(file: File): boolean {
    const acceptedMP3Types = ['audio/mpeg'];
    return file && acceptedMP3Types.includes(file.type);
  }

  readPodcastCoverImageFile(file: File): void {
    this.selectedPodcastCoverFile = file;
    this.podcastForm.controls['cover_podcast'].setValue(file);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.previewPodcastCover = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  readPodcastFile(file: File): void {
    this.selectedPodcastFile = file;
    this.podcastForm.controls['file_podcast'].setValue(file);
  }

  onRemovePodcastCover(): void {
    this.selectedPodcastCoverFile = null;
    this.previewPodcastCover = '';
    this.podcastForm.controls['cover_podcast'].setValue(null);
  }

  onRemovePodcastFile(): void {
    this.selectedPodcastFile = null;
    this.previewPodcast = '';
    this.podcastForm.controls['file_podcast'].setValue(null);
  }

  triggerImageFileInputClick(): void {
    if (this.podcastCoverFileInput) {
      this.podcastCoverFileInput.nativeElement.click();
      this.podcastForm.controls['cover_podcast'].markAsTouched();
    }
  }

  triggerPodcastFileInputClick(): void {
    if (this.podcastFileInput) {
      this.podcastFileInput.nativeElement.click();
      this.podcastForm.controls['file_podcast'].markAsTouched();
    }
  }

  myPodcast(): void {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast']);
  }

  onSelect(event: { addedFiles: any }) {
    this.files.push(...event.addedFiles);
    this.check.push(1);
    console.log(this.check);
  }

  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  onSubmit() {
    if (this.podcastForm.invalid) {
      return;
    }
    if (this.user) {
      const formData = new FormData();
      formData.append('cover_podcast', this.cover_podcast?.value);
      formData.append('file_podcast', this.file_podcast?.value);
      formData.append('seriesId', this.seriesId?.value);
      formData.append('title', this.title?.value);
      formData.append('description', this.description?.value);
      formData.append('personalNumber', this.personalNumber);
      formData.append('createdBy', this.user.personalName);

      this.isLoading = true;
      this.podcastDataService.storePodcastData(formData).subscribe(
        (event: any) => {
          //finish uploading get response
          if (event.type === 4) {
            this.onSubmitCollaborator(event.body.data);
          } else {
            if (event['loaded'] && event['total']) {
              this.progress = Math.round(
                (event['loaded'] / event['total']) * 100
              );
            }
          }
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error.message,
          }).then(() => {
            this.isLoading = false;
            this.progress = 0;
          });
        }
      );
    }
  }

  onSubmitCollaborator(podcast: PodcastDTO): void {
    if (this.selectedColaboratorData.length > 0) {
      this.isLoading = true;

      this.selectedColaboratorData.map((collaborator, index) => {
        if (this.user) {
          const request = {
            podcastId: podcast.id,
            personalNumber: collaborator.personalNumber,
          };

          this.podcastCollaboratorDataService
            .storePodcastCollaboratorData(request)
            .subscribe(
              (event: any) => {
                if (event['loaded'] && event['total']) {
                  this.progressCollaborator[index] = Math.round(
                    (event['loaded'] / event['total']) * 100
                  );
                }
              },
              (error) => {
                this.uploadedFileCount += 1;
                this.toastr.error(
                  error.error.message,
                  `Upload ${this.selectedColaboratorData[index].userName} Failed`
                );
                this.onCheckUploadedCollaborator();
              },
              () => {
                this.uploadedFileSucces[index] = true;
                this.uploadedFileCount += 1;

                this.onCheckUploadedCollaborator();
              }
            );
        }
      });
    }
  }

  onCheckUploadedCollaborator(): void {
    if (this.uploadedFileCount === this.selectedColaboratorData.length) {
      const allUploadSuccess = this.uploadedFileSucces.every(
        (item) => item === true
      );

      // Success upload all photos
      if (allUploadSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: 'The podcast you inputed has been submitted and now is waiting approval',
        }).then(() => {
          this.isLoading = false;
          this.progress = 0;
          this.onPreviousPage();
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Great Move..',
          text: 'The album you inputted has been submitted, but there are some galleries that failed to upload',
        }).then(() => {
          this.isLoading = false;
          this.progress = 0;
          this.onPreviousPage();
        });
      }
    }
  }

  onPreviousPage() {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast']);
  }

  onSaveClick() {
    Swal.fire({
      icon: 'info',
      title: 'Save Confirmation',
      text: 'Are you sure want to upload new podcast?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: ' #d33',
      confirmButtonText: 'Yes',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.onSubmit();
      }
    });
  }
  onConfirmationAfterSubmit() {
    Swal.fire({
      icon: 'success',
      title: 'Great Move..',
      text: 'The podcast you inputed has been uploaded',
    }).then(() => {
      this.onPreviousPage();
    });
  }

  onCancelClick() {
    Swal.fire({
      icon: 'info',
      title: 'Cancel Confirmation',
      text: 'Are you sure want to leave this page?',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.onPreviousPage();
      }
    });
  }

  formatFileSize(size: number): string {
    if (size === 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const base = 1000;
    const exponent = Math.floor(Math.log(size) / Math.log(base));
    const formattedSize = (size / Math.pow(base, exponent)).toFixed(2);

    return `${formattedSize} ${units[exponent]}`;
  }

  onOpenColaboratorModal() {
    this.isColaboratorModalOpen = true;
    this.initCollaboratorData(this.page, this.limit, this.search, this.sortBy);
  }

  onCloseColaboratorModal() {
    this.isColaboratorModalOpen = false;
  }

  searchByField(event: any): void {
    this.search = event.target.value;
    this.initCollaboratorData(this.page, this.limit, this.search, this.sortBy);
  }

  initCollaboratorData(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): void {
    this.isCollaboratorLoading = true;
    let params: string = `page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}`;

    this.creatorDataService
      .getUserListForCollaborator(params)
      .pipe(
        tap((data) => {
          this.isSelectedCollaboratorChecked = new Array(
            data.data.result.length
          ).fill(false);

          if (this.selectedColaboratorData.length > 0) {
            const commonElements = data.data.result.filter((element) =>
              this.selectedColaboratorData.some(
                (selected) => selected.id === element.id
              )
            );

            const indicesFound = commonElements.map((element) =>
              data.data.result.findIndex((data) => data.id === element.id)
            );

            indicesFound.forEach((indexFound) => {
              this.isSelectedCollaboratorChecked[indexFound] = true;
            });
          }
          if (data.data.result) {
            data.data.result.forEach((collaborator) => {
              collaborator.userPhoto =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                collaborator.userPhoto;
            });
          }
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isCollaboratorLoading = false;

          this.colaboratorData = response.data.result ?? [];
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
        },
        (error) => {
          this.isCollaboratorLoading = false;
          this.colaboratorData = [];
        }
      );
  }

  onSelectCollaborator(data: UserListDTO, selectedIndex: number): void {
    this.selectedColaboratorData.push(data);
    this.progressCollaborator.push(0);
    if (!this.isSelectedCollaboratorChecked[selectedIndex]) {
      this.isSelectedCollaboratorChecked[selectedIndex] = true;
    }
  }

  onDeSelectCollaborator(data: UserListDTO, selectedIndex: number): void {
    const existingIndex = this.selectedColaboratorData.findIndex(
      (collaborator) => data.id === collaborator.id
    );

    if (existingIndex !== -1) {
      this.selectedColaboratorData.splice(existingIndex, 1);
      this.progressCollaborator.splice(existingIndex, 1);
      if (this.isSelectedCollaboratorChecked[selectedIndex]) {
        this.isSelectedCollaboratorChecked[selectedIndex] = false;
      }
    }
  }

  // Paginated Logic
  paginate(total: number, limit: number, arrayData: Array<number>): void {
    arrayData.splice(0);
    const totalPages = Math.ceil(total / limit);
    for (let i = 0; i < totalPages; i++) {
      arrayData.push(i + 1);
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

  onConfirmationAddCollaborator() {
    Swal.fire({
      icon: 'info',
      title: 'Add Confirmation',
      text: 'Are you sure want to add selected collaborators?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: ' #d33',
      confirmButtonText: 'Yes',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.isColaboratorModalOpen = false;
      }
    });
  }

  onConfirmationBeforCloseCollaboratorModal() {
    if (this.selectedColaboratorData.length > 0) {
      Swal.fire({
        icon: 'info',
        title: 'Confirmation',
        text: 'Are you sure you want to exit? All selected collaborators will be lost',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: ' #d33',
        confirmButtonText: 'Yes',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.selectedColaboratorData = [];
          this.isColaboratorModalOpen = false;
        }
      });
    } else {
      this.onCloseColaboratorModal();
    }
  }

  onRemoveSelectedCollaborator(index: number) {
    this.selectedColaboratorData.splice(index, 1);
    this.progressCollaborator.splice(index, 1);
  }
}
