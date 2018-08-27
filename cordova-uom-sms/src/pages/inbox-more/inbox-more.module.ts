import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InboxMorePage } from './inbox-more';

@NgModule({
  declarations: [
    InboxMorePage,
  ],
  imports: [
    IonicPageModule.forChild(InboxMorePage),
  ],
})
export class InboxMorePageModule {}
