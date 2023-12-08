import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  player: Plyr | undefined;

  public getPlayer() {
    return this.player;
  }

  public setPlayer(player: Plyr) {
    this.player = player;
  }

  public playPlayer() {
    this.player?.play();
  }

  public pausePlayer() {
    this.player?.pause();
  }
}
