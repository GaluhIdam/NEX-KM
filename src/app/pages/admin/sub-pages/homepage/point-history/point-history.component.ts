import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { faArrowRight, faBell, faGear, faSearch, faFilter, faPrint, faCircleCheck, faEye, faStar, faBan, faXmark, faPencil, faPlus, faTrash, faTimes, faEdit, faRecycle } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs';

@Component({
  selector: 'app-point-history',
  templateUrl: './point-history.component.html',
  styleUrls: ['./point-history.component.css']
})
export class PointHistoryComponent {
  faArrowRight = faArrowRight
  faBell = faBell
  faGear = faGear
  faSearch = faSearch
  faFilter = faFilter
  faPrint = faPrint
  faCircleCheck = faCircleCheck
  faEye = faEye
  faStar = faStar
  faBan = faBan
  faXmark = faXmark
  faPencil = faPencil
  faPlus = faPlus
  faTrash = faTrash
  faTimes = faTimes
  faEdit = faEdit
  faRecycle = faRecycle


  title: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) { }

  ngOnInit() {
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

  //Modal Merchandise
  isModalOpen = false;
  openModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }

  detail(): void {
    this.router.navigate(['/admin/user-list/detail']);
  }

  userList(): void {
    this.router.navigate(['/admin/user-list']);
  }

  pointHistory(): void {
    this.router.navigate(['/admin/user-list/detail/point-history'])
  }

  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }
}
