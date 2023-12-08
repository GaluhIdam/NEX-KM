import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { faSearch, faBookOpen, faBullhorn, faBell, faGear, faPencil, faPlus, faCheck, faXmark, faChevronRight, faEllipsis, faPenToSquare, faEllipsisVertical, faClock, faTimes, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { EbookDTO, ForumDTO, PhotoGalleryDTO, PodcastDTO, UsersDTO } from '../dtos/searchResults';
import { searchResultsServices } from '../services/searchResults.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent {
  @Input() ebook!: EbookDTO;
  @Input() PhotoGalleryDTO!: PhotoGalleryDTO;
  @Input() ForumDTO!: ForumDTO;
  @Input() PodcastDTO! : PodcastDTO;
  @Input() Users! : UsersDTO;

  linked_icon = '../../../../assets/image/footer/linked-icon.png';
  instagram_icon = '../../../../assets/image/footer/instagram-icon.png';
  facebook_icon = '../../../../assets/image/fb.png';
  bg_library = '../../../../assets/image/library/bg-library.jpg';
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
  faArrowRight = faArrowRight

  // searchResults
  // ebook
  ebookList: EbookDTO[] = [];
  filteredEbookList: EbookDTO[] = [];
  ebookService: searchResultsServices = inject(searchResultsServices)

  // photoGalery
  photoList: PhotoGalleryDTO[] = [];
  filteredPhotoList: PhotoGalleryDTO[] = [];
  photoService: searchResultsServices = inject(searchResultsServices)

  // forum
  forumList: ForumDTO[] = [];
  filteredForumList: ForumDTO[] = [];
  forumService: searchResultsServices = inject(searchResultsServices)

  //podcast
  podcastList: PodcastDTO[] = [];
  filteredPodcastList: PodcastDTO[] = [];
  podcastService: searchResultsServices = inject(searchResultsServices)

  // users
  usersList: UsersDTO[] = [];
  filteredUsersList: UsersDTO[] = [];
  usersService: searchResultsServices = inject(searchResultsServices)

  constructor (private readonly router: Router) {
    this.ebookList = this.ebookList;
    this.ebookService
    .getAllEbook()
    .then((ebookList: EbookDTO[]) => {
      this.ebookList = ebookList;
      this.filteredEbookList = ebookList;
    });
    this.photoList = this.photoList;
    this.photoService
    .getAllPhoto()
    .then((photoList: PhotoGalleryDTO[]) => {
      this.photoList = photoList;
      this.filteredPhotoList = photoList;
    });
    this.forumList = this.forumList;
    this.forumService
    .getAllForum()
    .then((forumList: ForumDTO[]) => {
      this.forumList = forumList;
      this.filteredForumList = forumList;
    });
    this.podcastList = this.podcastList;
    this.forumService
    .getAllForum()
    .then((podcastList: ForumDTO[]) => {
      this.podcastList = podcastList;
      this.filteredPodcastList = podcastList;
    })
    this.usersList = this.usersList;
    this.usersService
    .getAllUsers()
    .then((usersList: UsersDTO[]) => {
      this.usersList = usersList;
      this.filteredUsersList = usersList;
    })
  }
}
