import { ComponentHarness } from '@angular/cdk/testing';
import {
  DataTableHarness,
  PageHeaderHarness,
} from '@onecx/angular-accelerator/testing';

export class DocumentDetailsHarness extends ComponentHarness {
  static hostSelector = 'app-document-details';

  getHeader = this.locatorFor(PageHeaderHarness);
  getDataTable = this.locatorFor(DataTableHarness);
}
