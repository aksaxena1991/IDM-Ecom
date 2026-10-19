import { createGatewayApp } from './app.js';
import { env } from './config/env.js';

const app = createGatewayApp();

app.listen(env.PORT, () => {
  console.log(`API gateway listening on http://localhost:${env.PORT}`);
  console.log(`Proxying IMS-BE at ${env.IMS_BE_URL} (/api/v1, /api-docs)`);
});
