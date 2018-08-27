import { SettingsProvider } from './../settings/settings';
import { SqlLiteServiceProvider } from './../sql-lite-service/sql-lite-service';
import { Events } from 'ionic-angular';
import { Injectable, NgZone } from '@angular/core';
import { Http  } from '@angular/http';
import { SMS as SMSPlugin } from '@ionic-native/sms';
declare var SMS;

@Injectable()
export class MessageProvider {

  constructor(
    private http: Http,
    private settings : SettingsProvider,
    private sqllite : SqlLiteServiceProvider,
    private smsPlugin: SMSPlugin,
    private events : Events,
    private zone : NgZone
  ) {
  }

/**
 * Send an SMS
 * @param message : any
 *
 */
  send(message){
    this.smsPlugin.send(message.address,message.body,{
      replaceLineBreaks : true,
      /* android : {
        intent: "INTENT"
      } */
    }).then((result)=>{
      this.events.publish('onMessageSent',message);
    }).catch(error=>{
      console.log("error:" + error);
    });
  }



  startWatching(success=null,error=null){
    SMS.startWatch(function() {
      if(success!=null) success();
   }, function() {
     if(error!=null) error();
   });
  }

  onReceived(callback){
    document.addEventListener('onSMSArrive', (e:any)=>{
      //let address = e.data.address.trim();
      //let body = e.data.body.trim().toLowerCase();
      callback(e.data)
    });
  }
  stopWatching(success=null,error=null){
    SMS.stopWatch(function() {
      if(success!=null) success();
   }, function() {
     if(error!=null) error();
   });
  }
/**
 * Update Status of a message
 * @param message : any
 * @param status : any
 *
 */
  updateStatus(message,status=1){
    this.sqllite.query({
      query : "UPDATE messages SET status=? WHERE id=?",
      params : [
        status,
        message.id
      ],
      success: result=>{
       message.status = status;
        this.events.publish('onMessageStatusUpdated',message);
      },
      error : errors=>{
        console.log(errors);
      }
    });
  }




/**
 * Function for selectiing records from databse
 * @param options : any
 *
 */
  select(options:any){
    let params = [];
    if(options.params !=null) params = options.params;
    this.sqllite.query({
      query : options.query,
      params : params,
      success: result=>{
        this.zone.run(()=>{
          let messages = [];
          for(let i=0; i<result.rows.length; i++){
            messages[i] = result.rows.item(i);
          }
          options.success(messages);
        });
      },
      error : errors =>{
        if(options.error!=null)
          options.error(errors);
      }
    });
  }

  /**
 * Function for selection one record from databse
 * @param options : any
 */
  statistics(success_callback,error_callback=null){
      this.selectOne({
        query : `
        select * from (SELECT count(*) as sent FROM messages where status = 1) as s,
        (SELECT count(*) as received FROM messages where status = -1) as r,
        (SELECT count(*) as to_server FROM messages where status = -2) as sr,
        (SELECT count(*) as queue FROM messages where status = 0) as q`,
        success : result=> success_callback(result),
        error : errors=> error_callback!=null?error_callback(errors):''
      });
 }



 sendToServer(message,success=null,error=null){
    this.http.post(this.settings.SERVER.URL,message)
    .subscribe(data=>{
       if(success!=null) success(data);
    },errors=>{
       if(error!=null)
         error(errors);
    });
 }


/**
 * Function for selection one record from databse
 * @param options : any
 */
  selectOne(options:any){
    let params = [];
    let queue = this.settings.SMS.QUEUE;
    if(options.queue !=null) queue = options.queue;
    let query = "SELECT * FROM messages WHERE status=0 ORDER BY ";
    if(queue == 'FIFO'){
      query +=  "id asc"
    }else if(queue == 'SIRO'){
      query += 'RANDOM()';
    }else{
      query += 'id DESC'
    }
    query += ' LIMIT 1';
    if(options.query !=null) query = options.query;
    if(options.params !=null) query = options.params;
    this.sqllite.query({
      query : query,
      params : params,
      success: result=>{
        this.zone.run(()=>{
          let message = [];
          if(result.rows.length == 1){
              message = result.rows.item(0);
          }
          options.success(message);
        });
      },
      error : errors =>{
        if(options.error !=null)
          options.error(errors);
      }
    });
  }



/**
 * Function for Inserting new message to database
 * @param address : string
 * @param body : string
 * @param status
 */
  insert(address:string,body:string,status=0){
    this.sqllite.query({
      query : "INSERT INTO messages(address,body,status) VALUES(?,?,?)",
      params : [
        address,
        body,
        status
      ],
      success: result=>{
        let message = {
          id : result.insertId!=null?result.insertId:0,
          address : address,
          body : body,
          status : status
        }
        this.events.publish('onMessageInserted',message);
      },
      error : errors=>{
        console.log(errors);
      }
    });
  }

  delete(id,success=null,error=null){
    this.sqllite.query({
      query : "DELETE FROM messages where id="+id,
      success : (result)=>{
        if(success!=null){
        success(result);
        }
      },
      error : errors=>{
       if(error!=null){
         error(errors);
       }
      }
    })
  }

}
