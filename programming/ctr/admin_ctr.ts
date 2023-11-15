import {
  IExchangeRateRequest,
  IchangeUsertoAdminRequest,
  IEditBalanceRequest,
  IEditExchangeRateRequest
} from "../types/user_types";
import { ExchangeRateDataDao } from "../dao/exchange_rate_dao";
import { UserDao } from "../dao/user_dao";
import jwt, { JwtPayload } from "jsonwebtoken";
import { LogDao } from "../dao/log_dao";

class AdminCtr {
  public async addExchangeRate(
    token: any,
    body: IExchangeRateRequest
  ): Promise<any> {

      if (!body || !body.username || !body.tokenName || !body.priceUSDT) {
        return {
          data:null,
          message: 'Plese provide username recipient transfer_token to_token ',
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
          data:null,
            message: 'Add exchange rate successfully. ',
            stasus:200
        }
    }else{
        return {
          data:null,
            message: 'Token already added',
            status:400
        }
    }
        ;
      } else {
        return {
          data:null,
          message: 'You are not allowed to add exchange rate.',
          status: 400,
        };
      }
    } catch (err) {
      console.log('Error inserting exchange rate.');
      return {
        data:null,
        message: "Can not add exchange rate You are not admin",
        status: 400,
      };
    }
  }


  public async editExchangeRate (token:any,body:IEditExchangeRateRequest ) : Promise<any> {
    
    if(!body ||!body.tokenName ||!body.editPriceUSDT){
      return {
        data:null,
        message: 'Please provide the tokenName and priceUSDT',
        status: 400,
      };
    }

    try{
        const decodedToken: any = await this.CheckAuth(token);
        const exchangeRatedao = new ExchangeRateDataDao();
        const logDao = new LogDao();
        const UTokenName = body.tokenName.toUpperCase()
        const editPriceUSDT = Number(body.editPriceUSDT)


        if (decodedToken.role === 'admin'){

        const queryToken = await exchangeRatedao.queryExchangeRate({token:UTokenName})
        if(queryToken[0].token === UTokenName){

          const editExchangeRate = await exchangeRatedao.updateExchangeRate(
            { token: UTokenName },
            { $set: { priceUSDT: editPriceUSDT } }
          );
            //loginsert
          await logDao.insertLog({
            token: UTokenName,
            type: 'edit',
            priceUSDT:editPriceUSDT,
            create_at: new Date(Date.now()).toISOString(),
          });
          return {
            data:null,
            message: 'Edit exchange rate successfully',
            status:200
          }

        }else{
          return{
            data:null,
            message : 'Not found tokenName to edit',
            status:200
          }
        }
        
        }else{
          return{
            data:null,
            message: 'You are not allowed to edit exchange rate.',
            status: 400,
          }
        }


    }catch(err){
      return ({
        data:null,
        message: 'Not found tokenName to edit',
        status:400
      })
    }


  }

  public async changeUsertoAdmin(
    body: IchangeUsertoAdminRequest
  ): Promise<any> {
    try {
      if (!body || !body.secret || !body.username) {
        return {
          data:null,
          message: 'Please provide the secret and username',
          status: 400,
        };
      }

      const userdao = new UserDao();

      if (body.secret === process.env.SECRET) {
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
              data:null,
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
              data:null,
              message: 'Successfully You are user',
              status: 200,
            };
          }
        } else {
          return {
            data:null,
            message: "User not found",
            status: 404,
          };
        }
      } else {
        return {
          data:null,
          message: 'Check your secret',
          status: 400,
        };
      }
    } catch {
      console.log('Error: Could not change user role.');
      return {
        data:null,
        message: 'Please check your secret or username',
        status: 400,
      };
    }
  }


  public async editBalance(token:any,body:IEditBalanceRequest) : Promise<any> {
    if (!body || !body.username || !body.token || !body.amount) {
        return {
          data:null,
          message: 'plese provide username token and amount. ',
          status: 400,
        };
      }

      try{
        const decodedToken: any = await this.CheckAuth(token);
        const userdao = new UserDao();
        const logDao = new LogDao();
        if (decodedToken.role === 'admin'){
            const Utoken = body.token.toUpperCase()
            const updateField = `balance.${Utoken}`;
            const Namount = Number(body.amount)
            const editBalance = await userdao.updateUser(
                { username: body.username },
                { $set: {[updateField]: Namount } })
              //insertlog
            await logDao.insertLog({
            username:body.username,
            type: 'edit',
            token: Utoken,
            amount:Namount,
            create_at: new Date(Date.now()).toISOString(),
          });
                return  {
                  data:null,
                    message: 'edit balance successfully',
                    status:200
                }
        }else{
            return {
              data:null,
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
       

        return {
          data:{total:totalBalance},
          message :'get data successfully',
          status :200
        }

      }else{
        return {
          data:null,
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
