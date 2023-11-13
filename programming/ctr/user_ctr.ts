import { UserDao } from "../dao/user_dao";
import { LogDao } from "../dao/log_dao";
import bcrypt from "bcrypt";
import Wallet from "ethereumjs-wallet";
import { IRegisterUserReqeust, ILogin,ITransfer } from "../types/user_types";
import jwt, { JwtPayload } from "jsonwebtoken";

class UserCtr {
  public async register(body: IRegisterUserReqeust): Promise<any> {
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
        message: "RegisterSuccess",
      };
    } else {
      return {
        message: "Username Already registered",
      };
    }
  }

  public async login(body: ILogin): Promise<any> {
    if (!body || !body.username || !body.password) {
      return {
        message: "Invalid request body",
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

          //decoded
          // const decoded = jwt.verify(token, String(process.env.SECRET))as JwtPayload ;
          // console.log(decoded);

          //loginsert
          await logDao.insertLog({
            username: body.username,
            type: 'login',
            create_at: new Date(Date.now()).toISOString(),
          });
          return {
            token: token,
            message: "Login successful",
          };
        }
      } else {
        return {
          token: null,
          message: "Wrong username or password",
        };
      }
    } catch (err) {
      console.error("Error during login: ", err);
      return {
        token: null,
        message: "Error during login",
      };
    }
  }

  public async transfer(token:any,body:ITransfer){

  }

}


export default UserCtr;
