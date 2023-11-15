export declare interface IRegisterUserRequest {
    username: string;
    password: string;
    wallet: string;
    balance: ITokenListRequest;
    role: string;
}

export declare interface  ITokenListRequest {
    XRP: number;
    EOS: number;
    XLM: number;
    ETH: number;
    BTC: number;
    USDT: number;
}

export declare interface ILoginRequest {
    username: string;
    password: string;
}

export declare interface ITransferRequest {
    username :string;
    senderWallet: string;
    recipientWallet: string;
    transferToken: string;
    amount: number;
    toToken:string;

}

export declare interface IExchangeRateRequest {
    username : string;
    tokenName : string;
    priceUSDT :number;

}

export declare interface IchangeUsertoAdminRequest {
    username:string;
    secret: string ;
}

export declare interface IEditBalanceRequest {
    username:string;
    token:string;
    amount:number;
}