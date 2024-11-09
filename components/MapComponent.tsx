// src/components/MapComponent.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Default icon for objects
const defaultObjectIcon = new L.Icon({
  iconUrl: '/object-icon.svg', // Path to the default SVG icon in public
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
});

// Alternate icon for objects (used when one is clicked)
const alternateObjectIcon = new L.Icon({
  iconUrl: '/object-icon-alternate.svg', // Path to the alternate SVG icon in public
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
});

interface MapObject {
  id: number;
  position: [number, number];
  name: string;
}

// Component to center the map on the user's location
const MapCenter: React.FC<{ userLocation: [number, number] }> = ({ userLocation }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(userLocation, map.getZoom());
  }, [userLocation, map]);

  return null;
};

const MapComponent: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [clickedObjectId, setClickedObjectId] = useState<number | null>(null); // Track the clicked object ID

  // Define the objects on the map
  const objects: MapObject[] = [
    { id: 1, position: [44.810, 20.463], name: "Object 1" },
    { id: 2, position: [44.815, 20.470], name: "Object 2" },
    { id: 3, position: [44.820, 20.450], name: "Object 3" },
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

  // Function to handle click on an object icon
  const handleIconClick = (id: number) => {
    // If the clicked object is already selected, reset all icons to default
    if (clickedObjectId === id) {
      setClickedObjectId(null); // Reset selected object
    } else {
      // Otherwise, set the clicked object as selected
      setClickedObjectId(id);
    }
  };

  return (
    <MapContainer center={[44.787197, 20.457273]} zoom={13} className="map-container">
      <TileLayer
        url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Center the map on the user's location when available */}
      {userLocation && <MapCenter userLocation={userLocation} />}

      {/* Display the user's location if available */}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Display markers for objects, changing icons based on clickedObjectId */}
      {objects.map((obj) => (
        <Marker
          key={obj.id}
          position={obj.position}
          icon={
            // If this is the clicked object, use the default icon; otherwise, use alternate icon if another object is selected
            clickedObjectId === obj.id
              ? defaultObjectIcon
              : clickedObjectId !== null
              ? alternateObjectIcon
              : defaultObjectIcon
          }
          eventHandlers={{
            click: () => handleIconClick(obj.id), // Change icons when one of them is clicked
          }}
        >
          <Popup>{obj.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
