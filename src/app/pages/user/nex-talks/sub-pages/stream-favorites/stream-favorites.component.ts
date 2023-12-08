import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-stream-favorites',
  templateUrl: './stream-favorites.component.html',
  styleUrls: ['./stream-favorites.component.css'],
})
export class StreamFavoritesComponent implements OnInit, OnDestroy {
  faSearch = faSearch;
  constructor(private readonly router: Router) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  streamStreaming(): void {
    this.router.navigate(['/nex-talks/stream/streaming']);
  }
}
