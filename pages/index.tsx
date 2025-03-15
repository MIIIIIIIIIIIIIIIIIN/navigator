import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import styles from './index.module.css'
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(
  () => import('@/components/map'),  // 指向原始 Map 组件的路径
  { 
    ssr: false,  // 禁用服务器端渲染
    loading: () => <div>地图加载中...</div>  // 可选的加载状态
  }
);

// 假用戶資料
const users = [
  { id: 1, email: 'user@gmail.com', password: '123456' ,name: 'Liam'},
  {id: 2, email: 'work@gmail.com', password: '123456' ,name: 'workkai'}
];

const CHECKIN_RADIUS = 100; // 允許打卡範圍 (公尺)
const CHECKIN_LOCATION = { lat: 24.94503412597114, lng: 121.37714610027648 }; // 預設打卡地點

// 定義地點型別
interface Location {
  lat: number;
  lng: number;
}

interface User {
  id: number;
  email: string;
  password: string;
  name: string
}

interface CheckIn {
  id: number;
  userId: number;
  time: string;
  location: Location;
}

function Home() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
    }
    return null  
  });

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    if(typeof window !== 'undefined'){
      const savedCheckIns = localStorage.getItem('checkIns');
      return savedCheckIns ? JSON.parse(savedCheckIns) : [];
    }
   return []
  });

  const [error, setError] = useState<string>('');
  const [isWithinRange, setIsWithinRange] = useState<boolean | null>(null);

  // 計算距離
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 登入處理
  const handleLogin = () => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setError('');
    } else {
      setError('登入失敗，請檢查帳號或密碼');
    }
  };

  // 登出
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // 取得目前位置
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          const newLocation: Location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(newLocation);
          const distance = calculateDistance(newLocation.lat, newLocation.lng, CHECKIN_LOCATION.lat, CHECKIN_LOCATION.lng);
          setIsWithinRange(distance <= CHECKIN_RADIUS);
        },
        (err) => console.error('Error getting location:', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }
  }, []);

  // 進行打卡
  const handleCheckIn = () => {
    if (!user || !location) return;
    const newCheckIn: CheckIn = { 
      id: checkIns.length + 1, 
      userId: user.id, 
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'), 
      location 
    };
    const updatedCheckIns = [...checkIns, newCheckIn];
    setCheckIns(updatedCheckIns);
    localStorage.setItem('checkIns', JSON.stringify(updatedCheckIns));
    window.alert('打卡成功')
  };

  return (
    <div>
      {!user ? (
        <div className={styles.container}>
          <h2>登入</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button onClick={handleLogin}>登入</button>
        </div>
      ) : (
        <div className={styles.container}>
          <h2 className={styles.title}>歡迎 {user.name}</h2>
          
          <p>目前位置: {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : '未取得'}</p>
          <p>打卡地點: {CHECKIN_LOCATION.lat.toFixed(6)}, {CHECKIN_LOCATION.lng.toFixed(6)}</p>
          <p>允許範圍: {CHECKIN_RADIUS} 公尺</p>
          <DynamicMap location={location} checkInLocation={CHECKIN_LOCATION} radius={CHECKIN_RADIUS} />
    
          {isWithinRange !== null && (
            <p style={{ color: isWithinRange ? 'green' : 'red' }}>
              {isWithinRange ? '✅ 你在允許範圍內，可以打卡！' : '❌ 你超出範圍，無法打卡！'}
            </p>
          )}
          <button onClick={handleCheckIn} className={styles.container_checkBottom}  disabled={!isWithinRange}>打卡</button>
         
          <h3>打卡紀錄</h3>
          <ul>
            {checkIns.map((ci) => (
              <li key={ci.id}>{ci.time} - {ci.location.lat}, {ci.location.lng}</li>
            ))}
          </ul>
          <button onClick={handleLogout}>登出</button>
        </div>
      )}
    </div>
  );
}

export default Home;
