/**
 * MyFatoorah Payment Gateway Service
 * Integration for MyFatoorah payment processing
 */

interface MyFatoorahConfig {
  apiKey: string;
  countryCode: string;
  isTest: boolean;
  baseUrl: string;
}

interface InvoiceRequest {
  NotificationOption?: string;
  DisplayCurrencyIso?: string;
  InvoiceValue: number;
  CustomerName: string;
  CallBackUrl: string;
  ErrorUrl: string;
  CustomerEmail?: string;
  CustomerMobile?: string;
  Language?: string;
  CustomerReference?: string;
  CustomerAddress?: {
    AddressLine?: string;
    City?: string;
    Country?: string;
  };
  InvoiceItems?: Array<{
    ItemName: string;
    Quantity: number;
    UnitPrice: number;
  }>;
}

interface InvoiceResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors?: any[];
  Data?: {
    InvoiceId: number;
    InvoiceURL: string;
    CustomerReference: string;
    UserDefinedField: string;
    RecurringId: string;
  };
}

interface PaymentStatusResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors?: any[];
  Data?: {
    InvoiceId: number;
    InvoiceStatus: string;
    InvoiceValue: number;
    InvoiceDisplayValue: string;
    CustomerReference: string;
    CustomerName: string;
    CustomerMobile: string;
    CustomerEmail: string;
    InvoiceTransactions: Array<{
      TransactionDate: string;
      PaymentGateway: string;
      ReferenceId: string;
      TrackId: string;
      PaymentId: string;
      AuthorizationId: string;
      TransactionStatus: string;
      TransationValue: string;
      CustomerServiceCharge: string;
      TotalServiceCharge: string;
      DueValue: string;
      PaidCurrency: string;
      PaidCurrencyValue: string;
      Currency: string;
      CurrencyRate: number;
      Country: string;
      CardNumber: string;
      Error: string;
    }>;
  };
}

export class MyFatoorahService {
  private config: MyFatoorahConfig;

  constructor(config?: Partial<MyFatoorahConfig>) {
    // Get and trim API key (remove any whitespace)
    let apiKey = config?.apiKey || process.env.MYFATOORAH_API_KEY || "";
    apiKey = apiKey.trim();
    
    const countryCode = config?.countryCode || process.env.MYFATOORAH_COUNTRY_CODE || "USA";
    // Use test mode by default (can be overridden via env var)
    // Check if explicitly set to "false" (string) or false (boolean)
    const testModeEnv = process.env.MYFATOORAH_TEST_MODE;
    const isTest = config?.isTest ?? (testModeEnv !== "false" && testModeEnv !== false && testModeEnv !== "0");
    
    // Determine base URL based on test mode and country
    let baseUrl = "https://api.myfatoorah.com"; // Default production v2
    if (isTest) {
      baseUrl = "https://apitest.myfatoorah.com"; // Test v2
    } else {
      // Country-specific production URLs (if needed)
      const countryUrls: Record<string, string> = {
        KWT: "https://api.myfatoorah.com",
        SAU: "https://api-sa.myfatoorah.com",
        ARE: "https://api.myfatoorah.com",
        QAT: "https://api-qa.myfatoorah.com",
        BHR: "https://api.myfatoorah.com",
        OMN: "https://api.myfatoorah.com",
        JOR: "https://api.myfatoorah.com",
        EGY: "https://api-eg.myfatoorah.com",
      };
      baseUrl = countryUrls[countryCode] || baseUrl;
    }

    this.config = {
      apiKey,
      countryCode,
      isTest,
      baseUrl: config?.baseUrl || baseUrl,
    };

    if (!this.config.apiKey) {
      console.warn("⚠️ MyFatoorah API key not configured");
    } else {
      console.log(`✓ MyFatoorah initialized (${isTest ? "Test" : "Production"} mode, Country: ${countryCode}, Base URL: ${this.config.baseUrl})`);
      console.log(`✓ MyFatoorah API Key: ${this.config.apiKey.substring(0, 20)}...${this.config.apiKey.substring(this.config.apiKey.length - 10)}`);
    }
  }

  /**
   * Create a payment invoice and get the payment URL
   */
  async createInvoice(request: InvoiceRequest): Promise<InvoiceResponse> {
    if (!this.config.apiKey || this.config.apiKey.trim().length === 0) {
      throw new Error("MyFatoorah API key is not configured. Please set MYFATOORAH_API_KEY environment variable.");
    }
    
    // Validate API key format (MyFatoorah API keys are typically alphanumeric with hyphens)
    if (this.config.apiKey.length < 20) {
      console.warn("[MyFatoorah] API key seems too short. Please verify it's correct.");
    }

    const url = `${this.config.baseUrl}/v2/SendPayment`;
    
    const payload = {
      NotificationOption: request.NotificationOption || "Lnk",
      DisplayCurrencyIso: request.DisplayCurrencyIso || "USD",
      InvoiceValue: request.InvoiceValue,
      CustomerName: request.CustomerName,
      CallBackUrl: request.CallBackUrl,
      ErrorUrl: request.ErrorUrl,
      ...(request.CustomerEmail && { CustomerEmail: request.CustomerEmail }),
      ...(request.CustomerMobile && { CustomerMobile: request.CustomerMobile }),
      ...(request.Language && { Language: request.Language }),
      ...(request.CustomerReference && { CustomerReference: request.CustomerReference }),
      ...(request.CustomerAddress && { CustomerAddress: request.CustomerAddress }),
      ...(request.InvoiceItems && { InvoiceItems: request.InvoiceItems }),
    };

    try {
      // Log request details (without exposing full API key)
      const apiKeyPreview = this.config.apiKey ? `${this.config.apiKey.substring(0, 20)}...${this.config.apiKey.substring(this.config.apiKey.length - 10)}` : "NOT SET";
      console.log("[MyFatoorah] Creating invoice:", { 
        url, 
        baseUrl: this.config.baseUrl,
        isTest: this.config.isTest,
        apiKeyPreview,
        payload: { ...payload, InvoiceValue: payload.InvoiceValue } 
      });
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      // Check response status
      if (!response.ok) {
        const text = await response.text();
        console.error("[MyFatoorah] HTTP Error:", response.status, response.statusText);
        console.error("[MyFatoorah] Response body:", text.substring(0, 500));
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text.substring(0, 200)}`);
      }

      // Check if response has content
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("[MyFatoorah] Non-JSON response:", text.substring(0, 500));
        throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
      }

      // Parse JSON response
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from MyFatoorah API");
      }

      let data: InvoiceResponse;
      try {
        data = JSON.parse(text);
      } catch (parseError: any) {
        console.error("[MyFatoorah] JSON parse error:", parseError);
        console.error("[MyFatoorah] Response text:", text.substring(0, 500));
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }

      if (!data.IsSuccess) {
        const errorMessage = data.Message || `HTTP ${response.status}`;
        const validationErrors = data.ValidationErrors?.map((e: any) => e.Error).join(", ");
        throw new Error(validationErrors || errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error("[MyFatoorah] Invoice creation error:", error);
      if (error.message.includes("Failed to create MyFatoorah invoice")) {
        throw error; // Re-throw if already wrapped
      }
      throw new Error(`Failed to create MyFatoorah invoice: ${error.message}`);
    }
  }

  /**
   * Get payment status by PaymentId
   */
  async getPaymentStatus(paymentId: string, idType: "PaymentId" | "InvoiceId" = "PaymentId"): Promise<PaymentStatusResponse> {
    if (!this.config.apiKey) {
      throw new Error("MyFatoorah API key is not configured");
    }

    const url = `${this.config.baseUrl}/v2/GetPaymentStatus`;
    
    const payload = {
      Key: paymentId,
      KeyType: idType,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data: PaymentStatusResponse = await response.json();

      if (!response.ok || !data.IsSuccess) {
        const errorMessage = data.Message || `HTTP ${response.status}`;
        const validationErrors = data.ValidationErrors?.map((e: any) => e.Error).join(", ");
        throw new Error(validationErrors || errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error("[MyFatoorah] Payment status check error:", error);
      throw new Error(`Failed to get MyFatoorah payment status: ${error.message}`);
    }
  }

  /**
   * Get payment status by InvoiceId
   */
  async getInvoiceStatus(invoiceId: number): Promise<PaymentStatusResponse> {
    return this.getPaymentStatus(invoiceId.toString(), "InvoiceId");
  }

  /**
   * Check if payment is successful
   */
  isPaymentSuccessful(statusResponse: PaymentStatusResponse): boolean {
    if (!statusResponse.Data) {
      return false;
    }

    const status = statusResponse.Data.InvoiceStatus;
    return status === "Paid" || status === "Pending";
  }

  /**
   * Get payment amount from status response
   */
  getPaymentAmount(statusResponse: PaymentStatusResponse): number {
    if (!statusResponse.Data) {
      return 0;
    }
    return statusResponse.Data.InvoiceValue || 0;
  }
}

// Export singleton instance
let myfatoorahService: MyFatoorahService | null = null;

export function getMyFatoorahService(): MyFatoorahService {
  if (!myfatoorahService) {
    myfatoorahService = new MyFatoorahService();
  }
  return myfatoorahService;
}

// Export types
export type { InvoiceRequest, InvoiceResponse, PaymentStatusResponse };



