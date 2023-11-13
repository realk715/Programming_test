export declare interface IRegisterUserReqeust {
    username: string;
    password: string;
    wallet: string;
    balance: ITokenListReqeust;
    role: string;
}

export declare interface  ITokenListReqeust {
    XRP: number;
    EOS: number;
    XLM: number;
    ETH: number;
    BTC: number;
    USDT: number;
}

export declare interface ILogin{
    username : string;
    password : string;
}