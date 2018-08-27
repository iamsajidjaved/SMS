import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ActionSheetController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-inbox-more',
  templateUrl: 'inbox-more.html',
})
export class InboxMorePage {

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
  }


  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Filter Messages',
      buttons: [
        {
          icon : 'ios-undo',
          text: 'Sent To Users',
          handler: () => {
            console.log('Destructive clicked');
          }
        },
        {
          icon: 'archive',
          text: 'Received',
          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          icon: 'filing',
          text: 'Queued',
          handler: () => {
            console.log('Queued clicked');
          }
        },
        {
          icon : 'cloud-done',
          text: 'Sent To Server',
          handler: () => {
            console.log('Destructive clicked');
          }
        },
        {
          icon : 'remove-circle',
          text: 'Clear Filter',
          handler: () => {
            console.log('Clear Filter clicked');
          }
        },
        {
          icon: 'close',
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InboxMorePage');
  }

}
