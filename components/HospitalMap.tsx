import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Star } from 'lucide-react';
import { findNearbyMedicalFacilities } from '../services/geminiService';

const HospitalMap: React.FC = () => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.error("Geo error", err)
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const text = await findNearbyMedicalFacilities(location.lat, location.lng);
      setResults(text);
    } catch (e) {
      setResults("Failed to load map data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
           <div>
             <h2 className="text-2xl font-bold text-white">Emergency Finder</h2>
             <p className="text-slate-400">Locate nearest hospitals using Google Maps Grounding</p>
           </div>
           <div className="p-3 bg-red-900/20 rounded-full">
             <MapPin className="text-red-500" size={24} />
           </div>
        </div>

        {!location ? (
           <div className="text-center py-10 text-slate-500">
             Requesting location access...
           </div>
        ) : (
          <div className="space-y-6">
            {!results && !loading && (
               <button 
                onClick={handleSearch}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-2"
               >
                 <Navigation size={18} /> Find Nearby Hospitals
               </button>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                 <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {results && (
              <div className="prose prose-invert max-w-none">
                 <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap">
                    {/* Raw text output from Maps Grounding is typically Markdown */}
                    {results}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalMap;
