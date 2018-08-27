import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { OneSignal } from '@ionic-native/onesignal';
import { SMS } from '@ionic-native/sms';
import { SqlLiteServiceProvider } from '../providers/sql-lite-service/sql-lite-service';
import { SQLite } from '@ionic-native/sqlite';
import { BackgroundMode } from '@ionic-native/background-mode';
import { SettingsProvider } from '../providers/settings/settings';
import { MessageProvider } from '../providers/message/message';
import { Network } from '@ionic-native/network';
import { HttpModule } from '@angular/http';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
 //   HomePage,
    TabsPage
  ],
  providers: [
    AndroidPermissions,
    Network,
    BackgroundMode,
    SQLite,
    SqlLiteServiceProvider,
    SMS,
    OneSignal,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SettingsProvider,
    MessageProvider,
  ]
})
export class AppModule {}
