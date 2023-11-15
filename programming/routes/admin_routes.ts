import { Router,Request,Response } from 'express';
import AdminCtr from '../ctr/admin_ctr'
import AuthCtr from '../ctr/auth_ctr';

const router = Router();

router.post('/addRate',AuthCtr,async (req:Request,res:Response) => {
    const adminCtr = new AdminCtr();
    const result = await adminCtr.addExchangeRate(req.headers.token,req.body)
    res.status(result.status).json(result)
} )

router.post('/addAdmin',async (req:Request,res:Response) => {
    const adminCtr = new AdminCtr();
    const result = await adminCtr.changeUsertoAdmin(req.body)
    res.status(result.status).json(result)
} )

router.put('/editBalance',AuthCtr,async (req:Request,res:Response) => {
    const adminCtr = new AdminCtr();
    const result = await adminCtr.editBalance(req.headers.token,req.body)
    res.status(result.status).json(result)
} )

router.put('/editRate',AuthCtr,async (req:Request,res:Response) => {
    const adminCtr = new AdminCtr();
    const result = await adminCtr.editExchangeRate(req.headers.token,req.body)
    res.status(result.status).json(result)
} )

router.get('/get',AuthCtr,async (req:Request,res:Response) => {
    const adminCtr = new AdminCtr();
    const result = await adminCtr.getTotalBalance(req.headers.token)
    res.status(result.status).json(result)
} )


export default router