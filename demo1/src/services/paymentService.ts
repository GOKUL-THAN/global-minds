/**
 * Payment Service
 * Architecture for future payment integration.
 * Supports Razorpay, Stripe, and PayPal.
 * 
 * IMPORTANT: Never put secret keys in this frontend file.
 * All payment secret operations must go through the backend API.
 */

type PaymentProvider = 'razorpay' | 'stripe' | 'paypal';

interface CreateOrderParams {
  courseId: string;
  amount: number;
  currency: string;
  userId: string;
}

interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
}

class PaymentService {
  async createOrder(_params: CreateOrderParams): Promise<PaymentOrder> {
    // Replace with:
    // const response = await fetch(`${API_BASE}/payments/create-order`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authService.getToken()}` },
    //   body: JSON.stringify(params),
    // });
    // return response.json();
    throw new Error('Payments are not available yet. Checkout is not configured.');
  }

  async initiateRazorpay(_order: PaymentOrder): Promise<void> {
    // Will integrate Razorpay Checkout when VITE_RAZORPAY_KEY is set
    throw new Error('Payment integration not yet configured. Please contact admissions.');
  }

  async initiateStripe(_order: PaymentOrder): Promise<void> {
    // Will integrate Stripe Checkout when VITE_STRIPE_PUBLIC_KEY is set
    throw new Error('Payment integration not yet configured. Please contact admissions.');
  }

  async verifyPayment(_paymentId: string, _orderId: string, _signature: string): Promise<boolean> {
    // Replace with backend verification call
    // Signature verification MUST happen on the server, never the client
    throw new Error('Payment verification is unavailable until a payment provider is configured.');
  }
}

export const paymentService = new PaymentService();
