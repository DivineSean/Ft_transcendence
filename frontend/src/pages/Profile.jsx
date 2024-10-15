import ProfileDesktop from "../components/DesktopProfile/ProfileDesktop";
import ProfileTablet from "../components/TabletProfile/ProfileTablet";
import React, { useState, useEffect } from 'react';

function useDeviceType() {
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const userAgent = navigator.userAgent;

    if (/Mobi|Android/i.test(userAgent)) {
      setDeviceType('mobile');
    } else if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent) || 
               (window.innerWidth >= 768 && window.innerWidth <= 1024)) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  return deviceType;
}

const Profile = () => {
    const deviceType = useDeviceType();
    if (deviceType === 'tablet')
        return (<ProfileTablet></ProfileTablet>);
    if (deviceType === 'mobile')
        return (<div>mobile</div>);
    return (<ProfileDesktop></ProfileDesktop>)
}

export default Profile;
