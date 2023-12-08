import { MyDirectoryComponent } from './sub-pages/my-directory/my-directory.component';
import { PublishDirectoryComponent } from './sub-pages/publish-directory/publish-directory.component';
import { DirectoryComponent } from './sub-pages/directory/directory.component';
import { EditAlbumComponent } from './sub-pages/edit-album/edit-album.component';
import { MyAlbumComponent } from './sub-pages/my-album/my-album.component';
import { PublishAlbumComponent } from './sub-pages/publish-album/publish-album.component';
import { AlbumComponent } from './sub-pages/album/album.component';
import { EditBookComponent } from './sub-pages/edit-book/edit-book.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NexLibraryComponent } from './nex-library.component';
import { PublishBookComponent } from './sub-pages/publish-book/publish-book.component';
import { DetailBookComponent } from './sub-pages/detail-book/detail-book.component';
import { EbookComponent } from './sub-pages/ebook/ebook.component';
import { ManageBookComponent } from './sub-pages/manage-book/manage-book.component';
import { DetailAlbumComponent } from './sub-pages/detail-album/detail-album.component';
import { ManageDirectoryComponent } from './sub-pages/manage-directory/manage-directory.component';
import { EditDirectoryComponent } from './sub-pages/edit-directory/edit-directory.component';

const routes: Routes = [
  { path: '', component: NexLibraryComponent },
  { path: 'ebook', component: EbookComponent },
  { path: 'ebook/:uuid', component: DetailBookComponent },
  { path: 'publish-book', component: PublishBookComponent },
  { path: 'manage-book', component: ManageBookComponent },
  { path: 'ebook-edit/:uuid', component: EditBookComponent },
  { path: 'album', component: AlbumComponent },
  { path: 'album/:uuid', component: DetailAlbumComponent },
  { path: 'publish-album', component: PublishAlbumComponent },
  { path: 'my-album', component: MyAlbumComponent },
  { path: 'edit-album/:uuid', component: EditAlbumComponent },
  { path: 'directory', component: DirectoryComponent },
  { path: 'publish-directory', component: PublishDirectoryComponent },
  { path: 'manage-directory', component: ManageDirectoryComponent },
  { path: 'directory-edit/:uuid', component: EditDirectoryComponent },
  { path: 'my-directory', component: MyDirectoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NexLibraryRoutingModule {}
