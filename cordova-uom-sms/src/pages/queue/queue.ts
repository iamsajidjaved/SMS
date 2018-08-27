import { SettingsProvider } from './../../providers/settings/settings';
import { MessageProvider } from './../../providers/message/message';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-queue',
  templateUrl: 'queue.html',
})
export class QueuePage {
  messages = [];
  page = 1;
  limit = 5;
  search = null;
  total = null;
  isLoading = false;
  constructor(
    public _messages : MessageProvider,
    public settings : SettingsProvider,
    public navCtrl: NavController,
    public navParams: NavParams) {
  }

  doInfinite(infiniteScroll){
    if(!this.isLoading &&  this.total > this.messages.length){
      this.loadMessages(infiniteScroll);
    }else{
      infiniteScroll.complete();
    }
  }


  ionViewDidEnter(){
    this.page = 1;
    this.loadMessages();
  }
  onItemSlideLeft(event,message){
    this.deleteSMS(message);
  }
  onItemSlideRight(event,message){
    //Send Message
    console.log(event);
    console.log(message);
  }
  loadMessages(infiniteScrolling:any=null){
    this.isLoading = true;
    let start = (this.page - 1) * this.limit;
    let queue = this.settings.SMS.QUEUE;
    let order = 'ORDER BY '
    if(queue == 'FIFO'){
        order +=  'id  ASC';
    }else if(queue == 'SIRO'){
      order += 'RANDOM()';
    }else{
      order +=  'id DESC';
    }
    let q = "where status=0 "
    let search_query = (this.search !=null && this.search.trim().length > 0 ?'  AND address like "%'+this.search+'%" or body like "%'+this.search+'%" ':'');
    q +=  search_query;
    let query = 'SELECT *,(SELECT COUNT(*) FROM messages '+q+') as total FROM messages '+q+" "+order+' LIMIT '+start+','+this.limit;

    this._messages.select({
      query : query,
      params: [],
      success : result=>{
        this.isLoading = false;
        if(result.length > 0){
          this.total = result[0].total;
          if(this.page == 1){
            this.messages = result;
          }else{
            this.messages = this.messages.concat(result);
          }
          this.page++;
        }
        if(infiniteScrolling){
          infiniteScrolling.complete();
        }
      },
      error: errors=>{
        this.isLoading = false;
        console.log(errors);
      }
    });
  }

  deleteSMS(message){
    this._messages.delete(message.id,result=>{
      let index =  this.messages.indexOf(message);
      this.messages.splice(index,1);
    },errors=>{
      console.log(errors);
    });
  }

}
