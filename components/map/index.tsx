import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 確保 Leaflet 圖標正確顯示
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  location: { lat: number; lng: number } | null;
  checkInLocation: { lat: number; lng: number } | null;
  radius: number;
}

const Map: React.FC<MapProps> = ({ location, checkInLocation, radius }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null); // 存放標記的 LayerGroup

  useEffect(() => {
    if (!location || !mapRef.current) return;

    // **初始化地圖 (僅初始化一次)**
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([location.lat, location.lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(mapInstance.current);

      markersRef.current = L.layerGroup().addTo(mapInstance.current); // 初始化 LayerGroup
    }

    // **避免 LayerGroup 被清空**
    if (!markersRef.current) {
      markersRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    // **清除舊的標記**
    markersRef.current.clearLayers();

    // **新增使用者標記**
    const userMarker = L.marker([location.lat, location.lng]).bindPopup('打卡人').openPopup();
    markersRef.current.addLayer(userMarker);

    // **新增打卡地點和範圍圓圈**
    if (checkInLocation) {
      const checkInMarker = L.marker([checkInLocation.lat, checkInLocation.lng]).bindPopup('打卡地點');
      const circle = L.circle([checkInLocation.lat, checkInLocation.lng], {
        radius: radius,
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3,
      });

      markersRef.current.addLayer(checkInMarker);
      markersRef.current.addLayer(circle);

      // **使用 setTimeout 延遲 fitBounds，避免標記剛加入時地圖異常變動**
      setTimeout(() => {
        if (mapInstance.current) {
          const bounds = L.latLngBounds([location, checkInLocation]);
          mapInstance.current.fitBounds(bounds.pad(0.3));
        }
      }, 300);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [location, checkInLocation, radius]);

  if (!location) return <div>請先獲取位置</div>;

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }}></div>;
};

export default Map;
  