import { UserDao } from "../dao/user_dao";
import { LogDao } from "../dao/log_dao";
import { ExchangeRateDataDao } from "../dao/exchange_rate_dao";
import bcrypt from "bcrypt";
import Wallet from "ethereumjs-wallet";
import {
  IRegisterUserRequest,
  ILoginRequest,
  ITransferRequest,
} from "../types/user_types";
import jwt, { JwtPayload, decode } from "jsonwebtoken";

class UserCtr {
  public async register(body: IRegisterUserRequest): Promise<any> {
    const userDao = new UserDao();
    const logDao = new LogDao();
    console.log(body);
    if (!body || !body.username || !body.password) {
      return {
        data: null,
        message: "Invalid request body",
        status: 400,
      };
    }
    const isRegister = await userDao.queryUser({ username: body.username });
    console.log(isRegister);
    if (isRegister.length === 0) {
      //hash password by bcrypt
      const hashpassword = await bcrypt.hash(String(body.password), 12);

      //gen wallet ethereumjs-wallet
      const wallet = Wallet.generate();
      const walletAddress = wallet.getAddressString();

      //register
      const register = await userDao.registerUser({
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
      await logDao.insertLog({
        username: body.username,
        type: "register",
        create_at: new Date(Date.now()).toISOString(),
      });

      return {
        data: { user: register },
        status: 200,
        message: "RegisterSuccess",
      };
    } else {
      return {
        data: null,
        message: "Username Already registered",
        status: 400,
      };
    }
  }

  public async login(body: ILoginRequest): Promise<any> {
    if (!body || !body.username || !body.password) {
      return {
        data: null,
        message: "Invalid request body",
        status: 400,
      };
    }

    try {
      const userDao = new UserDao();
      const logDao = new LogDao();
      const user = await userDao.queryUser({ username: body.username });
      //check password

      if (user && user.length > 0) {
        const match = await bcrypt.compare(body.password, user[0].password);

        if (match) {
          const payload = {
            username: user[0].username,
            wallet: user[0].wallet,
            role: user[0].role,
          };
          const expiresIn = 60 * 60 * 24; //24 hours from login

          //gentoken
          const token = jwt.sign(payload, String(process.env.SECRET), {
            expiresIn,
          });

          //log insert
          await logDao.insertLog({
            username: body.username,
            type: "login",
            create_at: new Date(Date.now()).toISOString(),
          });
          return {
            data: { token: token },
            message: "Login successful",
            status: 201,
          };
        }
      } else {
        return {
          data: null,
          message: "Wrong username or password",
          status: 400,
        };
      }
    } catch (err) {
      console.error("Error during login:");
      return {
        data: null,
        message: "Error during login",
        status: 400,
      };
    }
  }
  private async CheckAuth(token: string) {
    try {
      const checkAuth = jwt.verify(
        token,
        String(process.env.SECRET)
      ) as JwtPayload;
      return checkAuth;
    } catch (err) {
      console.error("Error during token verification:");
      return err;
    }
  }

  public async transfer(token: any, body: ITransferRequest): Promise<any> {
    if (
      !body ||
      !body.recipientWallet ||
      !body.transferToken ||
      !body.amount ||
      body.amount <= 0 ||
      !body.toToken
    ) {
      return {
        data: null,
        message: "bad request",
        status: 400,
      };
    }
    try {
      const decodedToken: any = await this.CheckAuth(token);
      const userdao = new UserDao();
      const exchangeRatedao = new ExchangeRateDataDao();
      const logdao = new LogDao();
      const UtransferToken = body.transferToken.toUpperCase();
      const UtoToken = body.toToken.toUpperCase();

      const queryRecipientWallet = await userdao.queryUser({
        wallet: body.recipientWallet,
      });
      const querySenderWallet = await userdao.queryUser({
        wallet: decodedToken.wallet,
      });
      const queryTransferToken = await exchangeRatedao.queryExchangeRate({
        token: UtransferToken,
      });
      const queryToToken = await exchangeRatedao.queryExchangeRate({
        token: UtoToken,
      });

      //ตรวจสอบว่ามีกระเป๋าผู้รับไหม
      if (!queryRecipientWallet) {
        return {
          message: "Not found recipientWallet ",
          status: 400,
        };
      }
      //ผู้ส่งต้องมีเหรียญมากกว่าจำนวนที่ส่ง
      if (querySenderWallet[0].balance[UtransferToken] <= body.amount) {
        return {
          data: null,
          message: "insufficient balance",
          status: 400,
        };
      }

      //ถ้าผู้รับมีเหรียญในกระเป๋าอยู่แล้วไม่ใช่เหรียญใหม่
      if (queryRecipientWallet[0].balance.hasOwnProperty(UtransferToken)) {
        //กรณีส่งโทเคนเดียวกัน
        if (UtransferToken === UtoToken) {
          //senderWallet update
          const senderUpdateField = `balance.${UtransferToken}`;
          const SenderAmount =
            Number(querySenderWallet[0].balance[UtransferToken]) -
            Number(body.amount);
          const editSenderWallet = await userdao.updateUser(
            { wallet: decodedToken.wallet },
            { $set: { [senderUpdateField]: SenderAmount } }
          );

          //recipientWallet update
          const recipientUpdateField = `balance.${UtoToken}`;
          const recipientAmount =
            Number(queryRecipientWallet[0].balance[UtransferToken]) +
            Number(body.amount);

          const editRecipientWallet = await userdao.updateUser(
            { wallet: body.recipientWallet },
            { $set: { [recipientUpdateField]: recipientAmount } }
          );

          //loginsert
          await logdao.insertLog({
            wallet: decodedToken.wallet,
            type: 'transfer',
            token:UtransferToken,
            amount:body.amount,
            toToken:UtoToken,
            toWallet:body.recipientWallet,
            create_at: new Date(Date.now()).toISOString(),
          });

          return {
            data: null,
            message: ` ${decodedToken.wallet} Transfer ${body.amount} ${UtransferToken} to ${body.recipientWallet} successful`,
            status: 200,
          };

          //กรณีส่งคนละtoken
        } else {
          if (
            !queryTransferToken ||
            !queryTransferToken[0] ||
            !Array.isArray(queryToToken) ||
            queryToToken.length === 0
          ) {
            return {
              data: null,
              message: `token not have exchange rate`,
              status: 400,
            };
          }

          //senderWallet update
          const senderUpdateField = `balance.${UtransferToken}`;
          const SenderAmount =
            Number(querySenderWallet[0].balance[UtransferToken]) -
            Number(body.amount);
          const editSenderWallet = await userdao.updateUser(
            { wallet: decodedToken.wallet },
            { $set: { [senderUpdateField]: SenderAmount } }
          );

          const priceTransferToken = queryTransferToken[0].priceUSDT; //ดึงราคาเหรียญที่จะส่งจากdb
          const priceToToken = queryToToken[0].priceUSDT; //ดึงราคาเหรียญที่ผู้รับจะได้รับจากdb
          const SenderPrice = Number(body.amount * priceTransferToken); //จะได้ราคาเป็นusdt
          const swap = SenderPrice / priceToToken; //แปลงราคาจากusdtเป็นจำนวนเหรียญที่ผู้รับจะได้รับ

          //recipientWallet update
          const recipientUpdateField = `balance.${UtoToken}`;

          const editRecipientWallet = await userdao.updateUser(
            { wallet: body.recipientWallet },
            { $set: { [recipientUpdateField]: swap } }
          );
            //loginsert
          await logdao.insertLog({
            wallet: decodedToken.wallet,
            type: 'transfer',
            token:UtransferToken,
            amount:body.amount,
            toToken:UtoToken,
            toWallet:body.recipientWallet,
            create_at: new Date(Date.now()).toISOString(),
          });
          return {
            data: null,
            message: ` ${decodedToken.wallet} Transfer ${body.amount} ${UtransferToken} for  ${swap} ${UtoToken} to ${body.recipientWallet} successful`,
            status: 200,
          };
        }

        //ถ้าผู้รับยังไม่มีเหรียญที่ผู้ส่งมี
      } else {
        if (UtransferToken !== UtoToken) {
          return {
            data: null,
            message: ` ${UtransferToken} dont have exchange rate you can only send   ${UtransferToken} to ${UtransferToken}   `,
            status: 400,
          };
        }
        //senderWallet update
        const senderUpdateField = `balance.${UtransferToken}`;
        const SenderAmount =
          Number(querySenderWallet[0].balance[UtransferToken]) -
          Number(body.amount);
        const editSenderWallet = await userdao.updateUser(
          { wallet: decodedToken.wallet },
          { $set: { [senderUpdateField]: SenderAmount } }
        );

        //recipientWallet update
        const recipientUpdateField = `balance.${UtoToken}`;
        const recipientAmount = Number(body.amount);
        const editRecipientWallet = await userdao.updateUser(
          { wallet: body.recipientWallet },
          { $set: { [recipientUpdateField]: recipientAmount } }
        );
          
        return {
          data: null,
          message: ` ${decodedToken.wallet} Transfer ${body.amount} ${UtransferToken} to ${body.recipientWallet} successful`,
          status: 200,
        };
      }
    } catch (err) {
      return {
        data: null,
        message: "Error during transfer please check token price",
        status: 401,
      };
    }
  }
}

export default UserCtr;
