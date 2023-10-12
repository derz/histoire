import { createApp } from 'h3';
import { createFetch } from 'ofetch';
export async function setupNuxtApp(publicConfig) {
    const win = window;
    win.__NUXT__ = {
        serverRendered: false,
        config: {
            public: { ...publicConfig },
            app: { baseURL: '/' },
        },
        data: {},
        state: {},
    };
    const app = win.document.createElement('div');
    // this is a workaround for a happy-dom bug with ids beginning with _
    app.id = 'nuxt-test';
    win.document.body.appendChild(app);
    win.IntersectionObserver =
        win.IntersectionObserver ||
            class IntersectionObserver {
                observe() {
                    // noop
                }
            };
    const h3App = createApp();
    const registry = new Set();
    if (__HST_COLLECT__) {
        const { toNodeListener, } = await import('h3');
        const { createCall, createFetch: createLocalFetch, } = await import('unenv/runtime/fetch/index');
        // @ts-expect-error TODO: fix in h3
        const localCall = createCall(toNodeListener(h3App));
        const localFetch = createLocalFetch(localCall, globalThis.fetch);
        win.fetch = (init, options) => {
            if (typeof init === 'string' && registry.has(init)) {
                init = '/_' + init;
            }
            return localFetch(init, options);
        };
    }
    win.$fetch = createFetch({ fetch: win.fetch, Headers: win.Headers });
    win.__registry = registry;
    win.__app = h3App;
    // @ts-ignore
    const result = await import('#app/entry');
    await result.default();
}
