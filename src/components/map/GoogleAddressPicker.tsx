import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Link2, Navigation, AlertCircle, Info } from 'lucide-react';
import './GoogleAddressPicker.css';
import { loadGoogleMapsScript } from './googleMapsLoader';

export interface LocationData {
    address?: string;
    latitude?: number;
    longitude?: number;
}

interface GoogleAddressPickerProps {
    address: string;
    latitude?: number;
    longitude?: number;
    onLocationChange: (location: LocationData) => void;
    defaultCenter?: { lat: number; lng: number };
}

// Parse Google Maps URL to extract coordinates
const parseGoogleMapsUrl = (url: string): { lat: number; lng: number } | null => {
    try {
        // Pattern 1: https://www.google.com/maps/place/.../@-0.1807,-78.4678,17z/...
        const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const atMatch = url.match(atPattern);
        if (atMatch) {
            return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
        }

        // Pattern 2: https://maps.google.com/?q=-0.1807,-78.4678
        // Pattern 3: https://www.google.com/maps?q=-0.1807,-78.4678
        const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const qMatch = url.match(qPattern);
        if (qMatch) {
            return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
        }

        // Pattern 4: https://www.google.com/maps/search/-0.1807,-78.4678
        const searchPattern = /\/maps\/search\/(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const searchMatch = url.match(searchPattern);
        if (searchMatch) {
            return { lat: parseFloat(searchMatch[1]), lng: parseFloat(searchMatch[2]) };
        }

        // Pattern 5: ll=-0.1807,-78.4678 in URL params
        const llPattern = /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const llMatch = url.match(llPattern);
        if (llMatch) {
            return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
        }

        // Pattern 6: data=...!3d-0.1807!4d-78.4678 (embedded coords in data param)
        const dataPattern = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
        const dataMatch = url.match(dataPattern);
        if (dataMatch) {
            return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
        }

        return null;
    } catch {
        return null;
    }
};

// Check if URL is a shortened Google Maps URL
const isShortUrl = (url: string): boolean => {
    return url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl');
};

// Expand shortened URL using a CORS proxy or direct fetch
const expandShortUrl = async (shortUrl: string): Promise<string | null> => {
    try {
        // Try to follow redirects using fetch with no-cors mode
        // Note: Due to browser CORS restrictions, we'll use Google's URL shortener API endpoint
        // or a fallback approach using the geocoder with the URL as a query

        // First, try to extract any embedded coordinates from the short URL path
        // Some goo.gl URLs have embedded place data
        const response = await fetch(shortUrl, {
            method: 'HEAD',
            redirect: 'follow',
        });

        // The final URL after redirects
        if (response.url && response.url !== shortUrl) {
            return response.url;
        }

        return null;
    } catch {
        // CORS will likely block this, so we need a fallback
        return null;
    }
};

export const GoogleAddressPicker: React.FC<GoogleAddressPickerProps> = ({
    address,
    latitude,
    longitude,
    onLocationChange,
    defaultCenter = { lat: -0.1807, lng: -78.4678 }, // Quito, Ecuador
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isExpandingUrl, setIsExpandingUrl] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState('');

    // Geocode address to coordinates
    const geocodeAddress = useCallback(async (addressText: string) => {
        if (!window.google?.maps) return;

        const geocoder = new google.maps.Geocoder();
        try {
            const result = await geocoder.geocode({ address: addressText });
            if (result.results[0]) {
                const location = result.results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                onLocationChange({ latitude: lat, longitude: lng });

                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setCenter({ lat, lng });
                    markerRef.current.position = { lat, lng };
                }
            }
        } catch (err) {
            console.error('Geocoding failed:', err);
        }
    }, [onLocationChange]);

    // Reverse geocode coordinates to address - returns address atomically with coordinates
    const reverseGeocodeAndUpdate = useCallback(async (lat: number, lng: number) => {
        if (!window.google?.maps) return;

        const geocoder = new google.maps.Geocoder();
        try {
            const result = await geocoder.geocode({ location: { lat, lng } });
            if (result.results[0]) {
                // Update all three values atomically
                onLocationChange({
                    address: result.results[0].formatted_address,
                    latitude: lat,
                    longitude: lng
                });
            }
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
        }
    }, [onLocationChange]);

    // Handle URL paste
    const handleUrlPaste = useCallback(async (url: string) => {
        setUrlInput(url);
        setError(null);

        let coords = parseGoogleMapsUrl(url);

        // If it's a short URL and we couldn't parse it directly, try to expand it
        if (!coords && isShortUrl(url)) {
            setIsExpandingUrl(true);
            try {
                const expandedUrl = await expandShortUrl(url);
                if (expandedUrl) {
                    coords = parseGoogleMapsUrl(expandedUrl);
                }
            } catch {
                // Fallback - show message to user
            } finally {
                setIsExpandingUrl(false);
            }
        }

        if (coords) {
            if (mapInstanceRef.current && markerRef.current) {
                mapInstanceRef.current.setCenter(coords);
                mapInstanceRef.current.setZoom(17);
                markerRef.current.position = coords;
            }

            // Reverse geocode and update all values atomically
            reverseGeocodeAndUpdate(coords.lat, coords.lng);
        } else if (url.includes('google.com/maps') || url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
            // For short URLs that couldn't be expanded, show a helpful message
            if (isShortUrl(url)) {
                setError('No se pudo expandir esta URL corta. Por favor, abre el enlace en el navegador, copia la URL completa de la barra de direcciones y pégala aquí.');
            } else {
                setError('No se pudieron extraer las coordenadas de esta URL. Intenta con otro formato.');
            }
        }
    }, [reverseGeocodeAndUpdate]);

    // Get current location
    const handleGetCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocalización no soportada en este navegador');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setCenter({ lat, lng });
                    mapInstanceRef.current.setZoom(17);
                    markerRef.current.position = { lat, lng };
                }

                // Reverse geocode and update all values atomically
                reverseGeocodeAndUpdate(lat, lng);
                setError(null);
            },
            () => {
                setError('No se pudo obtener la ubicación actual');
            }
        );
    }, [reverseGeocodeAndUpdate]);

    // Initialize map
    useEffect(() => {
        let isMounted = true;

        const initMap = async () => {
            try {
                await loadGoogleMapsScript();

                if (!isMounted || !mapRef.current) return;

                // Import the marker library
                const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

                const initialCenter = latitude && longitude
                    ? { lat: latitude, lng: longitude }
                    : defaultCenter;

                const map = new google.maps.Map(mapRef.current, {
                    center: initialCenter,
                    zoom: 15,
                    mapId: 'client-address-map',
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                });

                mapInstanceRef.current = map;

                // Create draggable marker
                const marker = new AdvancedMarkerElement({
                    map,
                    position: initialCenter,
                    gmpDraggable: true,
                    title: 'Ubicación del cliente',
                });

                markerRef.current = marker;

                // Handle marker drag
                marker.addListener('dragend', () => {
                    const position = marker.position as google.maps.LatLngLiteral;
                    if (position) {
                        // Reverse geocode and update all values atomically
                        reverseGeocodeAndUpdate(position.lat, position.lng);
                    }
                });

                // Handle map click
                map.addListener('click', (e: google.maps.MapMouseEvent) => {
                    if (e.latLng) {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();

                        marker.position = { lat, lng };
                        // Reverse geocode and update all values atomically
                        reverseGeocodeAndUpdate(lat, lng);
                    }
                });

                // Setup autocomplete for address input - use 'geocode' to support intersections
                if (addressInputRef.current) {
                    const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
                        types: ['geocode'], // 'geocode' supports addresses, intersections, and precise locations
                        componentRestrictions: { country: 'ec' }, // Ecuador
                    });

                    autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (place.geometry?.location) {
                            const lat = place.geometry.location.lat();
                            const lng = place.geometry.location.lng();

                            // Update all values atomically
                            onLocationChange({
                                address: place.formatted_address || '',
                                latitude: lat,
                                longitude: lng
                            });

                            map.setCenter({ lat, lng });
                            map.setZoom(17);
                            marker.position = { lat, lng };
                        }
                    });

                    autocompleteRef.current = autocomplete;
                }

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
    }, []); // Only run once on mount

    // Update marker position when lat/lng props change externally
    useEffect(() => {
        if (latitude && longitude && mapInstanceRef.current && markerRef.current && !isLoading) {
            mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
            markerRef.current.position = { lat: latitude, lng: longitude };
        }
    }, [latitude, longitude, isLoading]);

    return (
        <div className="google-address-picker">
            {/* Address Input with Autocomplete */}
            <div className="address-input-section">
                <label className="address-picker-label">
                    <MapPin size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />
                    Dirección
                </label>
                <div className="address-input-wrapper">
                    <MapPin size={16} className="address-input-icon" />
                    <input
                        ref={addressInputRef}
                        type="text"
                        className="address-input"
                        placeholder="Escribe la dirección..."
                        value={address}
                        onChange={(e) => onLocationChange({ address: e.target.value })}
                        onBlur={() => {
                            if (address && !latitude) {
                                geocodeAddress(address);
                            }
                        }}
                    />
                </div>
            </div>

            {/* URL Input */}
            <div className="address-input-section">
                <div className="address-picker-divider">
                    <span>O pega una URL de Google Maps (soporta goo.gl)</span>
                </div>
                <div className="address-input-wrapper url-input-wrapper">
                    <Link2 size={16} className="address-input-icon" />
                    <input
                        type="text"
                        className="address-input"
                        placeholder="https://maps.google.com/... o https://goo.gl/maps/..."
                        value={urlInput}
                        onChange={(e) => handleUrlPaste(e.target.value)}
                        disabled={isExpandingUrl}
                    />
                    {isExpandingUrl && (
                        <div className="url-loading-indicator">
                            <div className="map-loading-spinner" style={{ width: 16, height: 16 }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="address-picker-error">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Map Container */}
            <div className="address-map-container">
                {isLoading ? (
                    <div className="map-loading">
                        <div className="map-loading-spinner" />
                        Cargando mapa...
                    </div>
                ) : null}
                <div
                    ref={mapRef}
                    className="address-map"
                    style={{ display: isLoading ? 'none' : 'block' }}
                />
                {!isLoading && (
                    <div className="map-quick-actions">
                        <button
                            type="button"
                            className="map-action-btn"
                            onClick={handleGetCurrentLocation}
                        >
                            <Navigation size={14} />
                            Mi ubicación
                        </button>
                    </div>
                )}
            </div>

            {/* Coordinates Display */}
            {(latitude || longitude) && (
                <div className="coordinates-display">
                    <div className="coord-item">
                        <span className="coord-label">Lat:</span>
                        <span className="coord-value">{latitude?.toFixed(6) || '-'}</span>
                    </div>
                    <div className="coord-item">
                        <span className="coord-label">Lng:</span>
                        <span className="coord-value">{longitude?.toFixed(6) || '-'}</span>
                    </div>
                </div>
            )}

            {/* Helper Text */}
            <div className="address-picker-helper">
                <Info size={12} />
                <span>Arrastra el marcador o haz clic en el mapa para ajustar la ubicación</span>
            </div>
        </div>
    );
};
