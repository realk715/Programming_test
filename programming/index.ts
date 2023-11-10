import express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/user_routes'

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user',userRouter)


app.listen(process.env.PORT || 3000, ()=> {
    console.log('server listening on port 3000')
})