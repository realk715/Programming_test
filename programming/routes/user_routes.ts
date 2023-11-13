import {Request,Response,Router} from 'express'
import UserCtr from '../ctr/user_ctr'

const router = Router();

router.post('/register',async (req:Request, res:Response) => {
    const userCtr = new UserCtr()
    const result = await userCtr.register(req.body)
    res.json(result)
})

router.post('/login',async (req:Request, res:Response) => {
    const userCtr = new UserCtr()
    const result = await userCtr.login(req.body)
    res.json(result)
})

router.post('transfer',async(req:Request, res:Response) => {
    const userCtr = new UserCtr()
    const result = await userCtr.transfer(req.headers.token,req.body)
    res.json(result)
})


export default router