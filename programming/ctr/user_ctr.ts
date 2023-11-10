import { UserDaos } from "../daos/user_daos";
import bcrypt from "bcrypt";
import Wallet from "ethereumjs-wallet";
import { IRegisterUserReqeust } from "../types/user_types";

class UserCtr {
  public async register(body: IRegisterUserReqeust): Promise<any> {
    const userDaos = new UserDaos();
    console.log(body)
    if (!body || !body.username || !body.password) {
      return {
        message: 'Invalid request body',
      };
    }
    
    const isRegister = await userDaos.queryUser({ username: body.username });
    console.log(isRegister)
    if (isRegister.length === 0) {
      //hash password by bcrypt
      const hashpassword = await bcrypt.hash(String(body.password), 12);
      //gen wallet ethereumjs-wallet
      const wallet = Wallet.generate();
      const walletAddress = wallet.getAddressString();
      //register
      const register = await userDaos.registerUser({
        username: body.username,
        password: hashpassword,
        wallet: walletAddress,
        balance: {
          XRP: 0,
          EOS: 0,
          XLM: 0,
          ETH: 0,
          BTC: 0,
        },
        role: "user",
      });
      return {
        data: register,
        message: 'RegisterSuccess',
      };
    }else{
      return {
        message : 'Username Already registered'
      }
    }
  }
}

export default UserCtr;
