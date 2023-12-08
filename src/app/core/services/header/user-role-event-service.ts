import { BehaviorSubject } from 'rxjs';

export class UserRoleEventService {
  private roleSelectedEvent = new BehaviorSubject<string | null>(null);

  emitRoleSelectedEvent(value: string | null) {
    this.roleSelectedEvent.next(value);
  }

  roleSelectedEventListener() {
    return this.roleSelectedEvent.asObservable();
  }
}
