import { MessageProvider } from './../../providers/message/message';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,PopoverController  } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
})
export class InboxPage {
  messages = [];
  page = 1;
  limit = 30;
  search = null;
  total = null;
  isLoading = false;
  constructor(
    public popoverCtrl: PopoverController,
    public _messages : MessageProvider,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {  }


  presentPopover(event) {
    let popover = this.popoverCtrl.create('InboxMorePage');
    popover.present({
      ev : event
    });
  }
  loadMessages(infiniteScrolling:any=null){
    this.isLoading = true;
    let start = (this.page - 1) * this.limit;
    let search_query = (this.search !=null && this.search.trim().length > 0 ?'  WHERE address like "%'+this.search+'%" or body like "%'+this.search+'%" ':'');
    let query = 'SELECT *,(SELECT COUNT(*) FROM messages) as total FROM messages '+search_query+' ORDER BY id DESC LIMIT '+start+','+this.limit;
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



  onItemSlideLeft(event,message){
    //Delete Message
    this.deleteSMS(message);
  }
  onItemSlideRight(event,message){
    //Send Message
    console.log(event);
    console.log(message);
  }
  doInfinite(infiniteScroll){
    if(!this.isLoading && this.total > this.messages.length){
      this.loadMessages(infiniteScroll);
    }else{
      infiniteScroll.complete();
    }
  }
  ionViewDidEnter(){
     this.page = 1;
     this.loadMessages();
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
