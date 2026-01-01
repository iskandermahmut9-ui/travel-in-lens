import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { myTrips } from './tripsData';
import 'leaflet/dist/leaflet.css';

// Иконка
const customIcon = new Icon({
  iconUrl: '/logo.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

// Контроллер управления (включает/выключает карту)
function MapController({ isActive }) {
  const map = useMap();

  useEffect(() => {
    if (isActive) {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if (map.tap) map.tap.enable();
    } else {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) map.tap.disable();
    }
  }, [map, isActive]);

  return null;
}

function TravelMap() {
  const [isMapActive, setIsMapActive] = useState(false);
  const bounds = [[-90, -180], [90, 180]];

  return (
    <div className="map-wrapper" style={{ position: 'relative', height: '100%', width: '100%', background: '#aad3df' }}>
      
      {/* ВУАЛЬ (Кнопка активации) */}
      {!isMapActive && (
        <div 
          onClick={() => setIsMapActive(true)}
          style={{
            position: 'absolute',
            zIndex: 1000,
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <button style={{
            padding: '12px 24px',
            fontSize: '16px', fontWeight: 'bold',
            color: 'white', backgroundColor: '#FF5722',
            border: 'none', borderRadius: '30px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            cursor: 'pointer'
          }}>
            👆 Нажмите, чтобы активировать карту
          </button>
        </div>
      )}

      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        minZoom={2} 
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        zoomControl={false} 
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false} // Убирает надписи в углу
        style={{ height: '100%', width: '100%', background: 'transparent' }}
      >
        <MapController isActive={isMapActive} />

        <TileLayer
          noWrap={true}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {myTrips.map((trip) => (
          <Marker key={trip.id} position={trip.coords} icon={customIcon}>
            <Popup minWidth={200}>
              <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                <img src={trip.img} alt={trip.city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{trip.city}</h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', lineHeight: '1.4' }}>{trip.description}</p>
              <a 
                href={trip.videoLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'block', backgroundColor: '#FF5722', color: 'white',
                  textAlign: 'center', padding: '8px', borderRadius: '6px',
                  textDecoration: 'none', fontWeight: 'bold', fontSize: '12px'
                }}
              >
                ▶ Смотреть видео
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default TravelMap;