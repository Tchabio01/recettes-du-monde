# Recettes du Monde 🍲

Application mobile React Native / Expo — recettes rapides et faciles, recherche par
ingrédients, favoris, liste de courses, mode hors-ligne. Monétisation freemium :
AdMob + achat in-app "Remove Ads" + abonnement Premium.

## Stack

Expo (Router) · TypeScript strict · NativeWind (Tailwind) · Zustand + TanStack Query ·
Supabase (Auth/DB/Storage/Edge Functions) · react-native-google-mobile-ads + Google UMP ·
RevenueCat · Expo Notifications · Sentry · PostHog · i18next (FR/EN) ·
React Hook Form + Zod · EAS Build/Submit + GitHub Actions.

## 1. Installation

```bash
npm install
cp .env.example .env
# Remplir .env avec vos vraies clés (voir section "Variables d'environnement")
npx expo start
```

Nécessite un **Development Build** (pas Expo Go) car le projet utilise des modules
natifs (AdMob, RevenueCat, Notifications) :

```bash
npx expo prebuild
eas build --profile development --platform ios   # ou android
```

## 2. Variables d'environnement

Toutes documentées dans `.env.example`. Résumé :

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Projet Supabase |
| `ADMOB_ANDROID_APP_ID` / `ADMOB_IOS_APP_ID` | ID d'App AdMob (App ID, pas bloc d'annonce) |
| `EXPO_PUBLIC_ADMOB_*` | IDs des blocs d'annonces (bannière, interstitiel, rewarded, native) |
| `EXPO_PUBLIC_REVENUECAT_*_KEY` | Clés API RevenueCat iOS / Android |
| `EXPO_PUBLIC_SENTRY_DSN` | DSN Sentry |
| `EXPO_PUBLIC_POSTHOG_*` | Clé + host PostHog |
| `EAS_PROJECT_ID` | ID projet EAS |

En développement, `app.config.ts` et `services/adsService.ts` utilisent automatiquement
les **IDs de test officiels Google** si les variables AdMob ne sont pas définies — vous
n'avez rien à faire pour tester les pubs en dev.

⚠️ **Ne jamais utiliser les IDs AdMob réels en développement** (risque de bannissement
du compte pour clics invalides). Le switch dev/prod est géré par `__DEV__` dans
`services/adsService.ts`.

## 3. Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Appliquer la migration : `supabase db push` (ou copier `supabase/migrations/0001_init.sql`
   dans l'éditeur SQL du dashboard).
3. Déployer l'Edge Function de suppression de compte :
   ```bash
   supabase functions deploy delete-account
   ```
4. Activer les providers Auth voulus (Email, Apple, Google) dans
   *Authentication → Providers*.
5. Copier `Project URL` et `anon public key` dans `.env`.

## 4. Configuration AdMob + UMP

1. Créer une app sur [admob.google.com](https://admob.google.com) → copier l'**App ID**
   (`ca-app-pub-xxx~yyy`) dans `ADMOB_ANDROID_APP_ID` / `ADMOB_IOS_APP_ID`.
2. Créer 4 blocs d'annonces (Bannière, Interstitiel, Rewarded, Native) → copier leurs
   IDs (`ca-app-pub-xxx/yyy`) dans les variables `EXPO_PUBLIC_ADMOB_*`.
3. Dans **Confidentialité et messages** (Privacy & messaging) sur AdMob, créer un
   message de consentement RGPD (UMP) pour l'UE/EEE + Royaume-Uni. Le code
   (`services/adsService.ts`) appelle `AdsConsent.requestInfoUpdate()` /
   `showForm()` automatiquement au démarrage — aucune pub n'est chargée avant
   résolution du consentement.
4. Sur iOS, la permission **App Tracking Transparency** est demandée juste après
   le consentement UMP (`expo-tracking-transparency`).
5. Héberger un fichier `app-ads.txt` à la racine du site associé à votre compte
   développeur (obligatoire pour la validation AdMob), format :
   ```
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
6. Déclarer l'usage des données publicitaires dans **App Store Connect → App
   Privacy** et **Play Console → Data safety** (voir section 7).

Logique de monétisation centralisée dans `services/adsService.ts` :
- Bannière adaptative : Accueil + Recherche (`components/ads/AdBanner.tsx`)
- Native ad toutes les 5 recettes dans les listes (`NativeAdCard.tsx`)
- Interstitiel après 3 recettes consultées, 1×/session (`useInterstitialOnRecipeView`)
- Rewarded pour débloquer une recette premium ou 24h sans pub (`RewardedButton.tsx`)
- Aucune pub n'est jamais chargée si `hasRemovedAds`, `isSubscribed`, ou la fenêtre
  "24h sans pub" est active (`adsService.canShowAds()`)

## 5. Configuration RevenueCat

1. Créer un projet sur [revenuecat.com](https://www.revenuecat.com), lier vos apps
   App Store Connect / Play Console.
2. Créer les produits :
   - `remove_ads_lifetime` (achat unique, 2,99 €)
   - `premium_monthly` (abonnement, 1,99 €/mois)
3. Créer une Offering "default" avec ces deux Packages.
4. Copier les clés API publiques iOS/Android dans `.env`.

## 6. Scripts

```bash
npm run dev            # démarrer Metro
npm run lint            # ESLint
npm run typecheck       # tsc --noEmit
npm run test             # Jest
npm run test:e2e         # Maestro (nécessite maestro CLI + simulateur/device)
npm run build:preview     # EAS build profil preview
npm run build:prod        # EAS build profil production
npm run submit:ios        # EAS submit iOS
npm run submit:android    # EAS submit Android
```

## 7. Publication sur les stores

### App Store (iOS)
1. `eas build --profile production --platform ios`
2. Dans App Store Connect : renseigner métadonnées, captures d'écran, politique de
   confidentialité (obligatoire, doit mentionner AdMob + RevenueCat + Sentry +
   PostHog comme tiers).
3. **App Privacy** : déclarer la collecte de données via AdMob (identifiants,
   données d'usage à des fins publicitaires) et RevenueCat (identifiants d'achat).
4. `eas submit --profile production --platform ios`
5. Soumettre à la review Apple. Vérifier que le prompt ATT (App Tracking
   Transparency) est bien déclenché avant tout chargement de pub personnalisée.

### Google Play (Android)
1. `eas build --profile production --platform android`
2. Dans Play Console : créer une clé de compte de service (`google-service-account.json`,
   référencée dans `eas.json`) avec le rôle "Release manager".
3. **Data safety** : déclarer la collecte pour la publicité (AdMob), les achats
   (RevenueCat), et le diagnostic (Sentry/PostHog). Cocher "Contient des pubs".
4. Fournir la politique de confidentialité et les CGU.
5. `eas submit --profile production --platform android`
6. Publier d'abord en test interne/fermé avant la production.

### Checklist commune
- [ ] Politique de confidentialité publiée (URL publique)
- [ ] CGU publiées
- [ ] `app-ads.txt` en place sur le domaine lié à AdMob
- [ ] Consentement UMP testé (VPN UE pour forcer l'affichage du formulaire)
- [ ] IDs AdMob réels renseignés en variables d'env `production` sur EAS
      (`eas secret:create`)
- [ ] Produits RevenueCat validés en sandbox (iOS) / test interne (Android)
- [ ] Suppression de compte fonctionnelle (Edge Function `delete-account` déployée)

## 8. Architecture

```
app/                  Écrans (Expo Router : (onboarding), (auth), (tabs))
components/           ui/ (design system), ads/, recipe/
features/             Logique métier par domaine (réservé pour extraction future)
lib/                  supabase.ts, i18n/, utils.ts
hooks/                useRecipes, useInterstitialOnRecipeView
services/             adsService, purchasesService, notificationsService, recipesService
store/                Zustand : favoris, courses, monétisation, onboarding, réglages
types/                Types partagés
constants/             config.ts (env, monétisation, libellés)
supabase/             migrations SQL + Edge Functions
e2e/                   Scénarios Maestro
```

## 9. Sécurité & conformité

- Tokens de session Supabase stockés dans `expo-secure-store` (jamais AsyncStorage brut)
- Row Level Security activée sur toutes les tables Supabase
- Aucun secret dans le code — tout passe par `.env` / EAS secrets
- HTTPS uniquement (Supabase + AdMob + RevenueCat)
- RGPD : consentement UMP obligatoire avant toute requête publicitaire
- ATT (iOS) : demandé après le consentement UMP, avant chargement des pubs
