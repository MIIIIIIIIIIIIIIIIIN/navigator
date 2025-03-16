'use client'; // 標記為客戶端組件

import React, { useEffect, useRef, useState } from 'react';

// 添加 Google Maps API 的類型定義
declare global {
  interface Window {
    google: typeof google;
  }
}

interface MapProps {
  location: { lat: number; lng: number } | null;
  checkInLocation: { lat: number; lng: number } | null;
  radius: number;
}

const Map: React.FC<MapProps> = ({ location, checkInLocation, radius }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Array<google.maps.Marker | google.maps.Circle>>([]);
  const [isClient, setIsClient] = useState(false);
  
  // 確保組件只在客戶端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    // 確保我們在客戶端環境，並且有位置資訊和DOM元素
    if (!isClient || !location || !mapRef.current) return;
    
    // 確保 Google Maps API 已加載
    const loadGoogleMaps = () => {
      // 這裡我們已經確認了 mapRef.current 不為 null
      const mapElement = mapRef.current;
      
      // 初始化地圖 (僅初始化一次)
      if (!mapInstance.current && mapElement) {
        mapInstance.current = new window.google.maps.Map(mapElement, {
          center: { lat: location.lat, lng: location.lng },
          zoom: 15,
        });
      }
      
      // 清除舊的標記
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // 新增使用者標記
      const userMarker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstance.current,
        title: '打卡人',
      });
      
      // 新增使用者資訊視窗
      const userInfoWindow = new window.google.maps.InfoWindow({
        content: '打卡人'
      });
      
      userInfoWindow.open(mapInstance.current, userMarker);
      markersRef.current.push(userMarker);
      
      // 新增打卡地點和範圍圓圈
      if (checkInLocation) {
        const checkInMarker = new window.google.maps.Marker({
          position: { lat: checkInLocation.lat, lng: checkInLocation.lng },
          map: mapInstance.current,
          title: '打卡地點',
        });
        
        const checkInInfoWindow = new window.google.maps.InfoWindow({
          content: '打卡地點'
        });
        
        checkInInfoWindow.open(mapInstance.current, checkInMarker);
        markersRef.current.push(checkInMarker);
        
        // 繪製範圍圓圈
        const circle = new window.google.maps.Circle({
          strokeColor: '#0000FF',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#0000FF',
          fillOpacity: 0.3,
          map: mapInstance.current,
          center: checkInLocation,
          radius: radius,
        });
        
        markersRef.current.push(circle);
        
        // 設置地圖視圖以包含所有標記
        setTimeout(() => {
          if (mapInstance.current) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
            bounds.extend(new window.google.maps.LatLng(checkInLocation.lat, checkInLocation.lng));
            mapInstance.current.fitBounds(bounds);
            
            // 適當地調整縮放級別
            const currentZoom = mapInstance.current.getZoom();
            if (currentZoom !== undefined) {
              mapInstance.current.setZoom(currentZoom - 0.5);
            }
          }
        }, 300);
      }
    };
    
    // 檢查 Google Maps API 是否已載入
    if (window.google && window.google.maps) {
      loadGoogleMaps();
    } else {
      console.error('Google Maps API 未載入，請確保您已在HTML中引入Google Maps JavaScript API');
    }
    
    // 組件卸載時清理
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [isClient, location, checkInLocation, radius]);
  
  // 在服務器端渲染和客戶端初始化前顯示佔位符
  if (!isClient || !location) return <div>請先獲取位置</div>;
  
  return <div  ref={mapRef} style={{ height: 'calc(100vh - 339px)', width: '100%' , opacity:'80%'}}></div>;
};

export default Map;