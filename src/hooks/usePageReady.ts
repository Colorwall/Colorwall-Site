import { useState, useEffect } from 'react';

// hook to defer heavy webgl mounting until the dom is fully painted and the browser is idle.
// this prevents shader compilation from blocking the main thread during initial page load.
export function usePageReady(delayMs = 1500) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // tuff blocking log requested by user
        console.log("Blocking. Wait for react to finish mounting..");
        
        let timeoutId: NodeJS.Timeout;
        let idleId: number;

        const executeReady = () => {
            setIsReady(true);
            // clear the console after a few seconds to leave it pristine once webgl has fully compiled
            setTimeout(() => {
                console.clear();
            }, 3500);
        };

        // We use a generous timeout first to allow React to finish all its client-side rendering
        // and hydration. document.readyState === 'complete' fires immediately on client-side routing,
        // so it's not enough to guarantee the page has painted.
        timeoutId = setTimeout(() => {
            // politely wait for the browser to have a free idle frame before mounting heavy assets
            if (window.requestIdleCallback) {
                idleId = window.requestIdleCallback(executeReady, { timeout: 2000 });
            } else {
                executeReady();
            }
        }, delayMs);

        return () => {
            clearTimeout(timeoutId);
            if (idleId && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
        };
    }, [delayMs]);

    return isReady;
}
