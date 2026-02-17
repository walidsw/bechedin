declare module 'sslcommerz-lts' {
  class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, is_live: boolean);
    init(data: Record<string, any>): Promise<any>;
    validate(data: { val_id: string }): Promise<any>;
    transactionQueryByTransactionId(tran_id: string): Promise<any>;
  }
  export default SSLCommerzPayment;
}
