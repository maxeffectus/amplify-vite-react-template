// src/MapComponent.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import L from 'leaflet';

// Create a blue icon for the user's current location
const userIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Create a yellow icon for objects
const objectIcon = new L.Icon({
  iconUrl: '/bike-icon.png', // Yellow icon
  iconSize: [30, 30],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
});

const MapComponent = () => {
  const [userLocation, setUserLocation] = useState(null);

  // Define three objects with their coordinates
  const objects = [
    { id: 1, position: [44.810, 20.463], name: "1" },
    { id: 2, position: [44.815, 20.470], name: "2" },
    { id: 3, position: [44.820, 20.450], name: "8" },
  ];

  useEffect(() => {
    // Get the user's current coordinates
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
    <MapContainer center={[44.787197, 20.457273]} zoom={13} className="map-container">
      <TileLayer
        url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Display the user's location if available */}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Display yellow markers for objects */}
      {objects.map((obj) => (
        <Marker key={obj.id} position={obj.position} icon={objectIcon}>
          <Popup>{obj.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
