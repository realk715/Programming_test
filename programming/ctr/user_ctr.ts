import { UserDao } from "../dao/user_dao";
import { LogDao } from "../dao/log_dao";
import bcrypt from "bcrypt";
import Wallet from "ethereumjs-wallet";
import { IRegisterUserReqeust, ILoginReqeust, ITransferReqeust } from '../types/user_types';
import jwt, { JwtPayload } from 'jsonwebtoken';

class UserCtr {
  public async register(body: IRegisterUserReqeust): Promise<any> {
    const userDao = new UserDao();
    const logDao = new LogDao();
    console.log(body);
    if (!body || !body.username || !body.password) {
      return {
        message: 'Invalid request body',
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
        role: 'user',
      });

      //loginsert
      await logDao.insertLog({
        username: body.username,
        type: 'register',
        create_at: new Date(Date.now()).toISOString(),
      });

      return {
        data: register,
        status:200,
        message: 'RegisterSuccess',
      };
    } else {
      return {
        message: 'Username Already registered',
        status:400
      };
    }
  }

  public async login(body: ILoginReqeust): Promise<any> {
    if (!body || !body.username || !body.password) {
      return {
        message: 'Invalid request body',
        status:'400'
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
            type: 'login',
            create_at: new Date(Date.now()).toISOString(),
          });
          return {
            token: token,
            message: 'Login successful',
            status:'200'
          };
        }
      } else {
        return {
          token: null,
          message: 'Wrong username or password',
          status:'400'
        };
      }
    } catch (err) {
      console.error('Error during login:');
      return {
        token: null,
        message: 'Error during login',
        status:'400'
      };
    }
  }
  private async CheckAuth(token: string) {
    try {
      const checkAuth = jwt.verify(
        token,
        String(process.env.SECRET)
      ) as JwtPayload;
      return checkAuth
    } catch (err) {
      console.error('Error during token verification:');
      return err; 
    }
  }

  public async transfer(token: any, body: ITransferReqeust): Promise<any> {
    if(!body || !body.username || !body.recipient || !body.transferToken || !body.toToken ){
      return {
        message:'plese provide username recipient transfer_token to_token ',
        status:400
      }
    }
    try {
        const decodedToken:any = await this.CheckAuth(token) 
        if (decodedToken.username === body.username ) {


            return {
              message: 'Transfer successful',
              status:200
            };
        } else {
            return {
                message: 'Can not Transfer username does not match',
                status:400
            };
        }
    } catch (err) {
        console.error("Error during transfer:", err);
        return {
            message: 'Error during transfer',
            status:401
        };
    }
}

  
}

export default UserCtr;
