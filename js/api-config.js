
// Origen publico de la API; nunca colocar aqui DATABASE_URL ni otras credenciales.
const esEntornoLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
window.PORTFOLIO_API_URL = esEntornoLocal
  ? ''
  : 'https://portfolio-luciano-lopez.vercel.app';
window.PORTFOLIO_AUTH_URL = esEntornoLocal
  ? ''
  : 'https://ep-lingering-pine-b6lqwdj9.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth';
window.PORTFOLIO_ADMIN_EMAIL = 'lucianoscarlopez@gmail.com';
