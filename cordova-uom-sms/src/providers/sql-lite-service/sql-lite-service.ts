import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
declare var window;
@Injectable()
export class SqlLiteServiceProvider {
  private options = {name: 'database.db', location: 'default',existingDatabase: 1,createFromLocation:1};
  private db : any;

  constructor(private sqlite:SQLite) {
    if(!window.cordova){
      this.db = window.openDatabase(this.options.name, '1.0', 'database', 5 * 1024 * 1024);
    }
  }


  query(options){

    if(options.params == null) options.params = [];
    if(!window.cordova){
      this.db.transaction(function(tx) {
        tx.executeSql(options.query, options.params, function(tx, rs) {
          options.success(rs);
        }, function(tx, error) {
          if(options.error !=null){
              options.error(error);
          }
        });
      }, function(error) {
        /* console.log('Transaction ERROR: ' + error.message); */
      }, function() {
        /* console.log('Populated database OK'); */
      });
    }else{
      this.sqlite.create(this.options).then((db: SQLiteObject) => {
        db.executeSql(options.query, options.params).then((data) => {
          options.success(data);
        })
      }).catch((error)=>{
        if(options.error !=null){
          options.error(error);
        }
      });
    }


  }



}
