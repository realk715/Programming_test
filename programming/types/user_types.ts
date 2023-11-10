export declare interface IRegisterUserReqeust {
    username: string;
    password: string;
    wallet: string;
    balance: TokenListReqeust;
    role: string;
}

export declare interface  TokenListReqeust {
    XRP: number;
    EOS: number;
    XLM: number;
    ETH: number;
    BTC: number;
}