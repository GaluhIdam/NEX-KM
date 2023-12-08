import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutAdminComponent } from './components/admin-component/layout-admin/layout-admin.component';
import { LayoutUserComponent } from './components/user-component/layout-user/layout-user.component';
import { HeaderUserComponent } from './components/user-component/header-user/header-user.component';
import { HeaderAdminComponent } from './components/admin-component/header-admin/header-admin.component';
import { FooterUserComponent } from './components/user-component/footer-user/footer-user.component';
import { LoadingComponent } from './components/loading/loading.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ServiceErrorComponent } from './components/service-error/service-error.component';
import { ModalCenterComponent } from './components/modal-center/modal-center.component';
import { ButtonModalCenterComponent } from './components/button-modal-center/button-modal-center.component';
import { TableRowLongestTextTooltipComponent } from './components/table-row-longest-text-tooltip/table-row-longest-text-tooltip.component';
import { ReportModalComponent } from './components/report-modal/report-modal.component';
import { ShareModalComponent } from './components/share-modal/share-modal.component';
import { UnderConstructionPageComponent } from './components/under-construction-page/under-construction-page.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ReadBookModalComponent } from './components/read-book-modal/read-book-modal.component';

@NgModule({
  declarations: [
    LayoutAdminComponent,
    LayoutUserComponent,
    HeaderUserComponent,
    HeaderAdminComponent,
    FooterUserComponent,
    LoadingComponent,
    NotFoundComponent,
    ServiceErrorComponent,
    ModalCenterComponent,
    ButtonModalCenterComponent,
    TableRowLongestTextTooltipComponent,
    ReportModalComponent,
    ShareModalComponent,
    UnderConstructionPageComponent,
    ReadBookModalComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    FormsModule,
    NgxExtendedPdfViewerModule,
  ],
  exports: [
    LayoutAdminComponent,
    LayoutUserComponent,
    HeaderUserComponent,
    HeaderAdminComponent,
    FooterUserComponent,
    LoadingComponent,
    NotFoundComponent,
    ServiceErrorComponent,
    ModalCenterComponent,
    ButtonModalCenterComponent,
    TableRowLongestTextTooltipComponent,
    ShareModalComponent,
    ReportModalComponent,
    UnderConstructionPageComponent,
    ReadBookModalComponent,
  ],
})
export class SharedModule {}
