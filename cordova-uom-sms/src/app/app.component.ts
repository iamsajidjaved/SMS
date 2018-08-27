import { MessageProvider } from './../providers/message/message';
import { SettingsProvider } from './../providers/settings/settings';
import { Component, enableProdMode, NgZone } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { OneSignal } from '@ionic-native/onesignal';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Network } from '@ionic-native/network';
import { AndroidPermissions } from '@ionic-native/android-permissions';



//declare var SMS;
declare var window;
enableProdMode();

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;
  process: any = null;
  sendingToServer : boolean = false;
  process_interval = 10000;
  process_start_via_click:boolean = false;
  constructor(
    private network: Network,
    private message: MessageProvider,
    private settings: SettingsProvider,
    private backgroundMode: BackgroundMode,
    public events : Events,
    public zone : NgZone,
    private androidPermissions: AndroidPermissions,
    private oneSignal: OneSignal,
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen
  ) {
    platform.ready().then(() => {
      //this.settings.NOTIFICATION.SOUND
      this.settings.SMS.PACKAGE_USED = 0;
      statusBar.styleDefault();
      splashScreen.hide();
      this.backgroundMode.configure({
        title : "SMS FROM WEB",
        text : "Send sms form your website through your phone.",
      });
      this.backgroundMode.setDefaults({
        title : "SMS FROM WEB",
        text : "Send sms form your website through your phone.",
      });
      this.backgroundMode.enable();

      this.subscribeEvents();
      this.startSendingToServer();

      if(this.settings.appIsConfigured()){
        if(this.settings.SMS.AUTO_SEND){
          this.startSending();
        }
        if(platform.is('android') && platform.is('cordova') && platform.is('mobile')){
          this.initOneSignal();
          //Start Watcing Fro New SMS
          if(this.settings.SERVER.PUSH_INCOMING){
            this.onStatWatching();
          }
        }
      }else{
        // App is not configured
      }

      this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.READ_PHONE_STATE,
        this.androidPermissions.PERMISSION.SEND_SMS,
        this.androidPermissions.PERMISSION.RECEIVE_SMS,
        this.androidPermissions.PERMISSION.READ_SMS
      ]);
    });
  }

  /* onBackButtonClick(platform){
   platform.registerBackButtonAction(() => {
      if (this.nav.canGoBack()) {
        this.nav.pop();
      } else {
          if(this.backButtonTapCount >= 1){
            this.platform.exitApp();
          }else{
            this.presentToast('Tap back again to exit',2000);
            this.backButtonTapCount++;
            setTimeout(()=>{
                this.backButtonTapCount = 0;
            },2000);
          }
      }
    });

  }*/

  stopSendingToServer(){
    this.sendingToServer = false;
  }
  startSendingToServer(){
    if(
      !this.sendingToServer &&
      this.settings.SERVER.PUSH_INCOMING &&
      this.network.type !=null &&
      this.network.type != 'none' &&
      this.settings.isValidURL(this.settings.SERVER.URL)
    ){
     this.sendingToServer = true;
      this.message.select({
        query : "SELECT * FROM messages WHERE status = -1 ORDER BY id DESC LIMIT 1",
        params : [],
        success: result =>{
          if(result.length > 0){
            let data = {
              address : result[0].address,
              body : result[0].body
            }
           this.message.sendToServer(data,res=>{
             this.message.updateStatus({
              id : result[0].id,
              address : result[0].address,
              body: result[0].body
            },-2);
            setTimeout(()=>{
              this.sendingToServer = false;
              this.startSendingToServer();
            },1000);
            },error=>{
              alert('Error sendToServer : '+JSON.stringify(error));
              setTimeout(()=>{
                this.sendingToServer = false;
                this.startSendingToServer();
              },1000);
            });
          }
        },
        error : errors=>{
          alert('Error Select : '+JSON.stringify(errors));
          //this.startSendingToServer();
        }
      });
    }

  }



  onSMSReceived(message){
    this.message.insert(message.address,message.body,-1);
    setTimeout(() => {
      this.startSendingToServer();
    }, 300);
  }


  onStatWatching(){
    this.message.startWatching(()=>{
      //alert('Start Watching')
    });
  }
  onStopWatching(){
    this.message.stopWatching(()=>{
      alert('Stop Watching')
    });
  }
  onSMSIntervalChanged(interval){
    this.onStopSending();
    this.startSending(this.process_start_via_click);
  }
  startSending(onClick:boolean = false){
      this.process_start_via_click = onClick;
      if(this.settings.SMS.AUTO_SEND || onClick){
       this.process =  setTimeout(()=>{
          this.message.selectOne({
            success: message=>{
              this.startSending(this.process_start_via_click);
              if(
                this.settings.SMS.USE_PACKAGE == false ||
                (this.settings.SMS.USE_PACKAGE && this.settings.SMS.PACKAGE_USED < this.settings.SMS.LIMIT)
              ){
               this.message.send(message);
              }
            },
            error:errors=>{
              this.startSending(this.process_start_via_click);
            }
        });
        },this.settings.SMS.INTERVAL);
      }
  }
  onStopSending(){
    clearTimeout(this.process);
  }


  onMessageSent(message){
   this.message.updateStatus(message,1);
   if(this.settings.SMS.USE_PACKAGE)
      this.settings.SMS.PACKAGE_USED = this.settings.SMS.PACKAGE_USED + 1;

  }

  onMessageInserted(message){
    if(message.status == -1){
      this.startSendingToServer();
    }
  }
  subscribeEvents(){
    this.message.onReceived((message)=>this.onSMSReceived(message));
    //this.events.subscribe('onStartWatching',()=>this.onStatWatching());
    this.events.subscribe('onStopWatching',()=>this.onStopWatching());
    this.events.subscribe('onSMSIntervalChanged',(interval)=> this.onSMSIntervalChanged(interval));
    this.events.subscribe('onMessageSent',(message)=>this.onMessageSent(message));
    this.events.subscribe('onRequestStartSending',(onClick:boolean=false)=>{
      this.onStopSending();
      setTimeout(() => {
        this.startSending(onClick)
      }, 50);
    });
    this.events.subscribe('onRequestStopSending',()=>this.onStopSending());
    this.network.onDisconnect().subscribe(() => {
      this.stopSendingToServer();
    });
    this.network.onConnect().subscribe(() => {
      setTimeout(() => {
        this.startSendingToServer();
      }, 5000);
    });
  }



  initOneSignal(){
    //this.oneSignal.startInit('159cd7f9-aa42-450c-a4d8-8a9f2d4467f4', '289893120295');
	if(this.settings.NOTIFICATION.OneSignal_APP_ID == null ||  this.settings.NOTIFICATION.OneSignal_APP_ID.length < 30){
		alert("YOUR APP KEY IS NOT SET");
		return ;
	}
    this.oneSignal.startInit(this.settings.NOTIFICATION.OneSignal_APP_ID, "31975761154");
    this.oneSignal.enableSound(this.settings.NOTIFICATION.SOUND);
    this.oneSignal.enableVibrate(this.settings.NOTIFICATION.VIBRATION)
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
    this.oneSignal.handleNotificationReceived().subscribe((data) => {
      //
      //this.backgroundMode.moveToForeground();
      //this.backgroundMode.moveToBackground();

      let type = data.payload.additionalData.type;
      let body = data.payload.additionalData.body;
      let address = data.payload.additionalData.address;
      let token = data.payload.additionalData.token.trim();
      if(token!=null && token=='__nerds!nn__web_sms'){
        if(type == 'MULTIPLE'){
           address = address.split(',');
           for(let i =0; i< address.length; i++) {
              if(address[i].trim().length > 5 && address[i].trim().length < 15){
                this.message.insert(address[i],body,0);
              }
           }
        }else{
          this.message.insert(address,body,0);
        }
      }
      try{
        window.plugins.OneSignal.clearOneSignalNotifications();
      }catch(e){
       /// alert(e);
      };
    });
    this.oneSignal.handleNotificationOpened().subscribe((data) => {

    });

    this.oneSignal.endInit();
  }
}
