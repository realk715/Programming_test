import {MongoConnect} from '../db/Mongo_connect'
import { DATABASE_NAME, COLLECTION_NAME } from '../constant/db_constant';

export class UserDaos {
    public async registerUser (req:any): Promise<any>{
        const connect = new MongoConnect();
        const data = connect.insertOneData(DATABASE_NAME.DEV_TEST,COLLECTION_NAME.USER_TEST,req)
        return data
        }

    public async queryUser (req:any): Promise<any>{
        const connect = new MongoConnect();
        const data = connect.queryData(DATABASE_NAME.DEV_TEST,COLLECTION_NAME.USER_TEST,req);
        return data
    }
}


