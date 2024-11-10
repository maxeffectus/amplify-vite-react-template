import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import L from 'leaflet';

const userIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const defaultObjectIcon = new L.Icon({
  iconUrl: '/object-icon.svg',
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
});

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
  const [selectedObject, setSelectedObject] = useState<MapObject | null>(null);
  const [isReserved, setIsReserved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reservationTimedOut, setReservationTimedOut] = useState(false);
  const [rideMessage, setRideMessage] = useState<string | null>(null);
  const [isQRScreenVisible, setIsQRScreenVisible] = useState(false); // Состояние для управления видимостью экрана QR

  const objects: MapObject[] = [
    { id: 1, position: [44.8125, 20.4633], name: "8 Bikes Available", address: "Hercegovačka 14, Stari Grad, Beograd", bikesAvailable: 8 },
    { id: 2, position: [44.8175, 20.4425], name: "5 Bikes Available", address: "Brankova 22, Stari Grad, Beograd", bikesAvailable: 5 },
    { id: 3, position: [44.8211, 20.4055], name: "2 Bikes Available", address: "Bulevar Mihajla Pupina 165, Novi Beograd, Beograd", bikesAvailable: 2 },
    { id: 4, position: [44.8235, 20.4092], name: "4 Bikes Available", address: "Jurija Gagarina 20, Novi Beograd, Beograd", bikesAvailable: 4 }
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

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && isReserved) {
      setIsReserved(false);
      setReservationTimedOut(true);
    }
  }, [timeLeft, isReserved]);

  const handleIconClick = (obj: MapObject) => {
    if (clickedObjectId === obj.id) {
      setClickedObjectId(null);
      setSelectedObject(null);
      setIsReserved(false);
      setTimeLeft(0);
      setReservationTimedOut(false);
      setRideMessage(null);
    } else {
      setClickedObjectId(obj.id);
      setSelectedObject(obj);
      setIsReserved(false);
      setTimeLeft(0);
      setReservationTimedOut(false);
      setRideMessage(null);
    }
  };

  const handleReserveClick = () => {
    setIsReserved(true);
    setTimeLeft(300);
    setReservationTimedOut(false);
  };

  const handleCancelClick = () => {
    setIsReserved(false);
    setTimeLeft(0);
    setReservationTimedOut(false);
    setRideMessage(null);
  };

  const handleGotItClick = () => {
    setClickedObjectId(null);
    setSelectedObject(null);
    setReservationTimedOut(false);
    setRideMessage(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleRentClick = () => {
    console.log("Rent button clicked!"); // Отладочный вывод
    setIsQRScreenVisible(true); // Показать экран QR по нажатию Rent
    console.log("QR Screen Visible:", isQRScreenVisible); // Проверка состояния
  };

  const handleCancelQR = () => {
    setIsQRScreenVisible(false); // Скрыть экран QR по нажатию Cancel
  };

  return (
    <div className="map-component">
      <MapContainer center={[44.8131, 20.4633]} zoom={13} className="map-container">
        <TileLayer
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

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
            {!isReserved && clickedObjectId !== obj.id && (
              <Popup>{obj.name}</Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      <div className={`drawer ${selectedObject ? 'open' : ''}`}>
        {selectedObject && (
          <div className="drawer-content">
            <div className="drawer-header">
              <h3 className="drawer-text">
                {rideMessage
                  ? rideMessage
                  : reservationTimedOut
                  ? "Reservation timed out"
                  : isReserved
                  ? `Booked for ${formatTime(timeLeft)}`
                  : `${selectedObject.bikesAvailable} Bikes Available`}
              </h3>
              <div className="icon-container">
                {isReserved && !reservationTimedOut && <div className="custom-icon"></div>}
                <div className="bike-icon"></div>
              </div>
            </div>
            <p>{selectedObject.address}</p>
            {reservationTimedOut ? (
              <button className="got-it-button" onClick={handleGotItClick}>Got It</button>
            ) : isReserved ? (
              <>
                <button className="rent-button" onClick={handleRentClick}>Rent</button>
                <button className="cancel-button" onClick={handleCancelClick}>Cancel</button>
              </>
            ) : (
              <button className="reserve-button" onClick={handleReserveClick}>Reserve</button>
            )}
          </div>
        )}
      </div>

      {/* Экран QR */}
      {isQRScreenVisible && (
          <div className="qr-screen">
            <img src="/bike_with_qr.png" alt="QR Code Screen" className="qr-image" />
            <div className="qr-buttons">
              <button className="scan-qr-button" onClick={() => console.log("Scanning QR...")}>Scan QR</button>
              <button className="cancel-button" onClick={handleCancelQR}>Cancel</button>
            </div>
          </div>
      )}
    </div>
  );
};

export default MapComponent;
