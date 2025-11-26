
import React, { useState, useEffect, useRef } from 'react';
import ReportIssuePanel from './ReportIssuePanel';
import MyReportsPanel from './MyReportsPanel';
import IssueDetailsPanel, { Issue } from './IssueDetailsPanel';
import AnalyticsPanel from './AnalyticsPanel';
import Feed from './Feed';
import Profile from './Profile';
import MapBackground from './MapBackground';
import HolographicDisplay from './HolographicDisplay';
import { auth, db } from './firebaseConfig';
import firebase from 'firebase/compat/app';

declare const L: any;

// SVG Icon components for clarity and reusability
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const FeedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h3m-3 7h3m-3 4h3" />
    </svg>
);

const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-8v8M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- PLACEHOLDER DATA ---
const STATIC_MOCKS: Issue[] = [
    {
        id: 'mock-1',
        title: 'Broken Street Light',
        category: 'Electricity',
        status: 'Open',
        description: 'Street light flickering constantly near the junction.',
        imageUrl: 'https://images.unsplash.com/photo-1542382156-9d8b7b7a1c2f?auto=format&fit=crop&q=80&w=400',
        location: 'Cubbon Park, Bangalore',
        date: '2023-11-15',
        coordinates: { lat: 12.9779, lng: 77.5952 },
        userId: 'system-mock',
        voteCount: 12,
        votedBy: []
    },
    {
        id: 'mock-2',
        title: 'Pothole on Main Rd',
        category: 'Road',
        status: 'Open',
        description: 'Large pothole causing traffic slowdowns.',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
        location: 'Indiranagar, Bangalore',
        date: '2023-11-18',
        coordinates: { lat: 12.9719, lng: 77.6412 },
        userId: 'system-mock',
        voteCount: 34,
        votedBy: []
    },
    {
        id: 'mock-3',
        title: 'Water Leakage',
        category: 'Water',
        status: 'In Progress',
        description: 'Pipe burst, water flowing on the street.',
        imageUrl: 'https://images.unsplash.com/photo-1585822765324-4284d72d6272?auto=format&fit=crop&q=80&w=400',
        location: 'Koramangala, Bangalore',
        date: '2023-11-10',
        coordinates: { lat: 12.9352, lng: 77.6245 },
        userId: 'system-mock',
        voteCount: 8,
        votedBy: []
    },
    {
        id: 'mock-4',
        title: 'Garbage Dump',
        category: 'Garbage',
        status: 'Resolved',
        description: 'Cleared garbage pile from the corner.',
        imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=400',
        location: 'Jayanagar, Bangalore',
        date: '2023-10-25',
        coordinates: { lat: 12.9250, lng: 77.5938 },
        userId: 'system-mock',
        voteCount: 56,
        votedBy: []
    },
    {
        id: 'mock-5',
        title: 'Fallen Tree Branch',
        category: 'Infrastructure',
        status: 'In Progress',
        description: 'Tree branch blocking the footpath.',
        imageUrl: 'https://images.unsplash.com/photo-1610307844086-6415758f888f?auto=format&fit=crop&q=80&w=400',
        location: 'Malleswaram, Bangalore',
        date: '2023-11-20',
        coordinates: { lat: 13.0031, lng: 77.5643 },
        userId: 'system-mock',
        voteCount: 15,
        votedBy: []
    }
];

// Helper to generate random points around Bangalore
const generateRandomMocks = (count: number): Issue[] => {
    const baseLat = 12.9716;
    const baseLng = 77.5946;
    const categories = ['Road', 'Garbage', 'Water', 'Electricity', 'Infrastructure', 'Other'];
    const statuses = ['Open', 'In Progress', 'Resolved'];
    
    return Array.from({ length: count }).map((_, i) => {
        // Generate random offset within ~10km
        const lat = baseLat + (Math.random() - 0.5) * 0.12;
        const lng = baseLng + (Math.random() - 0.5) * 0.12;
        const category = categories[Math.floor(Math.random() * categories.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        return {
            id: `mock-generated-${i}`,
            title: `${category} Anomaly #${Math.floor(Math.random() * 1000)}`,
            category: category,
            status: status,
            description: `Automated system report detected irregularity in ${category.toLowerCase()} sector. Priority assessment required.`,
            imageUrl: `https://picsum.photos/seed/${1000 + i}/400/300`,
            location: `Grid Sector ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 100)}`,
            date: '2023-11-22',
            coordinates: { lat, lng },
            userId: 'system-ai',
            voteCount: Math.floor(Math.random() * 200),
            votedBy: []
        };
    });
};

const MOCK_ISSUES: Issue[] = [...STATIC_MOCKS, ...generateRandomMocks(35)];

type ActiveView = 'dashboard' | 'feed' | 'profile';
type NotificationType = 'success' | 'error' | 'info';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isReportPanelOpen, setIsReportPanelOpen] = useState(false);
  const [isMyReportsPanelOpen, setIsMyReportsPanelOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isAnalyticsPanelOpen, setIsAnalyticsPanelOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [holographicIssue, setHolographicIssue] = useState<Issue | null>(null);
  const [map, setMap] = useState<any>(null);
  const [searchMarker, setSearchMarker] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: NotificationType } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  
  // Real-time data
  const [stats, setStats] = useState({ open: 0, resolved: 0 });
  const [firestoreIssues, setFirestoreIssues] = useState<Issue[]>([]);
  const markersClusterGroupRef = useRef<any>(null);

  // Auth and Stats Sync
  useEffect(() => {
    let unsubscribeReportsStats: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        // Real-time listener for user's report stats
        unsubscribeReportsStats = db.collection('reports')
          .where('userId', '==', user.uid)
          .onSnapshot((snapshot) => {
            let openCount = 0;
            let resolvedCount = 0;
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (data.status === 'Resolved') {
                resolvedCount++;
              } else {
                openCount++;
              }
            });
            setStats({ open: openCount, resolved: resolvedCount });
          }, (error) => {
            console.warn("Dashboard stats sync error (likely permissions):", error);
          });
      } else {
        setStats({ open: 0, resolved: 0 });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeReportsStats) unsubscribeReportsStats();
    };
  }, []);

  // Fetch all issues for the map
  useEffect(() => {
      const unsubscribe = db.collection('reports').onSnapshot(snapshot => {
          const issues = snapshot.docs.map(doc => {
              const data = doc.data();
              const dateObj = data.createdAt ? data.createdAt.toDate() : new Date();
              return {
                  id: doc.id,
                  title: data.title,
                  category: data.category,
                  status: data.status,
                  description: data.description,
                  imageUrl: data.imageUrl,
                  location: data.location,
                  date: dateObj.toISOString().split('T')[0],
                  coordinates: data.coordinates,
                  userId: data.userId,
                  voteCount: data.voteCount,
                  votedBy: data.votedBy
              } as Issue;
          });
          setFirestoreIssues(issues);
      }, (error) => {
          console.error("Error fetching map issues", error);
      });
      return () => unsubscribe();
  }, []);

  const handleReportClick = () => setIsReportPanelOpen(true);
  const handleMyReportsClick = () => setIsMyReportsPanelOpen(true);
  const handleAnalyticsClick = () => setIsAnalyticsPanelOpen(true);
  
  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailsPanelOpen(true);
  };
  
  const handleCloseDetails = () => setIsDetailsPanelOpen(false);

  const handleOverlayClick = () => {
    if (isReportPanelOpen) setIsReportPanelOpen(false);
    if (isMyReportsPanelOpen) setIsMyReportsPanelOpen(false);
    if (isDetailsPanelOpen) handleCloseDetails();
    if (isAnalyticsPanelOpen) setIsAnalyticsPanelOpen(false);
  };

  const isOverlayVisible = isReportPanelOpen || isMyReportsPanelOpen || isDetailsPanelOpen || isAnalyticsPanelOpen;

  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const futuristicIcon = L.divIcon({
    html: `<div class="relative flex items-center justify-center w-8 h-8">
             <div class="absolute w-full h-full bg-cyan-400 rounded-full animate-ping opacity-75"></div>
             <div class="relative w-4 h-4 bg-cyan-400 rounded-full border-2 border-white shadow-[0_0_15px_#00ffff]"></div>
           </div>`,
    className: 'futuristic-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const updateMapMarker = (latlng: [number, number], popupText: string) => {
    if (!map) return;
    if (searchMarker) {
      map.removeLayer(searchMarker);
    }
    const newMarker = L.marker(latlng, { icon: futuristicIcon })
      .addTo(map)
      .bindPopup(popupText, { className: 'holographic-popup' })
      .openPopup();
    setSearchMarker(newMarker);
    map.flyTo(latlng, 15);
  };

  const locateUser = () => {
    if (!map) {
        showNotification("Map is not ready yet.", 'info');
        return;
    }
    if (!navigator.geolocation) {
      showNotification("Geolocation is not supported by your browser.", 'error');
      return;
    }
    showNotification("Locating your position...", 'info');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMapMarker([latitude, longitude], '<b class="text-cyan-400 text-lg">You Are Here!</b>');
        showNotification("Location found!", 'success');
      },
      () => {
        showNotification("Unable to retrieve your location.", 'error');
      }
    );
  };

  const createStatusIcon = (status: string) => {
    let iconHtml = '';
    const baseClass = 'futuristic-marker';

    switch (status) {
        case 'Open': // Intense Red
            iconHtml = `<div class="relative flex items-center justify-center w-6 h-6">
                          <div class="absolute w-full h-full bg-[#ff0055] rounded-full animate-ping opacity-90"></div>
                          <div class="relative w-3 h-3 bg-[#ff0055] rounded-full border-2 border-white/80 shadow-[0_0_15px_#ff0055]"></div>
                        </div>`;
            break;
        case 'In Progress': // Intense Neon Gold/Yellow
            iconHtml = `<div class="relative flex items-center justify-center w-6 h-6">
                          <div class="absolute w-full h-full bg-[#ffd700] rounded-full animate-ping opacity-90"></div>
                          <div class="relative w-3 h-3 bg-[#ffd700] rounded-full border-2 border-white/80 shadow-[0_0_15px_#ffd700]"></div>
                        </div>`;
            break;
        case 'Resolved': // Intense Neon Green
        default:
            iconHtml = `<div class="relative flex items-center justify-center w-5 h-5">
                          <div class="w-full h-full bg-[#00ff41] rounded-full opacity-90 border-2 border-white/50 shadow-[0_0_10px_#00ff41]"></div>
                        </div>`;
            break;
    }

    return L.divIcon({
        html: iconHtml,
        className: baseClass,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
  };

  const createWhiteIcon = () => {
    return L.divIcon({
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                 <div class="absolute w-full h-full bg-white rounded-full animate-ping opacity-80"></div>
                 <div class="relative w-4 h-4 bg-white rounded-full border-2 border-black shadow-[0_0_20px_rgba(255,255,255,1)]"></div>
               </div>`,
        className: 'futuristic-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
  };

  // Sync Map with Firestore Issues & Mock Data
  useEffect(() => {
    if (map && L.markerClusterGroup) {
      const timer = setTimeout(locateUser, 1500);

      // Initialize cluster group if needed
      if (!markersClusterGroupRef.current) {
        markersClusterGroupRef.current = L.markerClusterGroup({
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: true,
            zoomToBoundsOnClick: true,
            // Custom Neon Cluster Styling
            iconCreateFunction: function(cluster: any) {
                const count = cluster.getChildCount();
                let c = ' neon-cluster-small';
                if (count >= 10 && count < 50) c = ' neon-cluster-medium';
                if (count >= 50) c = ' neon-cluster-large';

                return L.divIcon({ 
                    html: `<div class="cluster-inner"><span>${count}</span></div>`, 
                    className: 'marker-cluster' + c, 
                    iconSize: L.point(40, 40) 
                });
            }
        });
        map.addLayer(markersClusterGroupRef.current);
      } else {
        markersClusterGroupRef.current.clearLayers();
      }

      // Combine Real Data with Mock Data
      const allIssues = [...firestoreIssues, ...MOCK_ISSUES];

      const markersToAdd: any[] = [];

      allIssues.forEach(issue => {
          if (issue.coordinates && issue.coordinates.lat && issue.coordinates.lng) {
             const isMyReport = currentUser && issue.userId === currentUser.uid;
             const icon = isMyReport ? createWhiteIcon() : createStatusIcon(issue.status);
             
             const marker = L.marker([issue.coordinates.lat, issue.coordinates.lng], { icon });
             
             const popupContent = `
                  <div class="text-white bg-transparent">
                      <strong class="${isMyReport ? 'text-white' : 'text-cyan-400'}">${issue.title}</strong>
                      <p>Status: ${issue.status}</p>
                      ${isMyReport ? '<p class="text-xs text-white italic mt-1">Your Report</p>' : ''}
                      <button class="view-details-btn mt-2 w-full text-center py-1 px-2 bg-cyan-500/20 border border-cyan-400 rounded-md text-cyan-400 font-semibold uppercase tracking-wider text-xs hover:bg-cyan-400 hover:text-black transition-all" data-issue-id="${issue.id}">
                          View Details
                      </button>
                  </div>
              `;
              marker.bindPopup(popupContent, { className: 'holographic-popup' });
              markersToAdd.push(marker);
          }
      });
      
      markersClusterGroupRef.current.addLayers(markersToAdd);

      const onPopupOpen = (e: any) => {
          const button = e.popup._contentNode.querySelector('.view-details-btn');
          if (button) {
              button.onclick = () => {
                  const issueId = button.getAttribute('data-issue-id');
                  // Search in both arrays
                  const fullIssue = [...firestoreIssues, ...MOCK_ISSUES].find(iss => iss.id === issueId);
                  if (fullIssue) {
                      setHolographicIssue(fullIssue);
                      map.closePopup();
                  }
              };
          }
      };

      map.on('popupopen', onPopupOpen);

      return () => {
          clearTimeout(timer);
          map.off('popupopen', onPopupOpen);
      };
    }
  }, [map, firestoreIssues, currentUser]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!map) {
        showNotification("Map is not ready yet.", 'info');
        return;
    }
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('search-query') as string;
    if (!query) return;

    setIsSearching(true);
    showNotification(`Searching for "${query}"...`, 'info');
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        updateMapMarker([parseFloat(lat), parseFloat(lon)], `<b class="text-cyan-400">${display_name}</b>`);
        showNotification("Location found!", 'success');
      } else {
        showNotification(`Could not find "${query}".`, 'error');
      }
    } catch (error) {
      showNotification("An error occurred during search.", 'error');
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
        case 'success': return 'bg-green-500/20 border-green-400 text-green-300 shadow-[0_0_15px_rgba(74,222,128,0.4)]';
        case 'error': return 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_15px_rgba(248,113,113,0.4)]';
        case 'info': return 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]';
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full bg-[#0b0f1a] font-sans"
    >
      <MapBackground onMapReady={setMap} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes slideUpFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1.5s ease-in-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .card-animation { animation: slideUpFadeIn 1s ease-out 0.5s forwards; opacity: 0; }
        .futuristic-marker { background-color: transparent !important; border: none !important; }
        .holographic-popup .leaflet-popup-content-wrapper {
            background: rgba(11, 15, 26, 0.85);
            backdrop-filter: blur(5px);
            color: #fff;
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
        }
        .holographic-popup .leaflet-popup-tip-container {
            display: none;
        }
        .holographic-popup .leaflet-popup-content {
            margin: 12px;
            font-family: 'Orbitron', sans-serif;
        }
        .holographic-popup .leaflet-popup-close-button {
            color: #00ffff !important;
            padding: 8px 8px 0 0 !important;
        }
        
        /* --- CLUSTER STYLES --- */
        .marker-cluster {
            background: transparent;
        }
        .marker-cluster div {
            width: 44px; /* Increased Size */
            height: 44px; /* Increased Size */
            margin-left: 0px;
            margin-top: 0px;
            text-align: center;
            border-radius: 50%;
            font-family: 'Orbitron', sans-serif;
            font-weight: 900; /* Bold text */
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
            transition: all 0.3s ease-in-out;
        }
        /* Small Cluster (<10): Bright Cyan */
        .neon-cluster-small div {
            background-color: rgba(0, 255, 255, 0.3);
            border: 2px solid rgba(0, 255, 255, 0.9);
            color: #ffffff;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.6), inset 0 0 10px rgba(0, 255, 255, 0.4);
            text-shadow: 0 0 5px #00ffff;
        }
        /* Medium Cluster (10-50): Intense Violet */
        .neon-cluster-medium div {
            background-color: rgba(139, 92, 246, 0.4);
            border: 2px solid rgba(139, 92, 246, 0.9);
            color: #ffffff;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.7), inset 0 0 10px rgba(139, 92, 246, 0.5);
            text-shadow: 0 0 5px #a78bfa;
            animation: pulse-violet 2s infinite;
        }
        /* Large Cluster (>50): Hot Pink / Red */
        .neon-cluster-large div {
            background-color: rgba(255, 0, 85, 0.5);
            border: 2px solid rgba(255, 0, 85, 1);
            color: #ffffff;
            box-shadow: 0 0 30px rgba(255, 0, 85, 0.8), inset 0 0 15px rgba(255, 0, 85, 0.6);
            text-shadow: 0 0 5px #ff0055;
            animation: pulse-red 1.5s infinite;
        }

        @keyframes pulse-violet {
            0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(255, 0, 85, 0.8); transform: scale(1); }
            50% { transform: scale(1.1); }
            70% { box-shadow: 0 0 0 20px rgba(255, 0, 85, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 0, 85, 0); transform: scale(1); }
        }
      `}</style>

      {/* Holographic Display */}
      {holographicIssue && (
        <HolographicDisplay 
          issue={holographicIssue} 
          onClose={() => setHolographicIssue(null)} 
        />
      )}

      {/* Notification Toast */}
      {notification && (
          <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] p-4 rounded-lg border transition-all duration-300 ease-in-out ${getNotificationStyles(notification.type)}`} role="alert">
              {notification.message}
          </div>
      )}

      {/* Panel and Dimming Overlay */}
      {isOverlayVisible && (
        <div 
            className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-500 animate-fadeIn"
            onClick={handleOverlayClick}
            aria-hidden="true"
        ></div>
      )}
      <ReportIssuePanel isOpen={isReportPanelOpen} onClose={() => setIsReportPanelOpen(false)} />
      <MyReportsPanel isOpen={isMyReportsPanelOpen} onClose={() => setIsMyReportsPanelOpen(false)} onViewDetails={handleViewDetails} />
      <IssueDetailsPanel isOpen={isDetailsPanelOpen} onClose={handleCloseDetails} issue={selectedIssue} />
      <AnalyticsPanel isOpen={isAnalyticsPanelOpen} onClose={() => setIsAnalyticsPanelOpen(false)} />

      <div className="absolute inset-0 bg-black/30 animate-fadeIn pointer-events-none"></div>
      
      <div className="relative min-h-screen p-4 lg:p-8 overflow-hidden pointer-events-none">
        
        {activeView === 'dashboard' && (
          <>
            {/* Left Card: Report Issue */}
            <div className="relative lg:absolute lg:top-8 lg:left-8 z-10 mb-6 lg:mb-0 card-animation w-full max-w-sm lg:w-1/3 p-6 bg-black/20 backdrop-blur-md rounded-lg border border-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] animate-float pointer-events-auto" style={{ animationDelay: '0.8s' }}>
                <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wider" style={{ textShadow: '0 0 4px #00ffff' }}>
                System Alert: Report Anomaly
                </h2>
                <p className="text-violet-300 mt-2 text-sm">
                Identify and report non-compliant urban activities or infrastructure failures. Your input maintains system integrity.
                </p>
                <button 
                onClick={handleReportClick}
                className="group mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 bg-cyan-500/10 border-2 border-cyan-400 rounded-lg text-cyan-400 font-bold uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all duration-300"
                >
                <PlusCircleIcon />
                Initiate Report
                </button>
            </div>

            {/* Right Card: My Reports */}
            <button 
                onClick={handleMyReportsClick}
                className="text-left relative lg:absolute lg:top-8 lg:right-8 z-10 card-animation w-full max-w-sm lg:w-1/3 p-6 bg-black/20 backdrop-blur-md rounded-lg border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)] animate-float hover:border-violet-400/80 hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-300 pointer-events-auto" 
                style={{ animationDelay: '1s' }}
            >
                <h2 className="text-xl font-bold text-violet-400 uppercase tracking-wider" style={{ textShadow: '0 0 4px #8b5cf6' }}>
                My Reports
                </h2>
                <div className="mt-4 flex justify-around text-center">
                <div>
                    <p className="text-4xl lg:text-5xl font-black text-white">{stats.open}</p>
                    <p className="text-violet-300 text-sm uppercase tracking-wider">Open Cases</p>
                </div>
                <div>
                    <p className="text-4xl lg:text-5xl font-black text-white">{stats.resolved}</p>
                    <p className="text-violet-300 text-sm uppercase tracking-wider">Resolved</p>
                </div>
                </div>
            </button>
          </>
        )}
        
        {activeView === 'feed' && <Feed onViewDetails={handleViewDetails} />}
        {activeView === 'profile' && <Profile />}
        
        {/* Bottom Navigation */}
        <footer className="absolute bottom-5 left-0 right-0 flex justify-center z-20 card-animation pointer-events-auto">
            {isSearchOpen ? (
                <form
                    onSubmit={(e) => {
                        handleSearch(e);
                        (e.target as HTMLFormElement).reset();
                        setIsSearchOpen(false); // Close search after submitting
                    }}
                    className="flex items-center gap-2 bg-black/30 backdrop-blur-lg px-2 py-2 w-[calc(100%-2rem)] max-w-lg rounded-full border border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-300"
                >
                    <input
                        type="text"
                        name="search-query"
                        placeholder="Search for a location..."
                        className="flex-grow bg-transparent text-white placeholder-violet-300/50 px-4 py-2 outline-none border-none"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="p-3 bg-cyan-600 rounded-full text-white shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:bg-cyan-500 transition-colors duration-300 disabled:bg-cyan-800 disabled:cursor-not-allowed"
                        aria-label="Search location"
                    >
                        {isSearching ? <SpinnerIcon /> : <SearchIcon />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-3 rounded-full text-violet-300 hover:bg-violet-500/20 hover:text-white transition-colors duration-300"
                        aria-label="Close search"
                    >
                        <CloseIcon />
                    </button>
                </form>
            ) : (
                <div className="flex items-center gap-2 sm:gap-4 bg-black/30 backdrop-blur-lg px-4 sm:px-6 py-3 rounded-full border border-violet-500/20">
                    <button onClick={() => setActiveView('dashboard')} className={`p-3 rounded-full transition-colors duration-300 ${activeView === 'dashboard' ? 'bg-violet-500/30 text-white' : 'text-violet-300 hover:bg-violet-500/20 hover:text-white'}`} aria-label="Dashboard"><DashboardIcon /></button>
                    <button onClick={() => setActiveView('feed')} className={`p-3 rounded-full transition-colors duration-300 ${activeView === 'feed' ? 'bg-violet-500/30 text-white' : 'text-violet-300 hover:bg-violet-500/20 hover:text-white'}`} aria-label="Feed"><FeedIcon /></button>
                    <button onClick={handleAnalyticsClick} className="p-3 rounded-full text-violet-300 hover:bg-violet-500/20 hover:text-white transition-colors duration-300" aria-label="Analytics"><AnalyticsIcon /></button>
                    <button onClick={handleReportClick} className="p-4 rounded-full bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:bg-violet-500 transition-colors duration-300" aria-label="Add Report"><PlusIcon /></button>
                    <button onClick={() => setIsSearchOpen(true)} className="p-3 rounded-full text-violet-300 hover:bg-violet-500/20 hover:text-white transition-colors duration-300" aria-label="Search"><SearchIcon /></button>
                    <button onClick={() => setActiveView('profile')} className={`p-3 rounded-full transition-colors duration-300 ${activeView === 'profile' ? 'bg-violet-500/30 text-white' : 'text-violet-300 hover:bg-violet-500/20 hover:text-white'}`} aria-label="Profile"><UserIcon /></button>
                </div>
            )}
        </footer>
        
        <p className="absolute bottom-5 left-5 text-violet-400/40 text-xs uppercase tracking-widest z-0 card-animation pointer-events-none" style={{ animationDelay: '1.2s' }}>
          Monitoring Urban Activity Nodes
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
