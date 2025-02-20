export class Client {
  private apiKey: string;
  private baseUrl = 'https://test.api.dibspayment.eu/v1/payments';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getPayment(paymentId: string) {
    const response = await fetch(`${this.baseUrl}/${paymentId}`, {
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment status');
    }

    return response.json();
  }
} 