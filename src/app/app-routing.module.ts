import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/utility/app.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

const routes: Routes = [
  //Default Route
  {
    path: '',
    data: { title: 'Home', roles: ['user'] },
    loadChildren: () =>
      import('./pages/user/user.module').then((m) => m.UserModule),
    canActivate: [AuthGuard],
  },

  //Admin Route
  {
    path: 'admin',
    data: { title: 'Admin', roles: ['admin'] },
    loadChildren: () =>
      import('./pages/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
  },

  //User Route
  {
    path: 'user',
    data: { title: 'Home', roles: ['user'] },
    loadChildren: () =>
      import('./pages/user/user.module').then((m) => m.UserModule),
    canActivate: [AuthGuard],
  },

  //404 Not Found
  {
    path: '**',
    data: { title: 'Not Found 404', roles: ['user', 'admin'] },
    component: NotFoundComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
