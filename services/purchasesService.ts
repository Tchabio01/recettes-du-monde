import { Platform } from "react-native";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { ENV, MONETIZATION } from "@/constants/config";

/**
 * Service RevenueCat centralisé pour l'achat "Remove Ads" (non consommable)
 * et l'abonnement Premium (mensuel).
 */
class PurchasesService {
  private initialized = false;

  async initialize(appUserId?: string) {
    if (this.initialized) return;
    const apiKey = Platform.select({
      ios: ENV.revenueCatApiKeyIos,
      android: ENV.revenueCatApiKeyAndroid,
    });
    if (!apiKey) {
      console.warn("[Purchases] Clé API RevenueCat manquante, voir .env.example");
      return;
    }
    Purchases.configure({ apiKey, appUserID: appUserId });
    this.initialized = true;
  }

  async getOfferings() {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  }

  async purchaseRemoveAds(): Promise<CustomerInfo | null> {
    const offering = await this.getOfferings();
    const pkg = offering?.availablePackages.find(
      (p) => p.identifier === MONETIZATION.removeAdsProductId,
    );
    if (!pkg) return null;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  }

  async purchasePremium(): Promise<CustomerInfo | null> {
    const offering = await this.getOfferings();
    const pkg = offering?.availablePackages.find(
      (p) => p.identifier === MONETIZATION.premiumSubscriptionId,
    );
    if (!pkg) return null;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  }

  async restorePurchases(): Promise<CustomerInfo> {
    return Purchases.restorePurchases();
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    return Purchases.getCustomerInfo();
  }

  hasEntitlement(customerInfo: CustomerInfo, entitlementId: string): boolean {
    return customerInfo.entitlements.active[entitlementId] !== undefined;
  }
}

export const purchasesService = new PurchasesService();
