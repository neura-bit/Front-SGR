import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import './GoogleTrackingMap.css';

// Google Maps API Key (same as GoogleAddressPicker)
const GOOGLE_MAPS_API_KEY = 'AIzaSyDCINY7fSZwHI0OzGu6Lq8j1OYvjQkTsDI';

export interface CourierMarker {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    currentTaskName?: string | null;
    lastUpdate: Date;
}

interface GoogleTrackingMapProps {
    couriers: CourierMarker[];
    height?: string;
    onCourierClick?: (courier: CourierMarker) => void;
}

// Load Google Maps script - shared promise to avoid loading conflicts
let googleMapsPromise: Promise<void> | null = null;

const loadGoogleMapsScript = (): Promise<void> => {
    if (googleMapsPromise) return googleMapsPromise;

    if (window.google?.maps) {
        return Promise.resolve();
    }

    // Check if another script is already loading Google Maps
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
        // Wait for the existing script to load
        googleMapsPromise = new Promise((resolve) => {
            const checkLoaded = setInterval(() => {
                if (window.google?.maps) {
                    clearInterval(checkLoaded);
                    resolve();
                }
            }, 100);
        });
        return googleMapsPromise;
    }

    googleMapsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        // Load with both places and marker libraries, and use loading=async
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
    });

    return googleMapsPromise;
};

export const GoogleTrackingMap: React.FC<GoogleTrackingMapProps> = ({
    couriers,
    height = '100%',
    onCourierClick,
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize map
    useEffect(() => {
        let isMounted = true;

        const initMap = async () => {
            try {
                await loadGoogleMapsScript();

                if (!isMounted || !mapRef.current) return;

                // Default center (Quito, Ecuador)
                const defaultCenter = { lat: -0.1937, lng: -78.4920 };

                const map = new google.maps.Map(mapRef.current, {
                    center: defaultCenter,
                    zoom: 13,
                    mapId: 'TRACKING_MAP_ID',
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    // Note: styles cannot be used when mapId is present
                    // Map styles should be configured in the Google Cloud Console
                });

                mapInstanceRef.current = map;
                infoWindowRef.current = new google.maps.InfoWindow();

                setIsLoading(false);
            } catch (err) {
                if (isMounted) {
                    setError('Error al cargar Google Maps');
                    setIsLoading(false);
                }
            }
        };

        initMap();

        return () => {
            isMounted = false;
        };
    }, []);

    // Update markers when couriers change
    useEffect(() => {
        if (!mapInstanceRef.current || isLoading) return;

        const map = mapInstanceRef.current;
        const currentMarkerIds = new Set(couriers.map(c => c.id));

        // Remove markers that are no longer in the list
        markersRef.current.forEach((marker, id) => {
            if (!currentMarkerIds.has(id)) {
                marker.map = null;
                markersRef.current.delete(id);
            }
        });

        // Add or update markers
        couriers.forEach(courier => {
            const position = { lat: courier.latitude, lng: courier.longitude };

            if (markersRef.current.has(courier.id)) {
                // Update existing marker position
                const marker = markersRef.current.get(courier.id)!;
                marker.position = position;
            } else {
                // Create new marker
                const markerContent = document.createElement('div');
                markerContent.className = 'tracking-marker';
                markerContent.innerHTML = `
                    <div class="tracking-marker-pin">
                        <span class="tracking-marker-initial">${courier.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="tracking-marker-pulse"></div>
                `;

                const marker = new google.maps.marker.AdvancedMarkerElement({
                    map,
                    position,
                    content: markerContent,
                    title: courier.name,
                });

                // Add click listener
                marker.addListener('click', () => {
                    const infoContent = `
                        <div class="tracking-info-window">
                            <h4>${courier.name}</h4>
                            ${courier.currentTaskName ? `<p><strong>Tarea:</strong> ${courier.currentTaskName}</p>` : '<p>Sin tarea asignada</p>'}
                            <p class="tracking-info-time">Última actualización: ${courier.lastUpdate.toLocaleTimeString()}</p>
                        </div>
                    `;

                    infoWindowRef.current?.setContent(infoContent);
                    infoWindowRef.current?.open(map, marker);

                    if (onCourierClick) {
                        onCourierClick(courier);
                    }
                });

                markersRef.current.set(courier.id, marker);
            }
        });

        // Fit bounds to show all markers
        if (couriers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            couriers.forEach(courier => {
                bounds.extend({ lat: courier.latitude, lng: courier.longitude });
            });

            if (couriers.length === 1) {
                map.setCenter({ lat: couriers[0].latitude, lng: couriers[0].longitude });
                map.setZoom(15);
            } else {
                map.fitBounds(bounds, 50);
            }
        }
    }, [couriers, isLoading, onCourierClick]);

    return (
        <div className="google-tracking-map-container" style={{ height }}>
            {isLoading && (
                <div className="google-tracking-map-loading">
                    <RefreshCw size={32} className="spinning" />
                    <span>Cargando mapa...</span>
                </div>
            )}
            {error && (
                <div className="google-tracking-map-error">
                    <span>{error}</span>
                </div>
            )}
            <div ref={mapRef} className="google-tracking-map" />
        </div>
    );
};
