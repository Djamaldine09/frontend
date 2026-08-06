import { useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { resolveFileUrl } from '@/lib/api';

interface MapProps {
  latitude: number;
  longitude: number;
  centerName: string;
  address?: string;
  zoom?: number;
  photo?: string;
}

export default function Map({ latitude, longitude, centerName, address, zoom = 15, photo }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const photoUrl = photo ? resolveFileUrl(photo) : undefined;

  const buildPopupContent = useCallback(() => {
    const addressLine = address ? `<div style="margin-bottom: 6px; font-size: 13px; color: #3D4858;">${address}</div>` : '';
    const photoBlock = photoUrl
      ? `<img src="${photoUrl}" alt="${centerName}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 10px; margin-bottom: 8px; display: block;" />`
      : '';
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 10px; max-width: 220px;">
        ${photoBlock}
        <div style="font-weight: 700; color: #15171C; margin-bottom: 6px; font-size: 14px;">
          ${centerName}
        </div>
        ${addressLine}
        <div style="font-size: 12px; color: #67707E; line-height: 1.5;">
          <div>Latitude: ${latitude.toFixed(5)}°</div>
          <div>Longitude: ${longitude.toFixed(5)}°</div>
        </div>
      </div>
    `;
  }, [address, centerName, latitude, longitude, photoUrl]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView([latitude, longitude], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    const markerInner = photoUrl
      ? `<img src="${photoUrl}" alt="${centerName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" />`
      : `<div style="font-size: 24px; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">🏫</div>`;

    const customIcon = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #CDF564 0%, #A8E063 100%);
          border: 3px solid white;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(205, 245, 100, 0.5);
          overflow: hidden;
        ">
          ${markerInner}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });

    markerRef.current = L.marker([latitude, longitude], { icon: customIcon as L.Icon })
      .addTo(map.current)
      .bindPopup(buildPopupContent())
      .openPopup();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        markerRef.current = null;
      }
    };
  }, [buildPopupContent, latitude, longitude, zoom, photoUrl, centerName]);

  useEffect(() => {
    if (!map.current || !markerRef.current) return;

    map.current.setView([latitude, longitude], zoom);
    markerRef.current.setLatLng([latitude, longitude]);
    markerRef.current.bindPopup(buildPopupContent()).openPopup();
  }, [buildPopupContent, latitude, longitude, zoom]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        borderRadius: '16px',
        position: 'relative',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  );
}