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
exports.ExchangeRateDataDao = void 0;
const Mongo_connect_1 = require("../db/Mongo_connect");
const db_constant_1 = require("../constant/db_constant");
class ExchangeRateDataDao {
    insertExchangeRate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const connect = new Mongo_connect_1.MongoConnect();
            const data = yield connect.insertOneData(db_constant_1.DATABASE_NAME.DEV_TEST, db_constant_1.COLLECTION_NAME.CRYPTO_TEST, req);
            return data;
        });
    }
    queryExchangeRate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const connect = new Mongo_connect_1.MongoConnect();
            const data = yield connect.queryData(db_constant_1.DATABASE_NAME.DEV_TEST, db_constant_1.COLLECTION_NAME.CRYPTO_TEST, req);
            return data;
        });
    }
}
exports.ExchangeRateDataDao = ExchangeRateDataDao;
