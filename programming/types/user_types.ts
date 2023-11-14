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

export declare interface ILoginReqeust {
    username: string;
    password: string;
}

export declare interface ITransferReqeust {
    username: string;
    recipient: string;
    transferToken: string;
    amount: number;
    toToken:string;

}

export declare interface IExchangeRareReqeust {
    username : string;
    tokenName : string;
    price_usdt :number;

}

export declare interface IchangeUsertoAdminRequest {
    username:string;
    secret: string ;
}