import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { faCircleChevronLeft, faCircleChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnDestroy {
    faCircleChevronLeft = faCircleChevronLeft;
    faCircleChevronRight = faCircleChevronRight;

    @Input() currentPage: number = 1;
    // @Input() itemsPerPage: number;
    // @Input() totalItems: number;
    @Input() totalPages: number = 0;
    @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

    constructor() { }

    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }

    // get totalPages(): number {
    //     return Math.ceil(this.totalItems / this.itemsPerPage);
    // }

    onPageChange(page: number): void {
        console.log(`Page changed to ${page}`);

        // if (page >=1 && page <= this.totalPages) {
        //     this.currentPage = page
        // }
    }

    nextPage() {
        throw new Error('Method not implemented.');
    }
}
