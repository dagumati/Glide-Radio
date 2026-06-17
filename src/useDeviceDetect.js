import { useState, useEffect } from 'react';

export function useDeviceDetect() {
  const [device, setDevice] = useState({
    isTesla: false,
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: true,
    screenSize: { width: typeof window !== 'undefined' ? window.innerWidth : 1024, height: typeof window !== 'undefined' ? window.innerHeight : 768 }
  });

  useEffect(() => {
    const handleResize = () => {
      const ua = navigator.userAgent || '';
      const isTesla = /Tesla/i.test(ua);
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(ua);
      const isMobile = window.innerWidth < 768 || isIOS || isAndroid;
      const isDesktop = !isMobile && !isTesla;

      setDevice({
        isTesla,
        isMobile,
        isIOS,
        isAndroid,
        isDesktop,
        screenSize: { width: window.innerWidth, height: window.innerHeight }
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerHaptic = (duration = 10) => {
    if (device.isAndroid && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // ignore block by browser policy
      }
    }
  };

  return { ...device, triggerHaptic };
}
