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
  const [isQRScreenVisible, setIsQRScreenVisible] = useState(false);
  const [isRateInfoVisible, setIsRateInfoVisible] = useState(false); // Флаг для отображения тарифов
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Состояние для таймера
  const [reservationTimedOut, setReservationTimedOut] = useState(false); // Флаг для завершения таймера

  const TIMER_DURATION = 5 * 60; // Таймер на 5 минут в секундах

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

  // Запуск таймера при резервировании
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime && prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setReservationTimedOut(true); // Тайм-аут завершен
    }
  }, [timeLeft]);

  const handleReserveClick = () => {
    setTimeLeft(TIMER_DURATION); // Запуск таймера на 5 минут
    setReservationTimedOut(false);
  };

  const handleRentClick = () => {
    setIsQRScreenVisible(true); // Показать экран QR
    setIsRateInfoVisible(false); // Скрыть тарифы, если они были отображены
  };

  const handleShowRates = () => {
    setIsQRScreenVisible(false); // Закрыть экран QR
    setIsRateInfoVisible(true); // Показать информацию о тарифах
  };

  const handleCancel = () => {
    // Логика для отмены и возврата на предыдущий шаг
    setIsRateInfoVisible(false);
    setIsQRScreenVisible(false);
    setSelectedObject(null); // Сбросить выбранный объект
    setTimeLeft(null); // Сбросить таймер
    setReservationTimedOut(false);
  };

  const handleIconClick = (obj: MapObject) => {
    if (!isRateInfoVisible && !reservationTimedOut) {
      // Запрет выбора других объектов при показе тарифов или тайм-ауте
      setClickedObjectId(obj.id);
      setSelectedObject(obj);
    }
  };

  // Форматирование оставшегося времени
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
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
            <Popup>{obj.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Шторка с информацией об объекте и кнопкой Reserve */}
      {!isRateInfoVisible && (
        <div className={`drawer ${selectedObject ? 'open' : ''}`}>
          {selectedObject && (
            <div className="drawer-content">
              <div className="drawer-header">
                <h3 className="dialog-title">#{selectedObject.id}</h3>
                <img src="/bike-icon.svg" alt="Bike Icon" className="bike-icon-large" />
              </div>
              <p>{selectedObject.address}</p>

              {timeLeft === null && !reservationTimedOut ? (
                // Шаг 1: Кнопка для резервирования
                <>
                  <button className="reserve-button" onClick={handleReserveClick}>Reserve</button>
                  <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                </>
              ) : reservationTimedOut ? (
                // Тайм-аут резервирования
                <>
                  <h3>Reservation timed out</h3>
                  <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                </>
              ) : (
                // Таймер и кнопка Rent
                <>
                  <h3>Booked for {formatTime(timeLeft)}</h3>
                  <button className="rent-button" onClick={handleRentClick}>Rent</button>
                  <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Экран QR */}
      {isQRScreenVisible && (
        <div className="qr-screen">
          <img src="/bike_with_qr.png" alt="QR Code Screen" className="qr-image" />
          <div className="qr-buttons">
            <button className="scan-qr-button" onClick={handleShowRates}>Rent</button>
            <button className="cancel-button" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Информация о тарифах */}
      {isRateInfoVisible && (
        <div className="rate-dialog">
          <h3>Select Rate</h3>
          <div className="rate-options">
            <div className="rate-option selected">
              <span>Pay per minute</span>
              <span>$0.05 ≈ 0.0097 TON</span>
            </div>
            <div className="rate-option">
              <span>Pay per hour</span>
              <span>$1.00 ≈ 0.1951 TON</span>
            </div>
            <div className="rate-option">
              <span>Pay per day</span>
              <span>$10 ≈ 1.9515 TON</span>
            </div>
          </div>
          <button className="cancel-button" onClick={handleCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
