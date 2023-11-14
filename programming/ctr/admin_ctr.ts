import {
  IExchangeRareReqeust,
  IchangeUsertoAdminRequest,
} from "../types/user_types";
import { ExchangeRateDataDao } from "../dao/exchange_rate_dao";
import { UserDao } from "../dao/user_dao";
import jwt, { JwtPayload } from "jsonwebtoken";

class AdminCtr {
  public async addExchangeRate(
    token: any,
    body: IExchangeRareReqeust
  ): Promise<any> {
    if (!body || !body.username || !body.tokenName || !body.price_usdt) {
      return {
        message: "plese provide username recipient transfer_token to_token ",
        status: 400,
      };
    }
    try {
      const decodedToken: any = await this.CheckAuth(token);
      const exchangeRatedao = new ExchangeRateDataDao();
      if (
        decodedToken.username === body.username &&
        decodedToken.role === "admin"
      ) {
        const addexchangeRate = await exchangeRatedao.insertExchangeRate({
          token: body.tokenName,
          price_usdt: body.price_usdt,
        });
      } else {
        return {
          message: "you are not allowed to add exchange",
          status: 400,
        };
      }
    } catch (err) {
      console.log("Error inserting exchange rate");
      return {
        message: "can add exchange rate You are not admin",
        status: 400,
      };
    }
  }

  public async changeUsertoAdmin(
    body: IchangeUsertoAdminRequest
  ): Promise<any> {
    try {
      if (!body || !body.secret || !body.username) {
        return {
          message: 'Please provide the secret, username, and role',
          status: 400,
        };
      }
  
      const userdao = new UserDao();
  
      if (body.secret === 'chomchob') {
        const user = await userdao.queryUser({ username: body.username });
        console.log(user[0].role)
        if (user && user.length > 0) {
            let updatedRole;
          
            if (user[0]?.role === 'user') {
              updatedRole = await userdao.updateUser(
                { username: body.username },
                { $set: { role: 'admin' } }
              );
              console.log('Updated Role: admin');
              return {
                message: 'Successfully You are admin',
                status: 200,
              };
            } else if (user[0]?.role === 'admin') {
              updatedRole = await userdao.updateUser(
                { username: body.username },
                { $set: { role: 'user' } }
              );
              console.log('Updated Role: user');
              return {
                message: 'Successfully You are user',
                status: 200,
              };
            }
          
            
          } else {
            return {
              message: 'User not found',
              status: 404,
            };
          }
      }
    } catch (err) {
      console.log('Error: Could not change user role.');
      return {
        message: 'Please check your secret or username',
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
    } catch (error) {
      console.error("Error during token verification:", error);
      return error;
    }
  }
}

export default AdminCtr;
