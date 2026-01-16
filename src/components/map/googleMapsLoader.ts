// Centralized Google Maps Loader
// This module ensures Google Maps is loaded only once and shared across all components

const GOOGLE_MAPS_API_KEY = "AIzaSyDCINY7fSZwHI0OzGu6Lq8j1OYvjQkTsDI";

// Shared promise to avoid loading conflicts across all components
let googleMapsPromise: Promise<void> | null = null;

// Wait for google.maps to be available with polling
const waitForGoogleMaps = (timeoutMs: number = 15000): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check immediately
        if (typeof window !== "undefined" && window.google?.maps) {
            resolve();
            return;
        }

        const pollInterval = 50; // Check every 50ms
        let elapsed = 0;

        const checkLoaded = setInterval(() => {
            elapsed += pollInterval;

            if (typeof window !== "undefined" && window.google?.maps) {
                clearInterval(checkLoaded);
                resolve();
            } else if (elapsed >= timeoutMs) {
                clearInterval(checkLoaded);
                reject(new Error("Timeout waiting for Google Maps to initialize"));
            }
        }, pollInterval);
    });
};

export const loadGoogleMapsScript = (): Promise<void> => {
    // If maps is already loaded, resolve immediately
    if (typeof window !== "undefined" && window.google?.maps) {
        return Promise.resolve();
    }

    // If loading is already in progress, return the existing promise
    if (googleMapsPromise) return googleMapsPromise;

    googleMapsPromise = new Promise((resolve, reject) => {
        // Double check inside promise
        if (typeof window !== "undefined" && window.google?.maps) {
            resolve();
            return;
        }

        if (typeof document === "undefined") {
            reject(new Error("Document is not available"));
            return;
        }

        // Check if another script is already inserted but not yet loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');

        if (existingScript) {
            // Script exists, wait for google.maps to be available
            waitForGoogleMaps(20000) // Wait up to 20 seconds for existing script
                .then(resolve)
                .catch(() => {
                    // If timeout, reset and try fresh load
                    googleMapsPromise = null;
                    existingScript.remove();
                    // Try loading fresh
                    loadGoogleMapsScript().then(resolve).catch(reject);
                });
            return;
        }

        // Create and insert script
        const script = document.createElement("script");
        // Use callback approach instead of relying solely on onload
        const callbackName = `__googleMapsCallback_${Date.now()}`;

        // Define global callback that Google Maps will call when ready
        (window as unknown as Record<string, () => void>)[callbackName] = () => {
            // Clean up callback
            delete (window as unknown as Record<string, () => void>)[callbackName];

            // google.maps should now be available
            if (typeof window !== "undefined" && window.google?.maps) {
                resolve();
            } else {
                // Fallback: wait a bit more
                waitForGoogleMaps(5000)
                    .then(resolve)
                    .catch(reject);
            }
        };

        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&callback=${callbackName}`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
            googleMapsPromise = null;
            delete (window as unknown as Record<string, () => void>)[callbackName];
            reject(new Error("Failed to load Google Maps script"));
        };

        document.head.appendChild(script);
    });

    return googleMapsPromise;
};

// Reset function for testing or error recovery
export const resetGoogleMapsLoader = (): void => {
    googleMapsPromise = null;
};

// Export the API key for components that need it
export { GOOGLE_MAPS_API_KEY };
