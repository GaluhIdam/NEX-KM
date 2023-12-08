import { Component, OnDestroy, OnInit } from '@angular/core';
import { faBell, faHouse, faUserGroup, faImage, faBookOpen, faGlobe, faBars, faBasketball, faComment, faVolumeHigh, faCirclePlay, faCoins, faChevronLeft, faLightbulb, faTag, faUsers, faFlag, faSearch, faPlus, faFileExcel, faFilter, faClipboardList, faBan, faRotateLeft, faChartLine, faBookmark, faCommentDots, faMap, faGear } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header-admin',
  templateUrl: './header-admin.component.html',
  styleUrls: ['./header-admin.component.css'],
})
export class HeaderAdminComponent implements OnInit, OnDestroy {
  isSidebarHidden = false;

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  faBookmark = faBookmark;
  faChartLine = faChartLine;
  faBell = faBell;
  faPlus = faPlus;
  faBan = faBan;
  faRotateLeft = faRotateLeft;
  faClipboardList = faClipboardList;
  faFilter = faFilter;
  faFileExcel = faFileExcel;
  faFlag = faFlag;
  faSearch = faSearch;
  faUsers = faUsers;
  faTag = faTag;
  faLightbulb = faLightbulb;
  faHouse = faHouse;
  faUserGroup = faUserGroup;
  faImage = faImage;
  faBookOpen = faBookOpen;
  faGlobe = faGlobe;
  faBars = faBars;
  faBasketball = faBasketball;
  faComment = faComment;
  faCirclePlay = faCirclePlay;
  faVolumeHigh = faVolumeHigh;
  faCoins = faCoins;
  faChevronLeft = faChevronLeft;
  faCommentDots = faCommentDots;
  faMap = faMap;
  faGear = faGear;
  logo_nex = '../../../../assets/image/nex-logo.png';

  notif: any = {
    spdoc_notif: [
      {
        title: 'New Notif',
        sender_personal_number: '582127',
        sender_personal_name: 'Ade Maruf amin',
        created_at: '2023-03-01',
      },
      {
        title: 'New Notif',
        sender_personal_number: '582127',
        sender_personal_name: 'Ade Maruf amin',
        created_at: '2023-03-01',
      },
    ],
  };

  ngOnInit(): void { }
  ngOnDestroy(): void { }
}
