import { MongoConnect } from "../db/Mongo_connect";
import { DATABASE_NAME, COLLECTION_NAME } from "../constant/db_constant";

export class LogDao {
  public async insertLog(req: any): Promise<any> {
    const connect = new MongoConnect();
    const data = connect.insertOneData(
      DATABASE_NAME.DEV_TEST,
      COLLECTION_NAME.LOG_TEST,
      req
    );
    return data;
  }
}
