import {
  IExchangeRateRequest,
  IchangeUsertoAdminRequest,
  IEditBalanceRequest,
} from "../types/user_types";
import { ExchangeRateDataDao } from "../dao/exchange_rate_dao";
import { UserDao } from "../dao/user_dao";
import jwt, { JwtPayload } from "jsonwebtoken";

class AdminCtr {
  public async addExchangeRate(
    token: any,
    body: IExchangeRateRequest
  ): Promise<any> {

      if (!body || !body.username || !body.tokenName || !body.priceUSDT) {
        return {
          message: "plese provide username recipient transfer_token to_token ",
          status: 400,
        };
      }


    try {
      const decodedToken: any = await this.CheckAuth(token);
      const exchangeRatedao = new ExchangeRateDataDao();
      const UtokenName = body.tokenName.toUpperCase()
      if (
        decodedToken.username === body.username &&
        decodedToken.role === 'admin'
      ) {
        const isAddRate = await exchangeRatedao.queryExchangeRate({token:UtokenName})
        console.log(isAddRate)


        if (isAddRate.length === 0){
        const addExchangeRate = await exchangeRatedao.insertExchangeRate({
          token: UtokenName,
          priceUSDT: body.priceUSDT,
        })
        return {
            message: 'add exchange rate successfully. ',
            stasus:200
        }
    }else{
        return {
            message: 'Token already added'
        }
    }
        ;
      } else {
        return {
          message: 'you are not allowed to add exchange rate.',
          status: 400,
        };
      }
    } catch (err) {
      console.log('Error inserting exchange rate.');
      return {
        message: "can not add exchange rate You are not admin",
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
          message: 'Please provide the secret and username',
          status: 400,
        };
      }

      const userdao = new UserDao();

      if (body.secret === "chomchob") {
        const user = await userdao.queryUser({ username: body.username });
        if (user && user.length > 0) {
          let updatedRole;

          if (user[0]?.role === "user") {
            updatedRole = await userdao.updateUser(
              { username: body.username },
              { $set: { role: "admin" } }
            );
            console.log('Updated Role: admin');
            return {
              message: 'Successfully You are admin',
              status: 200,
            };
          } else if (user[0]?.role === "admin") {
            updatedRole = await userdao.updateUser(
              { username: body.username },
              { $set: { role: "user" } }
            );
            console.log('Updated Role: user');
            return {
              message: 'Successfully You are user',
              status: 200,
            };
          }
        } else {
          return {
            message: "User not found",
            status: 404,
          };
        }
      } else {
        return {
          message: "check your secret",
          status: 400,
        };
      }
    } catch {
      console.log("Error: Could not change user role.");
      return {
        message: "Please check your secret or username",
        status: 400,
      };
    }
  }


  public async editBalance(token:any,body:IEditBalanceRequest) : Promise<any> {
    if (!body || !body.username || !body.token || !body.amount) {
        return {
          message: "plese provide username token and amount. ",
          status: 400,
        };
      }

      try{
        const decodedToken: any = await this.CheckAuth(token);
        const userdao = new UserDao();
        if (decodedToken.role === 'admin'){
            const Utoken = body.token.toUpperCase()
            const updateField = `balance.${Utoken}`;
            const Namount = Number(body.amount)
            const editBalance = await userdao.updateUser(
                { username: body.username },
                { $set: {[updateField]: Namount } })


                return  {
                    message: 'edit balance successfully',
                    status:200
                }
        }else{
            return {
                message : 'you are not allowed to edit balance',
                status:400
            }
        }

      }catch(err){
        console.log('Error editing balance')
      }
  } 

  public async getTotalBalance(token:any): Promise<any>{
    
    try{
      const decodedToken: any = await this.CheckAuth(token);
      const userdao = new UserDao()
      const data = await userdao.queryUser({})
      if(decodedToken.role ==='admin'){

        const totalBalance = data.reduce((acc:any, user:any) => {
          Object.keys(user.balance).forEach(coin => {
              acc[coin] = (acc[coin] || 0) + user.balance[coin];
          });
          return acc;
      }, {});
      
      console.log(totalBalance);
      
        
       

        return {
          totalBalance :totalBalance,
          status :200
        }

      }else{
        return {
          message : 'you are not allowed to get all total balance',
          status:400
      }
      }
    }catch(err){
      console.log('err')
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
