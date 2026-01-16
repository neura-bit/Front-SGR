"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { RefreshCw } from "lucide-react"
import "./GoogleTrackingMap.css"
import { loadGoogleMapsScript } from "./googleMapsLoader"

export interface CourierMarker {
    id: string
    name: string
    latitude: number
    longitude: number
    currentTaskName?: string | null
    lastUpdate: Date
    profilePhoto?: string | null
}

interface GoogleTrackingMapProps {
    couriers: CourierMarker[]
    height?: string
    selectedCourierId?: string | null
    onCourierClick?: (courier: CourierMarker) => void
}

export const GoogleTrackingMap: React.FC<GoogleTrackingMapProps> = ({
    couriers,
    height = "100%",
    selectedCourierId,
    onCourierClick,
}) => {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<google.maps.Map | null>(null)
    const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map())
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
    const isInitialLoadRef = useRef(true) // Track if this is the first load

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Initialize map
    useEffect(() => {
        let isMounted = true

        const initMap = async () => {
            try {
                await loadGoogleMapsScript()

                if (!isMounted || !mapRef.current || typeof window === "undefined" || !window.google) return

                // Default center (Quito, Ecuador)
                const defaultCenter = { lat: -0.1937, lng: -78.492 }

                const map = new window.google.maps.Map(mapRef.current, {
                    center: defaultCenter,
                    zoom: 13,
                    mapId: "TRACKING_MAP_ID",
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                })

                mapInstanceRef.current = map
                infoWindowRef.current = new window.google.maps.InfoWindow()

                setIsLoading(false)
            } catch (err) {
                if (isMounted) {
                    setError("Error al cargar Google Maps")
                    setIsLoading(false)
                }
            }
        }

        initMap()

        return () => {
            isMounted = false
        }
    }, [])

    // Update markers when couriers change
    useEffect(() => {
        if (!mapInstanceRef.current || isLoading || typeof window === "undefined" || !window.google) return

        const map = mapInstanceRef.current
        const currentMarkerIds = new Set(couriers.map((c) => c.id))

        // Remove markers that are no longer in the list
        markersRef.current.forEach((marker, id) => {
            if (!currentMarkerIds.has(id)) {
                marker.map = null
                markersRef.current.delete(id)
            }
        })

        // Add or update markers
        couriers.forEach((courier) => {
            const position = { lat: courier.latitude, lng: courier.longitude }

            if (markersRef.current.has(courier.id)) {
                // Update existing marker position
                const marker = markersRef.current.get(courier.id)!
                marker.position = position

                // Update marker content (for photo changes)
                // We recreate the content to ensure the latest photo/initial is shown
                const markerContent = document.createElement("div")
                markerContent.className = "tracking-marker"

                // Show profile photo if available, otherwise show initial
                const avatarContent = courier.profilePhoto
                    ? `<img src="${courier.profilePhoto}" alt="${courier.name}" class="tracking-marker-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                       <span class="tracking-marker-initial" style="display:none;">${courier.name.charAt(0).toUpperCase()}</span>`
                    : `<span class="tracking-marker-initial">${courier.name.charAt(0).toUpperCase()}</span>`

                markerContent.innerHTML = `
                    <div class="tracking-marker-pin">
                        ${avatarContent}
                    </div>
                    <div class="tracking-marker-pulse"></div>
                `
                marker.content = markerContent
            } else {
                // Create new marker
                const markerContent = document.createElement("div")
                markerContent.className = "tracking-marker"

                // Show profile photo if available, otherwise show initial
                const avatarContent = courier.profilePhoto
                    ? `<img src="${courier.profilePhoto}" alt="${courier.name}" class="tracking-marker-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                       <span class="tracking-marker-initial" style="display:none;">${courier.name.charAt(0).toUpperCase()}</span>`
                    : `<span class="tracking-marker-initial">${courier.name.charAt(0).toUpperCase()}</span>`

                markerContent.innerHTML = `
                    <div class="tracking-marker-pin">
                        ${avatarContent}
                    </div>
                    <div class="tracking-marker-pulse"></div>
                `

                const marker = new window.google.maps.marker.AdvancedMarkerElement({
                    map,
                    position,
                    content: markerContent,
                    title: courier.name,
                    zIndex: 1,
                })

                // Add click listener
                marker.addListener("click", () => {
                    const infoContent = `
                        <div class="tracking-info-window">
                            <h4>${courier.name}</h4>
                            ${courier.currentTaskName ? `<p><strong>Tarea:</strong> ${courier.currentTaskName}</p>` : "<p>Sin tarea asignada</p>"}
                            <p class="tracking-info-time">Última actualización: ${courier.lastUpdate.toLocaleTimeString()}</p>
                        </div>
                    `

                    infoWindowRef.current?.setContent(infoContent)
                    infoWindowRef.current?.open(map, marker)

                    if (onCourierClick) {
                        onCourierClick(courier)
                    }
                })

                markersRef.current.set(courier.id, marker)
            }
        })

        // Only fit bounds on initial load, not on updates (to preserve user's view)
        if (couriers.length > 0 && isInitialLoadRef.current) {
            const bounds = new window.google.maps.LatLngBounds()
            couriers.forEach((courier) => {
                bounds.extend({ lat: courier.latitude, lng: courier.longitude })
            })

            if (couriers.length === 1) {
                map.setCenter({ lat: couriers[0].latitude, lng: couriers[0].longitude })
                map.setZoom(15)
            } else {
                map.fitBounds(bounds, 50)
            }

            isInitialLoadRef.current = false
        }
    }, [couriers, isLoading, onCourierClick])

    // Center map on selected courier and bring to front
    useEffect(() => {
        if (!mapInstanceRef.current) return

        // Reset all markers to default z-index
        markersRef.current.forEach((marker) => {
            marker.zIndex = 1
            if (marker.content instanceof HTMLElement) {
                marker.content.classList.remove("tracking-marker-selected")
            }
        })

        if (!selectedCourierId) return

        const selectedCourier = couriers.find((c) => c.id === selectedCourierId)
        if (!selectedCourier) return

        const map = mapInstanceRef.current
        const marker = markersRef.current.get(selectedCourierId)

        if (marker) {
            marker.zIndex = 1000
            if (marker.content instanceof HTMLElement) {
                marker.content.classList.add("tracking-marker-selected")
            }
        }

        map.setCenter({ lat: selectedCourier.latitude, lng: selectedCourier.longitude })
        map.setZoom(17)

        if (marker && infoWindowRef.current) {
            const infoContent = `
                <div class="tracking-info-window">
                    <h4>${selectedCourier.name}</h4>
                    ${selectedCourier.currentTaskName ? `<p><strong>Tarea:</strong> ${selectedCourier.currentTaskName}</p>` : "<p>Sin tarea asignada</p>"}
                    <p class="tracking-info-time">Última actualización: ${selectedCourier.lastUpdate.toLocaleTimeString()}</p>
                </div>
            `
            infoWindowRef.current.setContent(infoContent)
            infoWindowRef.current.open(map, marker)
        }
    }, [selectedCourierId, couriers])

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
    )
}
