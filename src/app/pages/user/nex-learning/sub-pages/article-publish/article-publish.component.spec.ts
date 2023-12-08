import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlePublishComponent } from './article-publish.component';

describe('ArticlePublishComponent', () => {
  let component: ArticlePublishComponent;
  let fixture: ComponentFixture<ArticlePublishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArticlePublishComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ArticlePublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
