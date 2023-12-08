import { Component } from '@angular/core';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { ManageBookDTO } from './dto/manage-book.dto';
import { LocalService } from 'src/app/core/services/local/local.service';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-manage-book',
  templateUrl: './manage-book.component.html',
  styleUrls: ['./manage-book.component.css'],
})
export class ManageBookComponent {
  faChevronRight = faChevronRight;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faSearch = faSearch;
  faBookBookmark = faBookBookmark;

  //Category  Data
  manageBookCategoryData: ManageBookDTO[] = [
    {
      name: 'My Collection',
    },
    {
      name: 'My Ebook',
    },
  ];

  selectedManageBookCategory: ManageBookDTO;

  constructor(private readonly localService: LocalService) {
    const selectedCategory = this.localService.getData(
      'selected_manage_book_category'
    );
    if (selectedCategory !== null) {
      this.selectedManageBookCategory = JSON.parse(selectedCategory);
    } else {
      this.selectedManageBookCategory = this.manageBookCategoryData[0];
    }
  }

  onChangeManageBookCategory(manageBookCategory: ManageBookDTO): void {
    this.localService.saveData(
      'selected_manage_book_category',
      JSON.stringify(manageBookCategory)
    );
    this.selectedManageBookCategory = manageBookCategory;
  }
}
