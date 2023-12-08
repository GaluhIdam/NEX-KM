import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NexLevelComponent } from './nex-level.component';
import { MerchandiseComponent } from './sub-pages/merchandise/merchandise.component';
import { DetailMerchandiseComponent } from './sub-pages/detail-merchandise/detail-merchandise.component';

const routes: Routes = [
  { path: '', component: NexLevelComponent },
  {
    path: 'merchandise',
    component: MerchandiseComponent,
  },
  {
    path: 'merchandise/:uuid',
    component: DetailMerchandiseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NexLevelRoutingModule {}
