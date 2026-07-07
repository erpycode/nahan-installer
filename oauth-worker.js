// Nahan OAuth Worker
// Handles Cloudflare OAuth2 flow for the installer.
// Users just click "Connect to Cloudflare" and authorize — no manual token/ID entry needed.
//
// Setup:
// 1. Register OAuth app at https://dash.cloudflare.com/profile/api-tokens
// 2. Set OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET as Worker secrets
// 3. Set ALLOWED_ORIGIN to your installer URL (e.g. https://erpycode.github.io)
// 4. Deploy this Worker

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const jsonResp = (d, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: CORS });

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return jsonResp({ ok: true, ts: Date.now() });
    }

    // Step 1: Redirect user to Cloudflare OAuth authorization page
    if (url.pathname === '/auth') {
      const clientId = env.OAUTH_CLIENT_ID;
      if (!clientId) return jsonResp({ error: 'OAuth not configured' }, 500);

      const state = crypto.randomUUID();
      const redirectUri = `${url.origin}/callback`;

      const authUrl = new URL('https://dash.cloudflare.com/oauth2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('state', state);
      // Request permissions needed for installer
      authUrl.searchParams.set('scope', 'account:read workers:edit d1:edit');

      return Response.redirect(authUrl.toString(), 302);
    }

    // Step 2: Handle OAuth callback — exchange code for token
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code) {
        return new Response('Missing authorization code', { status: 400 });
      }

      const clientId = env.OAUTH_CLIENT_ID;
      const clientSecret = env.OAUTH_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return new Response('OAuth not configured', { status: 500 });
      }

      try {
        // Exchange code for access token
        const tokenRes = await fetch('https://dash.cloudflare.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: `${url.origin}/callback`,
          }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
          return new Response(`Token exchange failed: ${JSON.stringify(tokenData)}`, { status: 400 });
        }

        // Get account info using the token
        const acctRes = await fetch('https://api.cloudflare.com/client/v4/accounts', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const acctData = await acctRes.json();

        const accounts = acctData.result || [];
        const primaryAccount = accounts[0] || {};

        // Build redirect URL with token data in hash (not query — for security)
        const installerOrigin = env.ALLOWED_ORIGIN || url.origin;
        const redirectUrl = new URL(installerOrigin);
        redirectUrl.hash = `token=${encodeURIComponent(tokenData.access_token)}&account_id=${encodeURIComponent(primaryAccount.id || '')}&account_name=${encodeURIComponent(primaryAccount.name || '')}`;

        return Response.redirect(redirectUrl.toString(), 302);
      } catch (e) {
        return new Response(`Error: ${e.message}`, { status: 500 });
      }
    }

    // Step 3: Exchange token via API (for AJAX-based flow)
    if (url.pathname === '/token' && request.method === 'POST') {
      const body = await request.json();
      const { code } = body;

      if (!code) return jsonResp({ error: 'Missing code' }, 400);

      const clientId = env.OAUTH_CLIENT_ID;
      const clientSecret = env.OAUTH_CLIENT_SECRET;

      try {
        const tokenRes = await fetch('https://dash.cloudflare.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: `${url.origin}/callback`,
          }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
          return jsonResp({ error: 'Token exchange failed', detail: tokenData }, 400);
        }

        // Get accounts
        const acctRes = await fetch('https://api.cloudflare.com/client/v4/accounts', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const acctData = await acctRes.json();

        return jsonResp({
          ok: true,
          token: tokenData.access_token,
          accounts: (acctData.result || []).map(a => ({ id: a.id, name: a.name })),
        });
      } catch (e) {
        return jsonResp({ error: e.message }, 500);
      }
    }

    return jsonResp({ error: 'Not found' }, 404);
  },
};
