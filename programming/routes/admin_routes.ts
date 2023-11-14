import { Router,Request,Response } from 'express';
import AdminCtr from '../ctr/admin_ctr'
import AuthCtr from '../ctr/auth_ctr';

const router = Router();

router.post('/addrate',AuthCtr,async (req:Request,res:Response) => {
    const adminCtr = new AdminCtr();
    const result = await adminCtr.addExchangeRate(req.headers.token,req.body)
    res.json(result).status(result.status);
} )

router.put('/addAdmin',async (req:Request,res:Response) => {
    const adminCtr = new AdminCtr();
    const result = await adminCtr.changeUsertoAdmin(req.body)
    res.json(result).status(result.status);
} )


export default router