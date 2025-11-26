
import React, { useEffect, useRef } from 'react';

// Let TypeScript know that the global 'L' object from Leaflet exists.
declare const L: any;

interface MapBackgroundProps {
  onMapReady: (map: any) => void;
}

const MapBackground: React.FC<MapBackgroundProps> = ({ onMapReady }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // To hold the map instance and prevent re-initialization

  useEffect(() => {
    // This effect runs only once after the component mounts.
    
    // Ensure the map is not already initialized
    if (mapInstanceRef.current) return;

    if (mapContainerRef.current) {
      // Initialize the map with interactive options
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946], // Centered on Bangalore, Karnataka
        zoom: 13, // Zoomed in for a city-level view
        zoomControl: false, // Disable the default +/- zoom controls
        attributionControl: true, // It's good practice to keep attribution
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        tap: true,
        touchZoom: true,
      });

      // Use OpenStreetMap Standard tiles.
      // These contain rich color data for roads (orange/yellow), water (blue), and parks (green).
      // When inverted and hue-rotated, they transform into a stunning dark neon theme:
      // - Background (White) -> Black
      // - Water (Blue) -> Orange -> Blue (Electric Blue)
      // - Roads (Orange) -> Blue -> Yellow/Gold (Neon Gold)
      // - Parks (Green) -> Magenta -> Green (Neon Green)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        className: 'neon-map-tiles'
      }).addTo(mapInstanceRef.current);
      
      // Pass the map instance to the parent component
      onMapReady(mapInstanceRef.current);
    }
    
    // Cleanup function to properly remove the map instance when the component unmounts
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, [onMapReady]); // Dependency array includes onMapReady

  return (
    <>
      <style>{`
        /* 
           NEON MAP FILTER ALGORITHM
           1. invert(100%): Turns white land to black. Orange roads to Blue. Blue water to Orange.
           2. hue-rotate(180deg): Flips colors back. 
              - Orange Water (inverted blue) -> Blue.
              - Blue Roads (inverted orange) -> Gold/Yellow.
              - Magenta Parks (inverted green) -> Green.
           3. brightness(0.95): Keeps the background deep black.
           4. contrast(1.2): Increases pop.
           5. saturate(200%): Makes the neon colors vibrant.
        */
        .neon-map-tiles {
            filter: invert(100%) hue-rotate(180deg) brightness(0.95) contrast(1.2) saturate(200%);
            transition: filter 0.5s ease;
        }
        
        /* Ensure the background behind tiles is dark to prevent white flashing during load */
        .leaflet-container {
            background: #0b0f1a !important;
        }
      `}</style>
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 z-0" // The map container fills its parent and stays in the background
        id="map-background-container"
      />
    </>
  );
};

export default MapBackground;
