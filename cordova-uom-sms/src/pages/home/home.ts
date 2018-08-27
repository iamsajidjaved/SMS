import { SettingsProvider } from './../../providers/settings/settings';
import { Component,NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Events  } from 'ionic-angular';
import { MessageProvider } from './../../providers/message/message';
import { SqlLiteServiceProvider } from './../../providers/sql-lite-service/sql-lite-service';


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  isSending : boolean = false;
  public statistic  = {
    labels : ['Queue', 'Sent To Users', 'Received',"Sent To Server"],
    values : [0,0,0,0],
    type : 'doughnut'
  }
  package = 10;
  //public statistic:number[] = [0,0,0]
  isLoadingStatistics = false;
  constructor(
    platform: Platform,
    public zong : NgZone,
    public message : MessageProvider,
    public settings : SettingsProvider,
    public events : Events,
    public sqllite : SqlLiteServiceProvider,
    public navCtrl: NavController
  ) {

    platform.ready().then(() => {
        this.events.subscribe('onMessageStatusUpdated',message=>{
          if(!this.isLoadingStatistics)
            this.getStatistics();
        });
        this.events.subscribe('onRequestStopSending',()=>{
          this.isSending = false;
        });
        this.events.subscribe('onRequestStartSending',(isSending)=>{
          this.isSending = true;
        });
        this.events.subscribe('onMessageInserted',(message,result)=>{
          if(!this.isLoadingStatistics)
            this.getStatistics();
        });
        this.getStatistics();
    });
  }

  renewSMSPackage(){
    this.settings.SMS.PACKAGE_USED = 0;
    if(!this.settings.SMS.AUTO_SEND)
      this.events.publish('onRequestStopSending');
  }
  startSending(){
    this.events.publish('onRequestStopSending');
    this.events.publish('onRequestStartSending',true);
  }
  stopSending(){
    this.events.publish('onRequestStopSending');
  }
  packagePercentUsed(){
    return   Math.round((100 * this.settings.SMS.PACKAGE_USED) / this.settings.SMS.LIMIT);
  }
  getStatistics(){
    this.isLoadingStatistics = true;
    this.message.statistics(data=>{
      this.isLoadingStatistics = false;
      this.events.publish('onStatisticLoaded',data);
      this.updateStatistic(data);
    },errors=>{
      this.isLoadingStatistics = false;
    });
  }


 updateStatistic(data){
  this.statistic.values[0] = data.queue;
  this.statistic.values[1] = data.sent;
  this.statistic.values[2] = data.received;
  this.statistic.values[3] = data.to_server;

  //this.statistic.labels[0] = "Queue: "+data.queue;
  //this.statistic.labels[1] = "Sent: "+ data.sent;
  //this.statistic.labels[2] = "Received: "+ data.received;
  this.statistic.type = this.statistic.type === 'doughnut' ? 'pie' : 'doughnut';
 }
  // events
  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }



}
