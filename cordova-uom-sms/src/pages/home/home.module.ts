import { ProgressBarComponent } from './../../components/progress-bar/progress-bar';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    HomePage,
    ProgressBarComponent
  ],
  imports: [
    ChartsModule,
    IonicPageModule.forChild(HomePage),
  ],
})
export class HomePageModule {}
