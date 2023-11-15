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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exchange_rate_dao_1 = require("../dao/exchange_rate_dao");
const user_dao_1 = require("../dao/user_dao");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AdminCtr {
    addExchangeRate(token, body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!body || !body.username || !body.tokenName || !body.priceUSDT) {
                return {
                    message: 'plese provide username recipient transfer_token to_token ',
                    status: 400,
                };
            }
            try {
                const decodedToken = yield this.CheckAuth(token);
                const exchangeRatedao = new exchange_rate_dao_1.ExchangeRateDataDao();
                const UtokenName = body.tokenName.toUpperCase();
                if (decodedToken.username === body.username &&
                    decodedToken.role === 'admin') {
                    const isAddRate = yield exchangeRatedao.queryExchangeRate({ token: UtokenName });
                    console.log(isAddRate);
                    if (isAddRate.length === 0) {
                        const addExchangeRate = yield exchangeRatedao.insertExchangeRate({
                            token: UtokenName,
                            priceUSDT: body.priceUSDT,
                        });
                        return {
                            message: 'add exchange rate successfully. ',
                            stasus: 200
                        };
                    }
                    else {
                        return {
                            message: 'Token already added'
                        };
                    }
                    ;
                }
                else {
                    return {
                        message: 'you are not allowed to add exchange rate.',
                        status: 400,
                    };
                }
            }
            catch (err) {
                console.log('Error inserting exchange rate.');
                return {
                    message: "can not add exchange rate You are not admin",
                    status: 400,
                };
            }
        });
    }
    changeUsertoAdmin(body) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!body || !body.secret || !body.username) {
                    return {
                        message: 'Please provide the secret and username',
                        status: 400,
                    };
                }
                const userdao = new user_dao_1.UserDao();
                if (body.secret === process.env.SECRET) {
                    const user = yield userdao.queryUser({ username: body.username });
                    if (user && user.length > 0) {
                        let updatedRole;
                        if (((_a = user[0]) === null || _a === void 0 ? void 0 : _a.role) === "user") {
                            updatedRole = yield userdao.updateUser({ username: body.username }, { $set: { role: "admin" } });
                            console.log('Updated Role: admin');
                            return {
                                message: 'Successfully You are admin',
                                status: 200,
                            };
                        }
                        else if (((_b = user[0]) === null || _b === void 0 ? void 0 : _b.role) === "admin") {
                            updatedRole = yield userdao.updateUser({ username: body.username }, { $set: { role: "user" } });
                            console.log('Updated Role: user');
                            return {
                                message: 'Successfully You are user',
                                status: 200,
                            };
                        }
                    }
                    else {
                        return {
                            message: "User not found",
                            status: 404,
                        };
                    }
                }
                else {
                    return {
                        message: 'check your secret',
                        status: 400,
                    };
                }
            }
            catch (_c) {
                console.log('Error: Could not change user role.');
                return {
                    message: 'Please check your secret or username',
                    status: 400,
                };
            }
        });
    }
    editBalance(token, body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!body || !body.username || !body.token || !body.amount) {
                return {
                    message: 'plese provide username token and amount. ',
                    status: 400,
                };
            }
            try {
                const decodedToken = yield this.CheckAuth(token);
                const userdao = new user_dao_1.UserDao();
                if (decodedToken.role === 'admin') {
                    const Utoken = body.token.toUpperCase();
                    const updateField = `balance.${Utoken}`;
                    const Namount = Number(body.amount);
                    const editBalance = yield userdao.updateUser({ username: body.username }, { $set: { [updateField]: Namount } });
                    return {
                        message: 'edit balance successfully',
                        status: 200
                    };
                }
                else {
                    return {
                        message: 'you are not allowed to edit balance',
                        status: 400
                    };
                }
            }
            catch (err) {
                console.log('Error editing balance');
            }
        });
    }
    getTotalBalance(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decodedToken = yield this.CheckAuth(token);
                const userdao = new user_dao_1.UserDao();
                const data = yield userdao.queryUser({});
                if (decodedToken.role === 'admin') {
                    const totalBalance = data.reduce((acc, user) => {
                        Object.keys(user.balance).forEach(coin => {
                            acc[coin] = (acc[coin] || 0) + user.balance[coin];
                        });
                        return acc;
                    }, {});
                    console.log(totalBalance);
                    return {
                        totalBalance: totalBalance,
                        status: 200
                    };
                }
                else {
                    return {
                        message: 'you are not allowed to get all total balance',
                        status: 400
                    };
                }
            }
            catch (err) {
                console.log('err');
            }
        });
    }
    CheckAuth(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkAuth = jsonwebtoken_1.default.verify(token, String(process.env.SECRET));
                return checkAuth;
            }
            catch (error) {
                console.error("Error during token verification:", error);
                return error;
            }
        });
    }
}
exports.default = AdminCtr;
