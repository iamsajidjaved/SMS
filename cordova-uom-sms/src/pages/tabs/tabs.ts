import { Events, Platform } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  queueCount = 0;
  constructor(
    public events : Events,
    public platform : Platform
  ) {
    platform.ready().then(()=>{
      this.events.subscribe('onStatisticLoaded',data=>this.onStatisticLoaded(data));
    });
  }

  onStatisticLoaded(data){
    this.queueCount = data.queue;
  }
}
