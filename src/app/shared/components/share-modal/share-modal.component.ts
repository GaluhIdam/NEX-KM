import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { Modal, Ripple, initTE } from 'tw-elements';

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.css'],
})
export class ShareModalComponent implements OnInit, OnDestroy {
  @Input() uuid!: string;
  @Input() content!: string;
  @Input() urlToShare!: string;

  form!: FormGroup;
  isLoading: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly toastr: ToastrService
  ) {
    this.isLoading = false;
  }

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.form = this.fb.group({
      longLink: [this.urlToShare, [Validators.required]],
      shortLink: new FormControl({ value: null, disabled: true }),
    });
  }
  ngOnDestroy(): void {}

  onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      try {
        navigator.clipboard.writeText(this.form.get('longLink')?.value);
        setTimeout(() => {
          this.isLoading = false;
          this.toastr.success('URL copied successfully');
        }, 1000);
      } catch {
        this.toastr.error('Error while copying URL');
      }
    } else {
      this.toastr.error('Invalid URL');
    }
  }
}
