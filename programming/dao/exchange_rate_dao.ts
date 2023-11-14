import { MongoConnect } from "../db/Mongo_connect";
import { DATABASE_NAME, COLLECTION_NAME } from "../constant/db_constant";

export class ExchangeRateDataDao {
  public async insertExchangeRate(req: any): Promise<any> {
    const connect = new MongoConnect();
    const data = await connect.insertOneData(
      DATABASE_NAME.DEV_TEST,
      COLLECTION_NAME.CRYPTO_TEST,
      req
    );
    return data;
  }
}
