import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; 

// Glowing Red Icon for Emergencies
const incidentIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #f43f5e; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 20px #f43f5e;" class="animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function IncidentMap() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const currentNgoId = "mumbai_relief_02"; 
    const q = query(collection(db, "surveys"), where("ngoId", "==", currentNgoId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        // Only show items that are NOT resolved, and actually have GPS coordinates
        .filter(s => s.status !== "Resolved" && s.lat && s.lng); 
      setIncidents(activeData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <MapContainer
      center={[19.0760, 72.8777]} // Mumbai
      zoom={11}
      className="w-full h-full rounded-2xl z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />
      
      {incidents.map((incident) => (
        <Marker key={incident.id} position={[incident.lat, incident.lng]} icon={incidentIcon}>
          <Popup>
            <div className="p-1 min-w-[120px]">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${incident.urgency === 'Critical' ? 'bg-rose-500' : 'bg-orange-500'}`}>
                {incident.urgency}
              </span>
              <p className="font-bold text-stone-800 text-sm mt-1 mb-0">{incident.category}</p>
              <p className="text-xs text-stone-500 m-0 truncate">{incident.summary}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}