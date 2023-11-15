import { MongoClient } from "mongodb";

class MongoConnect {
  public async insertOneData(
    db: string,
    collection: string,
    req: any
  ): Promise<any> {
    const client = new MongoClient(process.env.DATABASE || "");
    try {
      await client.connect();
      const selectDB = client.db(db);
      const data = await selectDB.collection(collection).insertOne(req);
      return data;
    } catch (err: any) {
      console.log(err);
      return err;
    } finally {
      client.close();
    }
  }

  public async queryData(
    db: string,
    collection: string,
    req: any
  ): Promise<any> {
    const client = new MongoClient(process.env.DATABASE || "");
    try {
      await client.connect();
      const selectDB = client.db(db);
      const data = await selectDB.collection(collection).find(req).toArray();
      return data;
    } catch (err: any) {
      console.log(err);
      return err;
    } finally {
      client.close();
    }
  }

  public async updateData(
    db: string,
    collection: string,
    filter: any,
    update: any
  ): Promise<any> {
    const client = new MongoClient(process.env.DATABASE || "");
    try {
      await client.connect();
      const selectDB = client.db(db);
      const data = await selectDB
        .collection(collection)
        .updateOne(filter, update);
      return data;
    } catch (err: any) {
      console.log(err);
      return err;
    } finally {
      client.close();
    }
  }

  public async aggregate(
    db: string,
    collection: string,
    req: any
  ): Promise<any> {
    const client = new MongoClient(process.env.DATABASE || "");
    try {
      await client.connect();
      const selectDB = client.db(db);
      const data = await selectDB.collection(collection).aggregate(req);
      const response: any[] = [];
      await data.forEach((result: any) => {
        response.push(result);
      });
      return response
    } catch (err: any) {
      console.log(err);
      return err;
    } finally {
      client.close();
    }
  }
}

export { MongoConnect };
