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
import jwt, { JwtPayload } from "jsonwebtoken";

class UserCtr {
  public async register(body: IRegisterUserRequest): Promise<any> {
    const userDao = new UserDao();
    const logDao = new LogDao();
    console.log(body);
    if (!body || !body.username || !body.password) {
      return {
        message: "Invalid request body",
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
        data: register,
        status: 200,
        message: "RegisterSuccess",
      };
    } else {
      return {
        message: "Username Already registered",
        status: 400,
      };
    }
  }

  public async login(body: ILoginRequest): Promise<any> {
    if (!body || !body.username || !body.password) {
      return {
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
            token: token,
            message: "Login successful",
            status: 200,
          };
        }
      } else {
        return {
          token: null,
          message: "Wrong username or password",
          status: 400,
        };
      }
    } catch (err) {
      console.error("Error during login:");
      return {
        token: null,
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
      !body.username ||
      !body.senderWallet ||
      !body.recipientWallet ||
      !body.transferToken ||
      !body.amount ||
      !body.toToken
    ) {
      return {
        message:
          "plese provide senderWallet recipientWallet transferToken toToken ",
        status: 400,
      };
    }
    try {
      const decodedToken: any = await this.CheckAuth(token);
      if (decodedToken.wallet === body.senderWallet) {
        const userdao = new UserDao();
        const exchangeRatedao = new ExchangeRateDataDao();
        const UtransferToken = body.transferToken.toUpperCase();
        const UtoToken = body.toToken.toUpperCase();

        const queryRecipientWallet = await userdao.queryUser({
          wallet: body.recipientWallet,
        });
        const querySenderWallet = await userdao.queryUser({
          wallet: body.senderWallet,
        });

        //ตรวจสอบว่ามีกระเป๋าผู้รับไหม
        if (body.recipientWallet === queryRecipientWallet[0].wallet) {
          //ผู้ส่งต้องมีเหรียญมากกว่าจำนวนที่ส่ง
          if (
            querySenderWallet[0].balance[UtransferToken] > 0 &&
            querySenderWallet[0].balance[UtransferToken] >= body.amount
          ) {
            //ถ้าผู้รับมีเหรียญในกระเป๋าอยู่แล้วไม่ใช่เหรียญใหม่
            if (
              queryRecipientWallet[0].balance.hasOwnProperty(UtransferToken)
            ) {
              //กรณีส่งโทเคนเดียวกัน
              if (UtransferToken === UtoToken) {
                //senderWallet update
                const senderUpdateField = `balance.${UtransferToken}`;
                const SenderAmount =
                  Number(querySenderWallet[0].balance[UtransferToken]) -
                  Number(body.amount);
                const editSenderWallet = await userdao.updateUser(
                  { wallet: body.senderWallet },
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

                return {
                  message: ` ${body.senderWallet} Transfer ${body.amount} ${UtransferToken} to ${body.recipientWallet} successful`,
                  status: 200,
                };

                //กรณีส่งคนละtoken
              } else {
                const queryTransferToken =
                  await exchangeRatedao.queryExchangeRate({
                    token: UtransferToken,
                  });
                const queryToToken = await exchangeRatedao.queryExchangeRate({
                  token: UtoToken,
                });

                //senderWallet update
                const senderUpdateField = `balance.${UtransferToken}`;
                const SenderAmount =
                  Number(querySenderWallet[0].balance[UtransferToken]) -
                  Number(body.amount);
                const editSenderWallet = await userdao.updateUser(
                  { wallet: body.senderWallet },
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

                return {
                  message: ` ${body.senderWallet} Transfer ${body.amount} ${UtransferToken} for  ${swap} ${UtoToken} to ${body.recipientWallet} successful`,
                  status: 200,
                };
              }

              //ถ้าผู้รับยังไม่มีเหรียญที่ผู้ส่งมี
            } else {
              //senderWallet update
              const senderUpdateField = `balance.${UtransferToken}`;
              const SenderAmount =
                Number(querySenderWallet[0].balance[UtransferToken]) -
                Number(body.amount);
              const editSenderWallet = await userdao.updateUser(
                { wallet: body.senderWallet },
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
                message: ` ${body.senderWallet} Transfer ${body.amount} ${UtransferToken} to ${body.recipientWallet} successful`,
                status: 200,
              };
            }
          } else {
            return { message: "insufficient funds" };
          }
        } else {
          return {
            message: "Not found recipientWallet ",
            status: 400,
          };
        }
      } else {
        return {
          message: "Wrong sender wallet address",
          status: 400,
        };
      }
    } catch (err) {
      return {
        message: "Error during transfer please check token price",
        status: 401,
      };
    }
  }
}

export default UserCtr;
