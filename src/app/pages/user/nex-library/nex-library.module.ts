import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NexLibraryRoutingModule } from './nex-library-routing.module';
import { NexLibraryComponent } from './nex-library.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { PublishBookComponent } from './sub-pages/publish-book/publish-book.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { DetailBookComponent } from './sub-pages/detail-book/detail-book.component';
import { EditBookComponent } from './sub-pages/edit-book/edit-book.component';
import { MyCollectionComponent } from './sub-pages/manage-book/my-collection/my-collection.component';
import { MyEbookComponent } from './sub-pages/manage-book/my-ebook/my-ebook.component';
import { AlbumComponent } from './sub-pages/album/album.component';
import { PublishAlbumComponent } from './sub-pages/publish-album/publish-album.component';
import { MyAlbumComponent } from './sub-pages/my-album/my-album.component';
import { EbookComponent } from './sub-pages/ebook/ebook.component';
import { DetailAlbumComponent } from './sub-pages/detail-album/detail-album.component';
import { EditAlbumComponent } from './sub-pages/edit-album/edit-album.component';
import { DirectoryComponent } from './sub-pages/directory/directory.component';
import { PublishDirectoryComponent } from './sub-pages/publish-directory/publish-directory.component';
import { MyDirectoryComponent } from './sub-pages/my-directory/my-directory.component';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { EBookCategoryDataService } from 'src/app/core/services/nex-library/ebook-category-data.service';
import { UnitDinasDataService } from 'src/app/core/services/nex-library/unit-dinas-data.service';
import { AlbumCategoryDataService } from 'src/app/core/services/nex-library/album-category-data.service';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { AlbumGalleryDataService } from 'src/app/core/services/nex-library/album-gallery-data.service';
import { EBookReviewDataService } from 'src/app/core/services/nex-library/ebook-review-data.service';
import { WebDirectoryDataService } from 'src/app/core/services/nex-library/web-directory.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ManageBookComponent } from './sub-pages/manage-book/manage-book.component';
import { EBookCollectionDataService } from 'src/app/core/services/nex-library/ebook-collection-data.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { ManageDirectoryComponent } from './sub-pages/manage-directory/manage-directory.component';
import { EditDirectoryComponent } from './sub-pages/edit-directory/edit-directory.component';

@NgModule({
  declarations: [
    NexLibraryComponent,
    PublishBookComponent,
    MyCollectionComponent,
    MyEbookComponent,
    DetailBookComponent,
    EditBookComponent,
    AlbumComponent,
    PublishAlbumComponent,
    MyAlbumComponent,
    EbookComponent,
    DetailAlbumComponent,
    EditAlbumComponent,
    DirectoryComponent,
    PublishDirectoryComponent,
    MyDirectoryComponent,
    ManageBookComponent,
    ManageDirectoryComponent,
    EditDirectoryComponent,
  ],
  imports: [
    CommonModule,
    NexLibraryRoutingModule,
    FontAwesomeModule,
    CarouselModule,
    NgxDropzoneModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
  ],
  providers: [
    AlbumCategoryDataService,
    AlbumDataService,
    AlbumGalleryDataService,
    EBookCategoryDataService,
    EBookDataService,
    EBookCollectionDataService,
    EBookReviewDataService,
    UnitDinasDataService,
    WebDirectoryDataService,
  ],
})
export class NexLibraryModule {}
