import { onRequest } from 'firebase-functions/v2/https';
import { eslRestBase, spaIndexUrl } from './config';
import { handleLinkRequest, type ShellCache } from './handle-link';

const shellCache: ShellCache = { body: null, fetchedAt: 0 };

export const linkDictationOg = onRequest(
  {
    region: 'us-central1',
    invoker: 'public',
    cors: false,
    timeoutSeconds: 15,
    memory: '256MiB',
    maxInstances: 10,
  },
  async (req, res) => {
    const result = await handleLinkRequest(
      {
        userAgent: req.get('user-agent') || undefined,
        path: req.path || '/',
      },
      {
        fetchImpl: fetch,
        eslRestBase: eslRestBase(),
        spaIndexUrl: spaIndexUrl(),
        now: () => Date.now(),
        shellCache,
      },
    );
    for (const [key, value] of Object.entries(result.headers)) {
      res.set(key, value);
    }
    res.status(result.status).send(result.body);
  },
);
