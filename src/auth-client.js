import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthVanillaAdapter } from '@neondatabase/auth/vanilla';

if (window.PORTFOLIO_AUTH_URL) {
  window.portfolioAuth = createAuthClient(window.PORTFOLIO_AUTH_URL, {
    adapter: BetterAuthVanillaAdapter({
      fetchOptions: { credentials: 'include' },
    }),
  });
}
