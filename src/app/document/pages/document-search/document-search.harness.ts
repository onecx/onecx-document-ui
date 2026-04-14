import { ComponentHarness } from '@angular/cdk/testing';
import {
  GroupByCountDiagramHarness,
  InteractiveDataViewHarness,
  SearchHeaderHarness,
} from '@onecx/angular-accelerator/testing';

export class DocumentSearchHarness extends ComponentHarness {
  static readonly hostSelector = 'app-document-search';

  getHeader = this.locatorFor(SearchHeaderHarness);
  getSearchResults = this.locatorFor(InteractiveDataViewHarness);
  getDiagram = this.locatorForOptional(GroupByCountDiagramHarness);
}
