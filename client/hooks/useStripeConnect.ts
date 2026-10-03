// hooks/useStripeConnect.ts
import { useState, useEffect } from "react";
import { StripeConnectInstance, loadConnectAndInitialize } from "@stripe/connect-js";
import { createAccountSession } from '@/utils/services/stripe';

export const useStripeConnect = (connectedAccountId: string | null): StripeConnectInstance => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);

  useEffect(() => {
    if (connectedAccountId) {
      const fetchClientSecret = async () => {
        const { client_secret: clientSecret, error } = await createAccountSession(connectedAccountId);

        if (error) {
          // Handle errors on the client side here
          throw new Error(`An error occurred: ${error}`);
        }

        return clientSecret;
      };

      const initializeStripeConnect = async () => {
        const clientSecret = await fetchClientSecret();
        if (clientSecret === null) {
          throw new Error(`The client secret is null.`);
        } 

        setStripeConnectInstance(
          loadConnectAndInitialize({
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!,
            fetchClientSecret: () => Promise.resolve(clientSecret),
            appearance: {
              overlays: "dialog",
              variables: {
                colorPrimary: "#ceb888",
              },
            },
          })
        );
      };

      initializeStripeConnect();
    }
  }, [connectedAccountId]);

  return stripeConnectInstance;
};

export default useStripeConnect;
