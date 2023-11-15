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
const user_dao_1 = require("../dao/user_dao");
const log_dao_1 = require("../dao/log_dao");
const exchange_rate_dao_1 = require("../dao/exchange_rate_dao");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ethereumjs_wallet_1 = __importDefault(require("ethereumjs-wallet"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserCtr {
    register(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDao = new user_dao_1.UserDao();
            const logDao = new log_dao_1.LogDao();
            console.log(body);
            if (!body || !body.username || !body.password) {
                return {
                    message: "Invalid request body",
                };
            }
            const isRegister = yield userDao.queryUser({ username: body.username });
            console.log(isRegister);
            if (isRegister.length === 0) {
                //hash password by bcrypt
                const hashpassword = yield bcrypt_1.default.hash(String(body.password), 12);
                //gen wallet ethereumjs-wallet
                const wallet = ethereumjs_wallet_1.default.generate();
                const walletAddress = wallet.getAddressString();
                //register
                const register = yield userDao.registerUser({
                    username: body.username,
                    password: hashpassword,
                    wallet: walletAddress,
                    balance: {
                        XRP: 0,
                        EOS: 0,
                        XLM: 0,
                        ETH: 0,
                        BTC: 0,
                        USDT: 0,
                    },
                    role: "user",
                });
                //loginsert
                yield logDao.insertLog({
                    username: body.username,
                    type: "register",
                    create_at: new Date(Date.now()).toISOString(),
                });
                return {
                    data: register,
                    status: 200,
                    message: "RegisterSuccess",
                };
            }
            else {
                return {
                    message: "Username Already registered",
                    status: 400,
                };
            }
        });
    }
    login(body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!body || !body.username || !body.password) {
                return {
                    message: "Invalid request body",
                    status: 400,
                };
            }
            try {
                const userDao = new user_dao_1.UserDao();
                const logDao = new log_dao_1.LogDao();
                const user = yield userDao.queryUser({ username: body.username });
                //check password
                if (user && user.length > 0) {
                    const match = yield bcrypt_1.default.compare(body.password, user[0].password);
                    if (match) {
                        const payload = {
                            username: user[0].username,
                            wallet: user[0].wallet,
                            role: user[0].role,
                        };
                        const expiresIn = 60 * 60 * 24; //24 hours from login
                        //gentoken
                        const token = jsonwebtoken_1.default.sign(payload, String(process.env.SECRET), {
                            expiresIn,
                        });
                        //log insert
                        yield logDao.insertLog({
                            username: body.username,
                            type: "login",
                            create_at: new Date(Date.now()).toISOString(),
                        });
                        return {
                            token: token,
                            message: "Login successful",
                            status: 200,
                        };
                    }
                }
                else {
                    return {
                        token: null,
                        message: "Wrong username or password",
                        status: 400,
                    };
                }
            }
            catch (err) {
                console.error("Error during login:");
                return {
                    token: null,
                    message: "Error during login",
                    status: 400,
                };
            }
        });
    }
    CheckAuth(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const checkAuth = jsonwebtoken_1.default.verify(token, String(process.env.SECRET));
                return checkAuth;
            }
            catch (err) {
                console.error("Error during token verification:");
                return err;
            }
        });
    }
    transfer(token, body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!body ||
                !body.username ||
                !body.senderWallet ||
                !body.recipientWallet ||
                !body.transferToken ||
                !body.amount ||
                !body.toToken) {
                return {
                    message: "plese provide senderWallet recipientWallet transferToken toToken ",
                    status: 400,
                };
            }
            try {
                const decodedToken = yield this.CheckAuth(token);
                if (decodedToken.wallet === body.senderWallet) {
                    const userdao = new user_dao_1.UserDao();
                    const exchangeRatedao = new exchange_rate_dao_1.ExchangeRateDataDao();
                    const UtransferToken = body.transferToken.toUpperCase();
                    const UtoToken = body.toToken.toUpperCase();
                    const queryRecipientWallet = yield userdao.queryUser({
                        wallet: body.recipientWallet,
                    });
                    const querySenderWallet = yield userdao.queryUser({
                        wallet: body.senderWallet,
                    });
                    //ตรวจสอบว่ามีกระเป๋าผู้รับไหม
                    if (body.recipientWallet === queryRecipientWallet[0].wallet) {
                        //ผู้ส่งต้องมีเหรียญมากกว่าจำนวนที่ส่ง
                        if (querySenderWallet[0].balance[UtransferToken] > 0 &&
                            querySenderWallet[0].balance[UtransferToken] >= body.amount) {
                            //ถ้าผู้รับมีเหรียญในกระเป๋าอยู่แล้วไม่ใช่เหรียญใหม่
                            if (queryRecipientWallet[0].balance.hasOwnProperty(UtransferToken)) {
                                //กรณีส่งโทเคนเดียวกัน
                                if (UtransferToken === UtoToken) {
                                    //senderWallet update
                                    const senderUpdateField = `balance.${UtransferToken}`;
                                    const SenderAmount = Number(querySenderWallet[0].balance[UtransferToken]) -
                                        Number(body.amount);
                                    const editSenderWallet = yield userdao.updateUser({ wallet: body.senderWallet }, { $set: { [senderUpdateField]: SenderAmount } });
                                    //recipientWallet update
                                    const recipientUpdateField = `balance.${UtoToken}`;
                                    const recipientAmount = Number(queryRecipientWallet[0].balance[UtransferToken]) +
                                        Number(body.amount);
                                    const editRecipientWallet = yield userdao.updateUser({ wallet: body.recipientWallet }, { $set: { [recipientUpdateField]: recipientAmount } });
                                    return {
                                        message: ` ${body.senderWallet} Transfer ${body.amount} ${UtransferToken} to ${body.recipientWallet} successful`,
                                        status: 200,
                                    };
                                    //กรณีส่งคนละtoken
                                }
                                else {
                                    const queryTransferToken = yield exchangeRatedao.queryExchangeRate({
                                        token: UtransferToken,
                                    });
                                    const queryToToken = yield exchangeRatedao.queryExchangeRate({
                                        token: UtoToken,
                                    });
                                    //senderWallet update
                                    const senderUpdateField = `balance.${UtransferToken}`;
                                    const SenderAmount = Number(querySenderWallet[0].balance[UtransferToken]) -
                                        Number(body.amount);
                                    const editSenderWallet = yield userdao.updateUser({ wallet: body.senderWallet }, { $set: { [senderUpdateField]: SenderAmount } });
                                    const priceTransferToken = queryTransferToken[0].priceUSDT; //ดึงราคาเหรียญที่จะส่งจากdb
                                    const priceToToken = queryToToken[0].priceUSDT; //ดึงราคาเหรียญที่ผู้รับจะได้รับจากdb
                                    const SenderPrice = Number(body.amount * priceTransferToken); //จะได้ราคาเป็นusdt
                                    const swap = SenderPrice / priceToToken; //แปลงราคาจากusdtเป็นจำนวนเหรียญที่ผู้รับจะได้รับ
                                    //recipientWallet update
                                    const recipientUpdateField = `balance.${UtoToken}`;
                                    const editRecipientWallet = yield userdao.updateUser({ wallet: body.recipientWallet }, { $set: { [recipientUpdateField]: swap } });
                                    return {
                                        message: ` ${body.senderWallet} Transfer ${body.amount} ${UtransferToken} for  ${swap} ${UtoToken} to ${body.recipientWallet} successful`,
                                        status: 200,
                                    };
                                }
                                //ถ้าผู้รับยังไม่มีเหรียญที่ผู้ส่งมี
                            }
                            else {
                                //senderWallet update
                                const senderUpdateField = `balance.${UtransferToken}`;
                                const SenderAmount = Number(querySenderWallet[0].balance[UtransferToken]) -
                                    Number(body.amount);
                                const editSenderWallet = yield userdao.updateUser({ wallet: body.senderWallet }, { $set: { [senderUpdateField]: SenderAmount } });
                                //recipientWallet update
                                const recipientUpdateField = `balance.${UtoToken}`;
                                const recipientAmount = Number(body.amount);
                                const editRecipientWallet = yield userdao.updateUser({ wallet: body.recipientWallet }, { $set: { [recipientUpdateField]: recipientAmount } });
                                return {
                                    message: ` ${body.senderWallet} Transfer ${body.amount} ${UtransferToken} to ${body.recipientWallet} successful`,
                                    status: 200,
                                };
                            }
                        }
                        else {
                            return { message: "insufficient funds" };
                        }
                    }
                    else {
                        return {
                            message: "Not found recipientWallet ",
                            status: 400,
                        };
                    }
                }
                else {
                    return {
                        message: "Wrong sender wallet address",
                        status: 400,
                    };
                }
            }
            catch (err) {
                return {
                    message: "Error during transfer please check token price",
                    status: 401,
                };
            }
        });
    }
}
exports.default = UserCtr;
