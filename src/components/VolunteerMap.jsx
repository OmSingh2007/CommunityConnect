import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust this path if your firebase.js is in a different folder

// Custom Glowing Icon
const volunteerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #2dd4bf; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px #2dd4bf;" class="animate-pulse"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export default function VolunteerMap({ interactive = true }) {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    // 1. Point to your specific NGO ID
    const currentNgoId = "mumbai_relief_02"; 
    const q = query(collection(db, "volunteers"), where("ngoId", "==", currentNgoId));

    // 2. Listen for active volunteers with coordinates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(v => v.lat && v.lng && v.status === "Available");
      setVolunteers(activeData);
    });

    return () => unsubscribe();
  }, []);

  return (
    // z-0 ensures the map doesn't overlap your React modals!
    <MapContainer
      center={[19.0760, 72.8777]} // Mumbai coordinates
      zoom={11}
      zoomControl={interactive}
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      className="w-full h-full z-0"
    >
      {/* Dark Theme Base Map */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />
      
      {volunteers.map((vol) => (
        <Marker key={vol.id} position={[vol.lat, vol.lng]} icon={volunteerIcon}>
          {interactive && (
            <Popup>
              <div className="p-1 min-w-[100px]">
                <p className="font-bold text-slate-800 text-sm m-0">{vol.name}</p>
                <p className="text-xs text-slate-500 m-0">{vol.role}</p>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}