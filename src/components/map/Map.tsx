import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

export interface MapMarker {
    id: string;
    position: LatLngExpression;
    popup?: React.ReactNode;
    iconClass?: string;
}

interface MapProps {
    center: LatLngExpression;
    zoom?: number;
    markers?: MapMarker[];
    height?: string;
}

export const Map: React.FC<MapProps> = ({
    center,
    zoom = 13,
    markers = [],
    height = '600px',
}) => {
    return (
        <div className="map-wrapper" style={{ height }}>
            <MapContainer
                center={center}
                zoom={zoom}
                className="map-container"
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker) => (
                    <Marker key={marker.id} position={marker.position}>
                        {marker.popup && <Popup>{marker.popup}</Popup>}
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};
