import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { of, Subject } from 'rxjs';
import { AppEntrypointComponent } from './app-entrypoint.component';

describe('AppEntrypointComponent', () => {
  let component: AppEntrypointComponent;
  let onLangChange$: Subject<unknown>;
  let onTranslationChange$: Subject<unknown>;
  let onDefaultLangChange$: Subject<unknown>;
  let translateService: jest.Mocked<TranslateService>;
  let primeNgConfig: jest.Mocked<PrimeNGConfig>;

  beforeEach(() => {
    onLangChange$ = new Subject();
    onTranslationChange$ = new Subject();
    onDefaultLangChange$ = new Subject();

    translateService = {
      onLangChange: onLangChange$.asObservable(),
      onTranslationChange: onTranslationChange$.asObservable(),
      onDefaultLangChange: onDefaultLangChange$.asObservable(),
      get: jest.fn().mockReturnValue(of({ accept: 'OK' })),
    } as unknown as jest.Mocked<TranslateService>;

    primeNgConfig = {
      setTranslation: jest.fn(),
    } as unknown as jest.Mocked<PrimeNGConfig>;

    component = new AppEntrypointComponent(translateService, primeNgConfig);
  });

  it('should set PrimeNG translation when language change event is emitted', () => {
    component.ngOnInit();

    onLangChange$.next({});

    expect(translateService.get).toHaveBeenCalledWith('primeng');
    expect(primeNgConfig.setTranslation).toHaveBeenCalledWith({ accept: 'OK' });
  });

  it('should set PrimeNG translation when translation change event is emitted', () => {
    component.ngOnInit();

    onTranslationChange$.next({});

    expect(translateService.get).toHaveBeenCalledWith('primeng');
    expect(primeNgConfig.setTranslation).toHaveBeenCalledWith({ accept: 'OK' });
  });

  it('should set PrimeNG translation when default language change event is emitted', () => {
    component.ngOnInit();

    onDefaultLangChange$.next({});

    expect(translateService.get).toHaveBeenCalledWith('primeng');
    expect(primeNgConfig.setTranslation).toHaveBeenCalledWith({ accept: 'OK' });
  });
});
