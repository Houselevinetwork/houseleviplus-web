export interface SubscriptionTransactionInfo {
  account_reference: string;
  amount: number;
  first_name: string;
  last_name: string;
  correlation_id: string;
}

export interface PesapalRecurringResponse {
  payment_status_description: string;
  confirmation_code: string;
  amount: number;
  currency: string;
  created_date: Date;
  subscription_transaction_info: SubscriptionTransactionInfo;
}
