import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { provideUserServiceMock } from '@onecx/angular-integration-interface/mocks';
import {
  BreadcrumbService,
  HAS_PERMISSION_CHECKER,
  PortalCoreModule,
  UserService,
} from '@onecx/portal-integration-angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { PrimeIcons } from 'primeng/api';
import { of } from 'rxjs';
import { DocumentDetailsActions } from './document-details.actions';
import { DocumentDetailsComponent } from './document-details.component';
import { DocumentDetailsHarness } from './document-details.harness';
import { initialState } from './document-details.reducers';
import { selectDocumentDetailsViewModel } from './document-details.selectors';
import { DocumentDetailsViewModel } from './document-details.viewmodel';

describe('DocumentDetailsComponent', () => {
  const origAddEventListener = window.addEventListener;
  const origPostMessage = window.postMessage;

  let listeners: any[] = [];
  window.addEventListener = (_type: any, listener: any) => {
    listeners.push(listener);
  };

  window.removeEventListener = (_type: any, listener: any) => {
    listeners = listeners.filter((l) => l !== listener);
  };

  window.postMessage = (m: any) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    listeners.forEach((l) =>
      l({
        data: m,
        stopImmediatePropagation: () => {},
        stopPropagation: () => {},
      })
    );
  };

  afterAll(() => {
    window.addEventListener = origAddEventListener;
    window.postMessage = origPostMessage;
  });

  let component: DocumentDetailsComponent;
  let fixture: ComponentFixture<DocumentDetailsComponent>;
  let store: MockStore<Store>;
  let breadcrumbService: BreadcrumbService;
  let documentDetails: DocumentDetailsHarness;

  const mockActivatedRoute = {
    snapshot: {
      data: {},
    },
  };
  const baseDocumentDetailsViewModel: DocumentDetailsViewModel = {
    details: undefined,
    detailsLoadingIndicator: false,
    detailsLoaded: true,
    backNavigationPossible: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentDetailsComponent],
      imports: [
        PortalCoreModule,
        LetDirective,
        TranslateTestingModule.withTranslations(
          'en',
          require('./../../../../assets/i18n/en.json')
        ).withTranslations('de', require('./../../../../assets/i18n/de.json')),
        HttpClientTestingModule,
      ],
      providers: [
        provideMockStore({
          initialState: { document: { details: initialState } },
        }),
        BreadcrumbService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideUserServiceMock(),
        {
          provide: HAS_PERMISSION_CHECKER,
          useExisting: UserService,
        },
      ],
    }).compileComponents();

    const userService = TestBed.inject(UserService);
    userService.permissions$.next([
      'DOCUMENT#CREATE',
      'DOCUMENT#EDIT',
      'DOCUMENT#DELETE',
      'DOCUMENT#IMPORT',
      'DOCUMENT#EXPORT',
      'DOCUMENT#VIEW',
      'DOCUMENT#SEARCH',
      'DOCUMENT#BACK',
    ]);
    const translateService = TestBed.inject(TranslateService);
    translateService.use('en');

    store = TestBed.inject(MockStore);
    store.overrideSelector(
      selectDocumentDetailsViewModel,
      baseDocumentDetailsViewModel
    );
    store.refreshState();

    fixture = TestBed.createComponent(DocumentDetailsComponent);
    component = fixture.componentInstance;
    breadcrumbService = TestBed.inject(BreadcrumbService);
    fixture.detectChanges();
    documentDetails = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      DocumentDetailsHarness
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct breadcrumbs', async () => {
    jest.spyOn(breadcrumbService, 'setItems');

    component.ngOnInit();
    fixture.detectChanges();

    expect(breadcrumbService.setItems).toHaveBeenCalledTimes(1);
    const pageHeader = await documentDetails.getHeader();
    const searchBreadcrumbItem = await pageHeader.getBreadcrumbItem('Details');
    expect(await searchBreadcrumbItem!.getText()).toEqual('Details');
  });

  it('should display translated headers', async () => {
    const pageHeader = await documentDetails.getHeader();
    expect(await pageHeader.getHeaderText()).toEqual('Document Details');
    expect(await pageHeader.getSubheaderText()).toEqual(
      'Display of Document Details'
    );
  });

  it('should have 2 inline actions', async () => {
    const pageHeader = await documentDetails.getHeader();
    const inlineActions = await pageHeader.getInlineActionButtons();
    expect(inlineActions.length).toBe(2);

    const backAction = await pageHeader.getInlineActionButtonByLabel('Back');
    expect(backAction).toBeTruthy();

    const moreAction = await pageHeader.getInlineActionButtonByIcon(
      PrimeIcons.ELLIPSIS_V
    );
    expect(moreAction).toBeTruthy();
  });

  it('should dispatch navigateBackButtonClicked action on back button click', async () => {
    jest.spyOn(window.history, 'back');
    const doneFn = jest.fn();

    const pageHeader = await documentDetails.getHeader();
    const backAction = await pageHeader.getInlineActionButtonByLabel('Back');
    store.scannedActions$
      .pipe(ofType(DocumentDetailsActions.navigateBackButtonClicked))
      .subscribe(() => {
        doneFn();
      });
    await backAction?.click();
    expect(doneFn).toHaveBeenCalledTimes(1);
  });

  it('should display item details in page header', async () => {
    component.headerLabels$ = of([
      {
        label: 'DOCUMENT_DETAILS.FORM.ID',
        labelPipe: TranslatePipe,
        value: 'test id',
      },
      {
        label: 'first',
        value: 'first value',
      },
      {
        label: 'second',
        value: 'second value',
      },
      {
        label: 'third',
        icon: PrimeIcons.PLUS,
      },
      {
        label: 'fourth',
        value: 'fourth value',
        icon: PrimeIcons.QUESTION,
      },
    ]);

    const pageHeader = await documentDetails.getHeader();
    const objectDetails = await pageHeader.getObjectInfos();
    expect(objectDetails.length).toBe(5);

    const idLabel = TestBed.inject(TranslateService).instant(
      'DOCUMENT_DETAILS.FORM.ID'
    );
    const testDetailItem = await pageHeader.getObjectInfoByLabel(idLabel);
    expect(await testDetailItem?.getLabel()).toEqual(idLabel);
    expect(await testDetailItem?.getValue()).toEqual('test id');
    expect(await testDetailItem?.getIcon()).toBeUndefined();

    const firstDetailItem = await pageHeader.getObjectInfoByLabel('first');
    expect(await firstDetailItem?.getLabel()).toEqual('first');
    expect(await firstDetailItem?.getValue()).toEqual('first value');
    expect(await firstDetailItem?.getIcon()).toBeUndefined();

    const secondDetailItem = await pageHeader.getObjectInfoByLabel('second');
    expect(await secondDetailItem?.getLabel()).toEqual('second');
    expect(await secondDetailItem?.getValue()).toEqual('second value');
    expect(await secondDetailItem?.getIcon()).toBeUndefined();

    const thirdDetailItem = await pageHeader.getObjectInfoByLabel('third');
    expect(await thirdDetailItem?.getLabel()).toEqual('third');
    expect(await thirdDetailItem?.getValue()).toEqual('');
    expect(await thirdDetailItem?.getIcon()).toEqual(PrimeIcons.PLUS);

    const fourthDetailItem = await pageHeader.getObjectInfoByLabel('fourth');
    expect(await fourthDetailItem?.getLabel()).toEqual('fourth');
    expect(await fourthDetailItem?.getValue()).toEqual('fourth value');
    expect(await fourthDetailItem?.getIcon()).toEqual(PrimeIcons.QUESTION);
  });
});
