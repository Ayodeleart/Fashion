declare module "@paystack/inline-js" {
  type PaystackTransaction = { reference: string; [key: string]: unknown };
  type ResumeCallbacks = {
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
    onError?: (error: { message: string }) => void;
  };

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: ResumeCallbacks): unknown;
  }
}
