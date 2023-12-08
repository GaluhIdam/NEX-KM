import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faAdd,
  faChevronRight,
  faCircleChevronLeft,
  faCircleChevronRight,
  faEllipsis,
  faFile,
  faPlus,
  faSearch,
  faTrash,
  faTrashAlt,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { Subject, Subscription, debounceTime, takeUntil, tap } from 'rxjs';

import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { SoeDTO } from 'src/app/core/soe/soe.dto';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';
import { CreatorDataService } from '../../../../../core/services/nex-talk/creator-data.service';
import {
  UserListDTO,
  defaultUserListDTO,
} from '../../../home-page/dtos/user-list.dto';
import { HomePageService } from '../../../home-page/homepage.service';

@Component({
  selector: 'app-podcast-edit-podcast',
  templateUrl: './podcast-edit-podcast.component.html',
  styleUrls: ['./podcast-edit-podcast.component.css'],
})
export class PodcastEditPodcastComponent implements OnInit, OnDestroy {
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
  isError: boolean;
  isFileLoading: boolean;
  isImageLoading: boolean;

  user: SoeDTO | undefined;

  //uuid from URL
  uuid: string | null;

  // selected Category
  selectedDefaultSeries: SerieDTO | undefined;

  podcastDetailData: PodcastDTO | undefined;

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
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly keycloakService: KeycloakService,
    private readonly serieDataService: SerieDataService,
    private readonly podcastDataService: PodcastDataService,
    private readonly headerService: HeaderService,
    private readonly creatorDataService: CreatorDataService,
    private readonly homePageService: HomePageService
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.isLoading = false;
    this.isError = false;
    this.serieData = [];
    this.personalNumber = '';
    this.progress = 0;
    this.isFileLoading = false;
    this.isImageLoading = false;
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

  private getUserListData(personal_number: string, index?: number): void {
    this.homePageService
      .getUserListByPersonalNumber(personal_number)
      .pipe(
        tap((response) => {
          response.data.userPhoto =
            environment.httpUrl +
            '/v1/api/file-manager/get-imagepdf/' +
            response.data.userPhoto;
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        if (index !== undefined) {
          this.selectedColaboratorData[index] = response.data;
        }
      });
  }

  initSerieData(): void {
    this.isLoading = true;
    let params: string = `page=${1}&limit=${1000}&personal_number=${
      this.personalNumber
    }&status=true`;

    this.serieDataService
      .getSerieData(params)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.serieData = response.data.data;
        this.initPodcastDetailData();
      });
  }

  initPodcastDetailData(): void {
    if (this.uuid) {
      this.isLoading = true;
      this.isError = false;
      this.podcastDataService
        .getPodcastDetailByUuid(this.uuid)
        .pipe(
          tap((response) => {
            this.selectedColaboratorData = new Array(
              response.data.colaboratorPodcast.length
            ).fill(defaultUserListDTO);

            if (response.data.colaboratorPodcast.length > 0) {
              response.data.colaboratorPodcast.forEach(
                (collaborator, index) => {
                  this.getUserListData(collaborator.personalNumber, index);
                }
              );
            }

            response.data.pathImage =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.pathImage;
            response.data.pathFile =
              environment.httpUrl +
              '/v1/api/file-manager/get-m3u8/' +
              response.data.pathFile;
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.isError = false;
            this.podcastDetailData = response.data;
            this.getUserData(this.podcastDetailData.personalNumber);
            this.setDefaultValue(response.data);
          },
          () => {
            this.isLoading = false;
            this.isError = true;
          }
        );
    }
  }

  createPodcastForm(): void {
    this.podcastForm = this.formBuilder.nonNullable.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      seriesId: ['', [Validators.required]],
      cover_podcast: [null, [Validators.required]],
      file_podcast: [null, [Validators.required]],
    });
  }

  setDefaultValue(data: PodcastDTO) {
    if (this.serieData.length > 0) {
      this.selectedDefaultSeries = this.serieData.find(
        (serie) => serie.id === data.serieId
      );
    }

    this.podcastForm.patchValue({
      title: data.title,
      description: data.description,
      seriesId: this.selectedDefaultSeries?.title,
    });

    this.fetchFile(data.pathFile, 'mp3');
    this.fetchFile(data.pathImage, 'image');
  }

  fetchFile(url: string, type: string): void {
    this.isFileLoading = true;
    this.isImageLoading = true;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
        const objectType =
          type === 'image' ? `image/${fileExtension}` : `audio/mpeg`;

        const file = new File([blob], fileName, { type: objectType });

        if (type === 'image') {
          this.isImageLoading = false;
          this.selectedPodcastCoverFile = file;
          this.previewPodcastCover = url;
          this.podcastForm.controls['cover_podcast'].setValue(file);
        } else if (type === 'mp3') {
          this.isFileLoading = false;
          this.selectedPodcastFile = file;
          this.podcastForm.controls['file_podcast'].setValue(file);
        }
      })
      .catch(() => {
        if (type === 'image') {
          this.isImageLoading = false;
        } else if (type === 'pdf') {
          this.isFileLoading = false;
        }
        Swal.fire({
          icon: 'error',
          title: 'Error Fetching File',
          text: 'Failed to fetch the file!',
        });
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
    if (this.user && this.podcastDetailData && this.uuid) {
      const formData = new FormData();
      formData.append('cover_podcast', this.cover_podcast?.value);
      formData.append('file_podcast', this.file_podcast?.value);
      formData.append('title', this.title?.value);
      formData.append('description', this.description?.value);
      formData.append('personalNumber', this.user.personalNumber);
      formData.append('createdBy', this.user.personalName + 'Uray');
      formData.append(
        'seriesId',
        this.seriesId?.value.length > 1
          ? this.selectedDefaultSeries?.id
          : this.seriesId?.value
      );

      this.isLoading = true;
      this.podcastDataService.updatePodcastData(this.uuid, formData).subscribe(
        (event: any) => {
          if (event['loaded'] && event['total']) {
            this.progress = Math.round(
              (event['loaded'] / event['total']) * 100
            );
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
        },
        () => {
          this.isLoading = false;
          this.onConfirmationAfterSubmit();
        }
      );
    }
  }

  onPreviousPage() {
    if (this.podcastDetailData) {
      this.router.navigate([
        '/user/nex-talks/podcast/my-podcast/detail/' +
          this.podcastDetailData.seriePodcast.uuid,
      ]);
    }
  }

  onSaveClick() {
    Swal.fire({
      icon: 'info',
      title: 'Edit Confirmation',
      text: 'Are you sure want to edit this podcast?',
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
      text: 'The podcast has been edited',
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
