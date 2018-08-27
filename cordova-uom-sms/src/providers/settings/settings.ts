import { Injectable } from '@angular/core';
declare var window;

@Injectable()
export class SettingsProvider {
  constructor() {

  }


  private static is_url(url:string){
    let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if(!regex .test(url)) {
      return false;
    }
    return true;
  }
  public isValidURL(url:string){
    return SettingsProvider.is_url(url);
  }


  public SERVER = {
    set PUSH_INCOMING (value:boolean){
      window.localStorage.setItem('__app_server_push_incoming',value.toString());
    },
    get PUSH_INCOMING(){
      let _data = window.localStorage.getItem('__app_server_push_incoming');
      if(_data ==null || _data=='true' || _data=='1' || _data==true){
       return true;
      }
      return false
    },
    set URL (value:string){
      if(SettingsProvider.is_url(value))
        window.localStorage.setItem('__app_server_url',value.toString());
    },
    get URL(){
      let _data = window.localStorage.getItem('__app_server_url');
      if(_data !=null && SettingsProvider.is_url(_data)){
       return _data;
      }
      return null
    }

  }
  public SMS = {
    set QUEUE (value:string){
      if(value == 'FIFO' || value == 'LIFO' || value == 'SIRO')
        window.localStorage.setItem('__app_sms_queue',value);
    },
    get QUEUE(){
      let _data = window.localStorage.getItem('__app_sms_queue');
      if(_data ==null && _data !='FIFO' && _data !='SIRO'){
       return 'LIFO';
      }
      return _data;
    },
    set AUTO_SEND (value:boolean){
      window.localStorage.setItem('__app_sms_auto_send',value.toString());
    },
    get AUTO_SEND(){
      let _data = window.localStorage.getItem('__app_sms_auto_send');
      if(_data ==null || _data=='true' || _data=='1' || _data==true){
       return true;
      }
      return false
    },
    set USE_PACKAGE (value:boolean){
      window.localStorage.setItem('__app_sms_use_package',value.toString());
    },
    get USE_PACKAGE(){
      let _data = window.localStorage.getItem('__app_sms_use_package');
      if(_data !=null && (_data=='true' || _data=='1' || _data==true)){
       return true;
      }
      return false
    },
    set LIMIT (value:number){
      window.localStorage.setItem('__app_sms_limit',value.toString());
    },
    get LIMIT(){
      let _data = window.localStorage.getItem('__app_sms_limit');
      if(_data !=null && _data > 0){
       return parseInt(_data);
      }
      return 0
    },
    set PACKAGE_USED (value:number){
      window.localStorage.setItem('__app_sms_package_used',value.toString());
    },
    get PACKAGE_USED(){
      let _data = window.localStorage.getItem('__app_sms_package_used');
      if(_data !=null && _data > 0){
       return parseInt(_data);
      }
      return 0
    }
    ,
    set INTERVAL(value:number){
      if(value < 3000)
        value = 3000;
        window.localStorage.setItem('__app_sms_interval',value.toString());
    },
    get INTERVAL(){
      let _data = window.localStorage.getItem('__app_sms_interval');
      if(_data !=null && _data >= 3000){
       return parseInt(_data);
      }
      return 10000;
    }

  }
  public NOTIFICATION = {
    set SOUND (value:boolean){
     window.localStorage.setItem('__app_notification_sound',value.toString());
    },
    get SOUND (){
      let _notification = window.localStorage.getItem('__app_notification_sound');
      if(_notification ==null || _notification=='true' || _notification=='1' || _notification==true){
       return true;
      }
      return false
    },
    set VIBRATION (value:boolean){
      window.localStorage.setItem('__app_notification_vibration',value.toString());
    },
    get VIBRATION(){
      let _notification = window.localStorage.getItem('__app_notification_vibration');
      if(_notification ==null || _notification=='true' || _notification=='1' || _notification==true){
       return true;
      }
      return false
    },
    set OneSignal_APP_ID(APP_ID : string){
      window.localStorage.setItem('__app_OneSignal_app_id',APP_ID);
    },
    get OneSignal_APP_ID(){
      let _data = window.localStorage.getItem('__app_OneSignal_app_id');
      if(_data != null && _data.length > 0){
       return _data.trim().toString();
      }
      return 'a2923981-3bb1-4398-a2ba-b8bfccf6e8d7';
      //return null;
    },
    set GOOGLE_APP_ID(APP_ID : string){
      window.localStorage.setItem('__app_GOOGLE_app_id',APP_ID);
    },
    get GOOGLE_APP_ID(){
      let _data = window.localStorage.getItem('__app_GOOGLE_app_id');
      if(_data != null && _data.length > 0){
       return _data.trim().toString();
      }
      return '289893120295';
      //return null;
    }
  }

  appIsConfigured(){
      if(this.NOTIFICATION.GOOGLE_APP_ID == null || this.NOTIFICATION.GOOGLE_APP_ID == null){
        return false;
      }
      return true;
  }
}
