import { Request, Response, Router } from 'express';
import UserCtr from '../ctr/user_ctr';
import AuthCtr from '../ctr/auth_ctr';
const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const userCtr = new UserCtr();
  const result = await userCtr.register(req.body);
  res.json(result).status(result.status);
});

router.post('/login', async (req: Request, res: Response) => {
  const userCtr = new UserCtr();
  const result = await userCtr.login(req.body);
  res.json(result).status(result.status);
});

router.post('/transfer', AuthCtr, async (req: Request, res: Response) => {
    const userCtr = new UserCtr();
    const result = await userCtr.transfer(req.headers.token,req.body);
    res.json(result).status(result.status);
  });
  

export default router;
