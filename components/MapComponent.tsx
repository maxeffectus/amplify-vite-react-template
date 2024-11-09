// src/components/MapComponent.tsx
import React, { useEffect, useState } from 'react';
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

// Default icon for objects
const defaultObjectIcon = new L.Icon({
  iconUrl: '/object-icon.svg',
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
});

// Alternate icon for objects (used when one is clicked)
const alternateObjectIcon = new L.Icon({
  iconUrl: '/object-icon-alternate.svg',
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
});

interface MapObject {
  id: number;
  position: [number, number];
  name: string;
  address: string;
  bikesAvailable: number;
}

const MapComponent: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [clickedObjectId, setClickedObjectId] = useState<number | null>(null);
  const [selectedObject, setSelectedObject] = useState<MapObject | null>(null); // Selected object for drawer

  // Define the objects on the map
  const objects: MapObject[] = [
    { id: 1, position: [44.810, 20.463], name: "8 Bikes Available", address: "A/B, Hercegovacka 14, Beograd", bikesAvailable: 8 },
    { id: 2, position: [44.815, 20.470], name: "5 Bikes Available", address: "C/D, Karađorđeva 10, Beograd", bikesAvailable: 5 },
    { id: 3, position: [44.820, 20.450], name: "2 Bikes Available", address: "E/F, Kralja Petra 6, Beograd", bikesAvailable: 2 },
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
  const handleIconClick = (obj: MapObject) => {
    if (clickedObjectId === obj.id) {
      // If the clicked object is already selected, hide the drawer
      setClickedObjectId(null);
      setSelectedObject(null);
    } else {
      // Otherwise, set the clicked object as selected and show the drawer
      setClickedObjectId(obj.id);
      setSelectedObject(obj);
    }
  };

  return (
    <div className="map-component">
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

        {/* Display markers for objects, changing icons based on clickedObjectId */}
        {objects.map((obj) => (
          <Marker
            key={obj.id}
            position={obj.position}
            icon={
              clickedObjectId === obj.id
                ? defaultObjectIcon
                : clickedObjectId !== null
                ? alternateObjectIcon
                : defaultObjectIcon
            }
            eventHandlers={{
              click: () => handleIconClick(obj),
            }}
          >
            <Popup>{obj.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Sliding drawer component */}
      {selectedObject && (
        <div className="drawer open">
          <div className="drawer-content">
            <h3>{selectedObject.bikesAvailable} Bikes Available</h3>
            <p>{selectedObject.address}</p>
            <button className="reserve-button">Reserve</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
