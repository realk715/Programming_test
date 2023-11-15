import { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
  decodedToken?: JwtPayload;
}

const Authentication = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header: { token: string } = req.headers as { token: string };

  if(header.token=== undefined || header.token === null ) {
    return res.status(401).json({
      data: null,
      message : 'Need headers token '
      })
  }
  try {
    if (header.token) {
      const decodedToken = jwt.verify(
        header.token,
        String(process.env.SECRET)
      ) as JwtPayload;

      if (decodedToken) {
        req.decodedToken = decodedToken;
        next();
      }
    } else {
      throw new Error('Unauthorized Token expired or wrong token');
    }
  } catch (err) {
    // ตรวจสอบว่า error เป็น JsonWebTokenError หรือไม่
    if (err instanceof JsonWebTokenError) {
      // ส่ง response กลับไปที่ client
      return res.status(401).json({ 
        data:null,
        message: 'Wrong token'
      });
    }

  }
};

export default Authentication;
