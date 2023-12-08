import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Subscription, debounceTime, filter, map, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import {
  faArrowRight,
  faBell,
  faGear,
  faSearch,
  faFilter,
  faPrint,
  faCircleCheck,
  faEye,
  faStar,
  faBan,
  faXmark,
  faPencil,
  faPlus,
  faTrash,
  faBookmark,
  faCircleChevronLeft,
  faCircleChevronRight,
  faSadTear,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MasterPermissionDTO,
  RolePermissionCreateDTO,
  RolePermissionDTO,
  UserInRoleCreateDTO,
  UserInRoleDTO,
  masterPermissionSelectDTO,
} from 'src/app/pages/user/home-page/dtos/role-permission.dto';
import { Modal, Ripple, Tab, initTE } from 'tw-elements';
import Swal from 'sweetalert2';
import { UserListDTO } from 'src/app/pages/user/home-page/dtos/user-list.dto';

@Component({
  selector: 'app-role-permission',
  templateUrl: './role-permission.component.html',
  styleUrls: ['./role-permission.component.css'],
})
export class RolePermissionComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly hompageService: HomePageService,
    private readonly keycloakService: KeycloakService
  ) {
    super(RolePermissionComponent.name);
    this.initTitle();
  }

  title: any;
  obs!: Subscription;

  uuid!: string | null;
  addOredit: boolean = false;
  adduserx: boolean = false;
  diag: boolean = true;
  roleId!: number;

  faArrowRight = faArrowRight;
  faBell = faBell;
  faGear = faGear;
  faSearch = faSearch;
  faFilter = faFilter;
  faPrint = faPrint;
  faCircleCheck = faCircleCheck;
  faEye = faEye;
  faStar = faStar;
  faBan = faBan;
  faXmark = faXmark;
  faPencil = faPencil;
  faPlus = faPlus;
  faTrash = faTrash;
  faBookmark = faBookmark;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faSadTear = faSadTear;
  faListCheck = faListCheck;

  permissionSelector: masterPermissionSelectDTO[] = [];
  permissionSelected: MasterPermissionDTO[] = [];
  permissionSelectedLive: MasterPermissionDTO[] = [];
  pageSelected: number = 1;
  limitSelected: number = 10;
  searchSelected: string = '';
  totalDataSelected: number = 0;
  pageDataSelected: Array<number> = [];

  mformPermissionSelected: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.pageSelected),
    limit: new FormControl(this.limitSelected),
  });

  dataUser: UserListDTO[] = [];
  mformUser: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.pageSelected),
    limit: new FormControl(this.limitSelected),
  });
  pageUser: number = 1;
  limitUser: number = 10;
  searchUser: string = '';
  sortByhUser: string = 'desc';
  totalDataUser: number = 0;
  pageDataUser: Array<number> = [];

  userInRole: UserInRoleDTO[] = [];
  pageUserInRole: number = 1;
  limitUserInRole: number = 10;
  searchUserInRole: string = '';
  totalDataUserInRole: number = 0;
  pageDataUserInRole: Array<number> = [];
  nameRole!: string;
  descRole!: string;

  mformUserInRole: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.pageUserInRole),
    limit: new FormControl(this.limitUserInRole),
  });

  roleData: RolePermissionDTO[] = [];
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'desc';
  totalData: number = 0;
  pageData: Array<number> = [];

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  dataPage: string[] = ['ADMIN', 'USER'];

  permissionMaster: MasterPermissionDTO[] = [];
  pagePermission: number = 1;
  limitPermission: number = 10;
  searchPermission: string = '';
  sortByPermission: string = 'desc';
  totalDataPermission: number = 0;
  pageDataPermission: Array<number> = [];

  mformPermission: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  submitForm: FormGroup = new FormGroup({
    roleName: new FormControl('', [Validators.required]),
    pageAccess: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    initTE({ Modal, Ripple, Tab });
    this.getDataRole(this.page, this.limit, this.search, this.sortBy);

    // Live Search For Create Role
    this.obs = this.mformPermission.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1
            ? this.mformPermission.get('page')?.setValue(1)
            : data.page;
        } else {
          const limitx =
            Number(data.limit) + Number(this.permissionSelected.length);
          this.getDataPermission(
            data.page,
            data.search != '' || null ? data.limit : limitx,
            data.search
          );
          this.diag = true;
        }
      });

    // Live Search For User In Role
    this.obs = this.mformUserInRole.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1
            ? this.mformUserInRole.get('page')?.setValue(1)
            : data.page;
        } else {
          this.getDataUserInRole(
            this.roleId,
            data.page,
            data.limit,
            data.search
          );
        }
      });

    // Live Search For Permission Registered
    this.obs = this.mformPermissionSelected.valueChanges
      .pipe()
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1
            ? this.mformPermissionSelected.get('page')?.setValue(1)
            : data.page;
        } else {
          this.getDataPermissionSelected(data.page, data.limit, data.search);
        }
      });

    // Live Search User List
    this.obs = this.mformUser.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mformUser.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataUserList(
            data.page,
            data.limit,
            data.search,
            this.sortByhUser
          );
        }
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  initTitle(): void {
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
  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  // Delete Data Role
  async deleteDataRole(uuid: string): Promise<void> {
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.hompageService.deleteRolePermission(uuid).subscribe(() =>
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Role was successfully deleted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.submitForm.get('title')?.reset();
              this.getDataRole(this.page, this.limit, this.search, this.sortBy);
            })
          );
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // Get Data Role
  async getDataRole(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.hompageService
        .getRoles(page, limit, search, sortBy)
        .subscribe((response) => {
          this.roleData = response.data.result;
          this.totalData = response.data.total;
        });
    } catch (error) {
      throw error;
    }
  }

  // Get Data Permission
  async getDataPermission(
    page: number,
    limit: number,
    search: string
  ): Promise<void> {
    try {
      this.hompageService
        .getMasterPermission(page, limit, search)
        .subscribe((response) => {
          if (response.data.result) {
            this.permissionMaster = response.data.result.filter((data) => {
              const id = data.id;
              return !this.permissionSelected.some(
                (selectedItem) => selectedItem.id === id
              );
            });
          } else {
            this.permissionMaster = response.data.result;
          }
          this.totalDataPermission = response.data.total;
          this.paginate(
            this.totalDataPermission,
            this.limitPermission,
            this.pageDataPermission
          );
        });
    } catch (error) {
      throw error;
    }
  }

  // Create Data Permission
  async createDataPermission(): Promise<void> {
    try {
      if (this.submitForm.valid && this.permissionSelector) {
        const dto: RolePermissionCreateDTO = {
          name: this.submitForm.get('roleName')?.value,
          page: this.submitForm.get('pageAccess')?.value,
          description: this.submitForm.get('description')?.value,
          permission: this.permissionSelector,
        };
        this.hompageService.createRolePermission(dto).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Role & Permission has created!',
            timer: 1000,
            showConfirmButton: false,
          }).then(() =>
            this.getDataRole(this.page, this.limit, this.search, this.sortBy)
          );
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Update Data Permission
  async updateDataRolePermission(): Promise<void> {
    try {
      if (this.submitForm.valid && this.permissionSelector) {
        const dto: RolePermissionCreateDTO = {
          name: this.submitForm.get('roleName')?.value,
          page: this.submitForm.get('pageAccess')?.value,
          description: this.submitForm.get('description')?.value,
          permission: this.permissionSelector,
        };
        this.hompageService
          .updateRolePermission(this.uuid!, dto)
          .subscribe(() => {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Role & Permission has created!',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getDataRole(this.page, this.limit, this.search, this.sortBy);
              this.resetPermission();
            });
          });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: 'Please check your data before submit.',
          timer: 1000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Get Data User In Role
  async getDataUserInRole(
    roleId: number,
    page: number,
    limit: number,
    search: string
  ): Promise<void> {
    try {
      this.hompageService
        .getUserInRole(roleId, page, limit, search)
        .subscribe((response) => {
          this.userInRole = response.data.result;
          this.totalDataUserInRole = response.data.total;
          this.paginate(
            this.totalDataUserInRole,
            this.limit,
            this.pageDataUserInRole
          );
        });
    } catch (error) {
      throw error;
    }
  }

  // Get Permission In Role
  async getDataPermissionInRole(uuid: string): Promise<void> {
    try {
      this.hompageService.getPermissionInRole(uuid).subscribe((response) => {
        this.submitForm.get('roleName')?.setValue(response.data.name);
        this.submitForm.get('pageAccess')?.setValue(response.data.page);
        this.submitForm.get('description')?.setValue(response.data.description);
        response.data.permissionRole.map((data) => {
          this.permissionSelected.push(data.permissionMaster);
          const dto: masterPermissionSelectDTO = {
            masterPermissionId: data.masterPermissionId,
          };
          this.permissionSelector.push(dto);
        });
        this.getDataPermissionSelected(
          this.pageSelected,
          this.limitSelected,
          this.searchSelected
        );
        this.getDataPermission(this.page, this.limit, this.search);
      });
    } catch (error) {
      throw error;
    }
  }

  // Delete User Role
  async deleteDataUserInRole(uuid: string): Promise<void> {
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.hompageService.deleteUserInRole(uuid).subscribe(() =>
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'User was successfully deleted.',
              timer: 1000,
              showConfirmButton: false,
            }).then(() => {
              this.getDataUserInRole(
                this.roleId,
                this.pageUserInRole,
                this.limitUserInRole,
                this.searchUserInRole
              );
            })
          );
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // Get User List
  async getDataUserList(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.hompageService
        .getUserList(page, limit, search, sortBy)
        .subscribe((response) => {
          if (response.data.result && this.userInRole) {
            this.dataUser = response.data.result.filter((data) => {
              const id = data.id;
              return !this.userInRole.some(
                (selectedItem) => selectedItem.userId === id
              );
            });
          } else {
            this.dataUser = response.data.result;
          }
          this.totalDataUser = response.data.total;
          this.paginate(this.totalDataUser, this.limitUser, this.pageDataUser);
        });
    } catch (error) {
      throw error;
    }
  }

  // Create User In Role
  async createDataUserInRole(roleId: number, userId: number): Promise<void> {
    try {
      const dto: UserInRoleCreateDTO = {
        roleId: roleId,
        userId: userId,
      };
      this.hompageService.createUserInRole(dto).subscribe(() => {
        this.getDataUserInRole(
          this.roleId,
          this.pageUserInRole,
          this.limitUserInRole,
          this.searchUserInRole
        );
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'User was successfully registered.',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          this.getDataUserList(
            this.pageUser,
            this.limitUser,
            this.searchUser,
            this.sortByhUser
          );
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async editRole(
    uuid: string,
    roleId: number,
    name: string,
    desc: string
  ): Promise<void> {
    try {
      this.uuid = uuid;
      this.resetPermission();
      this.getDataPermissionInRole(uuid);
      this.getDataUserInRole(
        roleId,
        this.pageUserInRole,
        this.limitUserInRole,
        this.searchUserInRole
      );
      this.roleId = roleId;
      this.nameRole = name;
      this.descRole = desc;
    } catch (error) {
      throw error;
    }
  }

  callModal(
    title: string | null,
    uuid: string | null,
    addOredit: boolean
  ): void {
    this.resetPermission();
    this.getDataPermission(this.page, this.limit, this.search);
    this.submitForm.get('title')?.reset();
    this.submitForm.get('title')?.setValue(title);
    this.uuid = uuid;
    this.addOredit = addOredit;
  }

  nextPage(): void {
    if (this.pageData.length > 1) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value + 1);
    }
  }
  prevPage(): void {
    if (this.pageData.length > 1) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value - 1);
    }
  }

  nextPagePermission(): void {
    if (this.pageDataPermission.length > 1) {
      this.mformPermission
        .get('page')
        ?.setValue(this.mformPermission.get('page')?.value + 1);
    }
  }
  prevPagePermission(): void {
    if (this.pageDataPermission.length > 1) {
      this.mformPermission
        .get('page')
        ?.setValue(this.mformPermission.get('page')?.value - 1);
    }
  }

  nextPageUserInRole(): void {
    if (this.pageDataUserInRole.length > 1) {
      this.mformUserInRole
        .get('page')
        ?.setValue(this.mformUserInRole.get('page')?.value + 1);
    }
  }
  prevPageUserInRole(): void {
    if (this.pageDataUserInRole.length > 1) {
      this.mformUserInRole
        .get('page')
        ?.setValue(this.mformUserInRole.get('page')?.value - 1);
    }
  }

  nextPagePermReg(): void {
    this.mformPermissionSelected
      .get('page')
      ?.setValue(this.mformPermissionSelected.get('page')?.value + 1);
  }
  prevPagePermReg(): void {
    this.mformPermissionSelected
      .get('page')
      ?.setValue(this.mformPermissionSelected.get('page')?.value - 1);
  }

  nextPageUser(): void {
    this.mformUser.get('page')?.setValue(this.mformUser.get('page')?.value + 1);
  }
  prevPageUser(): void {
    this.mformUser.get('page')?.setValue(this.mformUser.get('page')?.value - 1);
  }

  // Selection
  selectPermission(data: MasterPermissionDTO): void {
    this.diag = false;
    this.permissionSelectedLive = this.permissionSelected;
    const dto: masterPermissionSelectDTO = {
      masterPermissionId: data.id,
    };
    const exitingIndex = this.permissionSelector.findIndex(
      (item) => item.masterPermissionId === data.id
    );
    if (exitingIndex !== -1) {
      this.permissionSelector.splice(exitingIndex, 1);
      this.permissionSelected.splice(exitingIndex, 1);
      this.permissionSelectedLive.splice(exitingIndex, 1);
    } else {
      this.permissionSelector.push(dto);
      this.permissionSelected.push(data);
    }
    this.mformPermission.get('page')?.setValue(1);
    this.mformPermissionSelected.get('page')?.setValue(1);
  }

  // Remove Selection
  unSelectPermission(data: MasterPermissionDTO): void {
    const indexSelector = this.permissionSelector.findIndex(
      (item) => item.masterPermissionId === data.id
    );
    const indexSelected = this.permissionSelected.findIndex(
      (item) => item.id === data.id
    );
    const indexSelectedLive = this.permissionSelectedLive.findIndex(
      (item) => item.id === data.id
    );

    if (indexSelector !== -1) {
      this.permissionSelector.splice(indexSelector, 1);
    }

    if (indexSelected !== -1) {
      this.permissionSelected.splice(indexSelected, 1);
    }

    if (indexSelectedLive !== -1) {
      this.permissionSelectedLive.splice(indexSelectedLive, 1);
    }
    this.mformPermission.get('page')?.setValue(1);
    this.mformPermissionSelected.get('page')?.setValue(1);
  }

  getDataPermissionSelected(
    page: number,
    limit: number,
    searchTerm: string
  ): MasterPermissionDTO[] {
    this.permissionSelectedLive = this.permissionSelected;
    const searchTermLower = searchTerm.toLowerCase();
    const filteredData = this.permissionSelectedLive.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTermLower) ||
        item.description.toLowerCase().includes(searchTermLower)
    );
    filteredData.sort((a, b) => b.id - a.id);
    const startIndex = (page - 1) * limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + limit);
    if (filteredData.length === 0) {
      this.paginate(filteredData.length, limit, this.pageDataSelected);
      return (this.permissionSelectedLive = []);
    }
    this.paginate(paginatedData.length, limit, this.pageDataSelected);
    return (this.permissionSelectedLive = paginatedData);
  }

  edit(): void {
    this.addOredit = !this.addOredit;
  }

  resetPermission(): void {
    this.addOredit = false;
    this.permissionSelected = [];
    this.permissionSelector = [];
    this.permissionSelectedLive = [];
  }

  addUserAction(): void {
    this.adduserx = !this.adduserx;
    if (this.adduserx) {
      this.getDataUserList(
        this.pageUser,
        this.limitUser,
        this.searchUser,
        this.sortByhUser
      );
    }
  }
}
