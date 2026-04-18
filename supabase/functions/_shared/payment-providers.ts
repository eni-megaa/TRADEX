// Abstraction Layer Interfaces
export interface UserConfig {
  id: string;
  email: string;
  name?: string;
  country?: string;
}

export interface GatewayResponse {
  success: boolean;
  checkoutUrl?: string;
  clientSecret?: string;
  reference: string;
  message?: string;
}

export interface IPaymentProvider {
  name: string;
  createDepositIntent(amount: number, currency: string, user: UserConfig, reference: string): Promise<GatewayResponse>;
  verifyTransaction(reference: string): Promise<boolean>;
  processPayout?(amount: number, currency: string, destination: any): Promise<boolean>;
}

// -----------------------------------------------------
// 1. Stripe Implementation Example
// -----------------------------------------------------
export class StripeProvider implements IPaymentProvider {
  name = 'Stripe';
  
  async createDepositIntent(amount: number, currency: string, user: UserConfig, reference: string): Promise<GatewayResponse> {
    console.log(`[Stripe] Creating PaymentIntent for ${amount} ${currency}`);
    // In production, call: stripe.paymentIntents.create({ ... })
    // using Deno.env.get('STRIPE_SECRET_KEY')
    return {
      success: true,
      clientSecret: `pi_mock_${reference}_secret_${Date.now()}`,
      reference,
      message: 'Stripe PaymentIntent created'
    };
  }

  async verifyTransaction(reference: string): Promise<boolean> {
    console.log(`[Stripe] Verifying tx: ${reference}`);
    return true; 
  }
}

// -----------------------------------------------------
// 2. Paystack Implementation Example (Nigeria)
// -----------------------------------------------------
export class PaystackProvider implements IPaymentProvider {
  name = 'Paystack';
  
  async createDepositIntent(amount: number, currency: string, user: UserConfig, reference: string): Promise<GatewayResponse> {
    console.log(`[Paystack] Initializing transaction for ${amount} ${currency}`);
    // In production, fetch against https://api.paystack.co/transaction/initialize
    return {
      success: true,
      checkoutUrl: `https://checkout.paystack.com/mock_${reference}`,
      reference,
      message: 'Paystack checkout URL generated'
    };
  }

  async verifyTransaction(reference: string): Promise<boolean> {
    console.log(`[Paystack] Verifying tx: ${reference}`);
    return true; 
  }
}

// -----------------------------------------------------
// 3. Flutterwave Implementation Example (Nigeria/Africa)
// -----------------------------------------------------
export class FlutterwaveProvider implements IPaymentProvider {
  name = 'Flutterwave';
  
  async createDepositIntent(amount: number, currency: string, user: UserConfig, reference: string): Promise<GatewayResponse> {
    console.log(`[Flutterwave] Initializing transaction for ${amount} ${currency}`);
    return {
      success: true,
      checkoutUrl: `https://flutterwave.com/pay/mock_${reference}`,
      reference,
      message: 'Flutterwave checkout URL generated'
    };
  }

  async verifyTransaction(reference: string): Promise<boolean> {
    console.log(`[Flutterwave] Verifying tx: ${reference}`);
    return true; 
  }
}

// -----------------------------------------------------
// 4. Crypto Implementation Example (Mock Native Node / Coinbase)
// -----------------------------------------------------
export class CryptoProvider implements IPaymentProvider {
  name = 'Coinbase Commerce (Mock)';
  
  async createDepositIntent(amount: number, currency: string, user: UserConfig, reference: string): Promise<GatewayResponse> {
    console.log(`[Crypto] Generating deposit address for ${amount} ${currency}`);
    // Generate a dedicated deposit address/charge
    return {
      success: true,
      checkoutUrl: `crypto:bc1qmock_${reference}?amount=${amount}`,
      clientSecret: `bc1qmockADDRESS_${Date.now()}`, // Passing address via clientSecret slot for UI
      reference,
      message: 'Crypto deposit address generated'
    };
  }

  async verifyTransaction(reference: string): Promise<boolean> {
    console.log(`[Crypto] Checking blockchain confirmations for tx: ${reference}`);
    return true; 
  }
}

// -----------------------------------------------------
// Provider Factory
// -----------------------------------------------------
export const getProvider = (providerName: string): IPaymentProvider => {
  switch (providerName) {
    case 'Stripe': return new StripeProvider();
    case 'Paystack': return new PaystackProvider();
    case 'Flutterwave': return new FlutterwaveProvider();
    case 'Coinbase Commerce (Mock)': return new CryptoProvider();
    default: throw new Error(`Provider ${providerName} is not supported`);
  }
};
