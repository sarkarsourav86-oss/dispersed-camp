import { useEffect } from 'react';
import { useLocationStore } from '../store';

export function useGeolocation() {
  const setLocation = useLocationStore((s) => s.setLocation);
  const setError = useLocationStore((s) => s.setError);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    let watchId: number;

    const start = (highAccuracy: boolean) => {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        (err) => {
          if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
            setError('Location access denied. Please enable location permissions to find nearby camping spots.');
          } else if (err.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
            setError('Location unavailable. Try enabling GPS or checking your connection.');
            // Fallback: IP geolocation
            fetch('https://ipapi.co/json/')
              .then((r) => r.json())
              .then((d) => {
                if (d.latitude && d.longitude) setLocation(d.latitude, d.longitude, 50000);
              })
              .catch(() => {});
          } else if (err.code === GeolocationPositionError.TIMEOUT && highAccuracy) {
            // Retry with low accuracy
            navigator.geolocation.clearWatch(watchId);
            start(false);
          } else {
            setError('Could not determine your location.');
          }
        },
        { enableHighAccuracy: highAccuracy, timeout: 10000, maximumAge: 30000 }
      );
    };

    start(true);
    return () => navigator.geolocation.clearWatch(watchId);
  }, [setLocation, setError]);
}
