"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoConnect = void 0;
const mongodb_1 = require("mongodb");
class MongoConnect {
    insertOneData(db, collection, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new mongodb_1.MongoClient(process.env.DATABASE || "");
            try {
                yield client.connect();
                const selectDB = client.db(db);
                const data = yield selectDB.collection(collection).insertOne(req);
                return data;
            }
            catch (err) {
                console.log(err);
                return err;
            }
            finally {
                client.close();
            }
        });
    }
    queryData(db, collection, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new mongodb_1.MongoClient(process.env.DATABASE || "");
            try {
                yield client.connect();
                const selectDB = client.db(db);
                const data = yield selectDB.collection(collection).find(req).toArray();
                return data;
            }
            catch (err) {
                console.log(err);
                return err;
            }
            finally {
                client.close();
            }
        });
    }
    updateData(db, collection, filter, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new mongodb_1.MongoClient(process.env.DATABASE || "");
            try {
                yield client.connect();
                const selectDB = client.db(db);
                const data = yield selectDB
                    .collection(collection)
                    .updateOne(filter, update);
                return data;
            }
            catch (err) {
                console.log(err);
                return err;
            }
            finally {
                client.close();
            }
        });
    }
    aggregate(db, collection, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new mongodb_1.MongoClient(process.env.DATABASE || "");
            try {
                yield client.connect();
                const selectDB = client.db(db);
                const data = yield selectDB.collection(collection).aggregate(req);
                const response = [];
                yield data.forEach((result) => {
                    response.push(result);
                });
                return response;
            }
            catch (err) {
                console.log(err);
                return err;
            }
            finally {
                client.close();
            }
        });
    }
}
exports.MongoConnect = MongoConnect;
