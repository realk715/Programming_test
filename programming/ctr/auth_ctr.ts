import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
    decodedToken?: JwtPayload;
  }

const Authentication = (req: AuthRequest, res: Response, next: NextFunction) => {
    
    try {
    const header: { token: string } = req.headers as { token: string };
    if(header.token){
    const decodedToken = jwt.verify(
        header.token,
        String(process.env.SECRET)
      ) as JwtPayload;
      if (decodedToken) {
        next();
      }} else {
        return {
          message: 'Unauthorized Token expired or wrong token',
          status:401
        };}
      
    } catch (error) {
      console.error('Error during token verification:', error)
  
      return {
        message: 'Unauthorized Token expired or wrong token',
        status:401
      };
    }
  };
  
  export default Authentication;
  
