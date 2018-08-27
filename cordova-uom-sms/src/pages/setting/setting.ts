import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController, Events } from 'ionic-angular';
import { SettingsProvider } from '../../providers/settings/settings';

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {

  constructor(
    public settings : SettingsProvider,
    public zone: NgZone,
    public events: Events,
    public alertCtrl: AlertController,
    public navCtrl: NavController
  ) {
  }
  onAutoSendChanged(){
    if(this.settings.SMS.AUTO_SEND){
      this.events.publish('onRequestStartSending',false);
    }else{
      this.events.publish('onRequestStopSending');
    }
  }

  onIncomingSMSSettingChanged(){
    if(this.settings.SERVER.PUSH_INCOMING){
      this.events.publish('onStartWatching');
    }else{
      this.events.publish('onStopWatching');
    }
  }
  getInterval(){
    var d = new Date(this.settings.SMS.INTERVAL);
   if(d.getUTCMinutes() > 0){
      return d.getUTCMinutes()+'.'+d.getUTCSeconds() + ' MIN';
    }
    return d.getUTCSeconds()+' SEC'
  }
  showSMSIntervalSetting(){
    let alert = this.alertCtrl.create();
    alert.setTitle('SMS Interval');
    alert.addInput({
      type: 'number',
      label: 'Interval',
      value : this.settings.SMS.INTERVAL.toString(),
    });

    alert.addButton({
      cssClass: 'danger',
      text: 'APPLY',
      handler: data => {
          this.zone.run(()=>{
            let interval = parseFloat(data[0]);
            if(interval > 10000000){
              interval = 10000000;
            }
            interval = 1000*Math.round(interval/1000);
            this.settings.SMS.INTERVAL = interval;
            this.events.publish('onSMSIntervalChanged',interval);
          })
      }
    });
    alert.present();


  }

  showServerURLSettings(){
    let alert = this.alertCtrl.create();
    alert.setTitle('PUSH SMS TO');
    alert.addInput({
      type: 'text',
      label: 'API URL',
      value : this.settings.SERVER.URL,
    });

    alert.addButton({
      cssClass: 'danger',
      text: 'APPLY',
      handler: data => {
          this.zone.run(()=>{
            this.settings.SERVER.URL =   data[0];
          })
      }
    });
    alert.present();
  }

  showOneSignalAppSettings(){
    let alert = this.alertCtrl.create();
    alert.setTitle('OneSignal App Id');
    alert.addInput({
      type: 'text',
      label: 'APP ID',
      value : this.settings.NOTIFICATION.OneSignal_APP_ID,
    });

    alert.addButton({
      cssClass: 'danger',
      text: 'APPLY',
      handler: data => {
          this.zone.run(()=>{
            this.settings.NOTIFICATION.OneSignal_APP_ID =   data[0];
          })
      }
    });
    alert.present();
  }

  showSMSQueueSetting(){
    let alert = this.alertCtrl.create();
    alert.setTitle('SMS Queues');
    alert.addInput({
      type: 'radio',
      label: 'FIFO(first in first out)',
      value : 'FIFO',
      checked : this.settings.SMS.QUEUE == 'FIFO'?true:false
    });
    alert.addInput({
      type: 'radio',
      label: 'LIFO (last in first out)',
      value : 'LIFO',
      checked : this.settings.SMS.QUEUE != 'FIFO' && this.settings.SMS.QUEUE != 'SIRO'?true:false
    });
    alert.addInput({
      type: 'radio',
      label: 'SIRO (serve in random order)',
      value : 'SIRO',
      checked : this.settings.SMS.QUEUE == 'SIRO'?true:false
    });

    alert.addButton({
      cssClass: 'danger',
      text: 'APPLY',
      handler: data => {
          this.zone.run(()=>{
            this.settings.SMS.QUEUE =   data;
          })
      }
    });
    alert.present();
  }

  showGoogleAppSettings(){
    let alert = this.alertCtrl.create();
    alert.setTitle('Google App Id');
    alert.addInput({
      type: 'text',
      label: 'APP ID',
      value : this.settings.NOTIFICATION.GOOGLE_APP_ID,
    });

    alert.addButton({
      cssClass: 'danger',
      text: 'APPLY',
      handler: data => {
          this.zone.run(()=>{
            this.settings.NOTIFICATION.GOOGLE_APP_ID =   data[0];
          })
      }
    });
    alert.present();
  }

  showSMSLimitSetting(){
    let alert = this.alertCtrl.create();
    alert.setTitle('SMS Package Limit');
    alert.addInput({
      type: 'number',
      label: 'Limit',
      value : this.settings.SMS.LIMIT.toString(),
    });

    alert.addButton({
      cssClass: 'danger',
      text: 'APPLY',
      handler: data => {
          this.zone.run(()=>{
            this.settings.SMS.LIMIT = parseInt(data[0]);
            if(this.settings.SMS.PACKAGE_USED > this.settings.SMS.LIMIT){
              this.settings.SMS.PACKAGE_USED = this.settings.SMS.LIMIT;
            }
          })
      }
    });
    alert.present();


  }


  showNotificationSettings() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Notifications');

    alert.addInput({
      type: 'checkbox',
      label: 'Notifications',
      value : 'notification',
      checked: true,
      disabled: true
    });

    alert.addInput({
      type: 'checkbox',
      label: 'Enable sound',
      value: 'sound',
      checked: this.settings.NOTIFICATION.SOUND
    });
    alert.addInput({
      type: 'checkbox',
      label: 'Enable vibration',
      value: 'vibration',
      checked: this.settings.NOTIFICATION.VIBRATION
    });

    alert.addButton({
      cssClass: 'danger',
      text: 'APPLY',
      handler: data => {
          this.zone.run(()=>{
            let vibration = false;
            let sound = false;
            for(let i=0; i<data.length; i++){
                switch(data[i]){
                  case 'vibration':
                      vibration = true
                      break;
                  case  'sound':
                      sound = true;
                      break;
                }
            }
            this.settings.NOTIFICATION.SOUND = sound;
            this.settings.NOTIFICATION.VIBRATION = vibration;
            this.events.publish('onNotificationSettingsChanged',  this.settings);
          })
      }
    });
    alert.present();

  }


}
