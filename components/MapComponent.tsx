import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import L, { LatLngExpression } from 'leaflet';

const userIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const objectIcon = new L.Icon({
  iconUrl: '/bike-icon.png',
  iconSize: [30, 30],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
});

interface ObjectData {
  id: number;
  position: LatLngExpression;
  name: string;
}

const MapComponent: React.FC = () => {
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);

  const objects: ObjectData[] = [
    { id: 1, position: [44.810, 20.463], name: "1" },
    { id: 2, position: [44.815, 20.470], name: "2" },
    { id: 3, position: [44.820, 20.450], name: "8" },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.log('Geolocation permission denied or unavailable');
        }
      );
    }
  }, []);

  return (
    <MapContainer center={[44.815, 20.463]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {objects.map((obj) => (
        <Marker key={obj.id} position={obj.position} icon={objectIcon}>
          <Popup>{obj.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
