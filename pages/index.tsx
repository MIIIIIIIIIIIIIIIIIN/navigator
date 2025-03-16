import { useState, useEffect } from "react";
import dayjs from "dayjs";
import styles from "./index.module.css";
import dynamic from "next/dynamic";
import { CiMenuBurger } from "react-icons/ci";
import Action from "@/components/action";
import Documental from "@/components/documental";

const DynamicMap = dynamic(
  () => import("@/components/map"), // 指向原始 Map 组件的路径
  {
    ssr: false, // 禁用服务器端渲染
    loading: () => <div>地图加载中...</div>, // 可选的加载状态
  }
);

// 假用戶資料
const users = [
  { id: 1, email: "user@gmail.com", password: "123456", name: "Liam" },
  { id: 2, email: "work@gmail.com", password: "123456", name: "workkai" },
];

const CHECKIN_RADIUS = 100; // 允許打卡範圍 (公尺)
const CHECKIN_LOCATION = { lat: 24.998527, lng: 121.457033 }; // 預設打卡地點

// 定義地點型別
interface Location {
  lat: number;
  lng: number;
}

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
}

interface CheckIn {
  id: number;
  userId: number;
  time: string;
  location: Location;
}

function Home() {
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [location, setLocation] = useState<Location | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [error, setError] = useState<string>("");
  const [isWithinRange, setIsWithinRange] = useState<boolean | null>(null);
  const [time, setTime] = useState<string>("");
  const [isMenu, setIsMenu] = useState<boolean>(false);
  const [show, setShow] = useState<string>('home')

  // 標記首次客戶端渲染完成
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => {
      setTime(dayjs(new Date()).format("hh:mm:ss"));
    }, 1000);

    return () => {
      clearInterval(clock);
    };
  }, []);

  // 從 localStorage 加載用戶和打卡記錄
  useEffect(() => {
    if (isClient) {
      // 只在客戶端加載本地存儲的數據
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const savedCheckIns = localStorage.getItem("checkIns");
      if (savedCheckIns) {
        setCheckIns(JSON.parse(savedCheckIns));
      }
    }
  }, [isClient]);

  // 計算距離
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 登入處理
  const handleLogin = () => {
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
      setError("");
    } else {
      setError("登入失敗，請檢查帳號或密碼");
    }
  };

  // 登出
  // const handleLogout = () => {
  //   setUser(null);
  //   localStorage.removeItem("user");
  // };

  // 取得目前位置
  useEffect(() => {
    if (isClient && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLocation: Location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(newLocation);
          const distance = calculateDistance(
            newLocation.lat,
            newLocation.lng,
            CHECKIN_LOCATION.lat,
            CHECKIN_LOCATION.lng
          );
          setIsWithinRange(distance <= CHECKIN_RADIUS);
        },
        (err) => console.error("Error getting location:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }
  }, [isClient]);

  // 進行打卡
  const handleCheckIn = () => {
    if (!user || !location) return;
    const newCheckIn: CheckIn = {
      id: checkIns.length + 1,
      userId: user.id,
      time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      location,
    };
    const updatedCheckIns = [...checkIns, newCheckIn];
    setCheckIns(updatedCheckIns);
    localStorage.setItem("checkIns", JSON.stringify(updatedCheckIns));
    window.alert("打卡成功");
  };




  const handleReloadPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLocation: Location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(newLocation);
        const distance = calculateDistance(
          newLocation.lat,
          newLocation.lng,
          CHECKIN_LOCATION.lat,
          CHECKIN_LOCATION.lng
        );
        setIsWithinRange(distance <= CHECKIN_RADIUS);
      },
      (err) => console.error("Error getting location:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
  };



  const handleMenuToggle = () => {
    setIsMenu(!isMenu)
  } 

  const handleDocumental = (value:string) => {
    setShow(value)
    setIsMenu(!isMenu)
  }

  // 登入介面的渲染
  const renderLoginForm = () => (
    <div className={styles.loginContainer}>
      <div className={styles.loginInput}>
        <h2 className={styles.loginLogo}>XXX</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={styles.input}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={styles.input}
        />
        <button onClick={handleLogin} 
          className={styles.loginBotton}
        >登入 SignIn</button>
        </div>
    </div>
  );

  // 已登入用戶介面的渲染
  const renderUserDashboard = () => (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.userStatus}></div>
          <div className={styles.imgOutline}>
            {/* <img src="" /> */}
          </div>
          <p>{user?.name}</p>
        </div>
        <div onClick={handleMenuToggle}>
          <CiMenuBurger size={"25px"} style={{ strokeWidth: 2, transform:isMenu?'rotate(90deg)':'rotate(0deg)', transition: '1s' }} />
        </div>
      </div>
   
      <div className={styles.menu} style={{transform:isMenu?'translateY(80px)':'translateY(-800px)'}}>
        <Action handleDocumental={handleDocumental}/>
      </div> 


      {show === 'home' &&
       <>
         <div className={styles.info} style={{filter:isMenu?' grayscale(80%)':''}}>
        {/* <p>目前位置: {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : '未取得'}</p>
        <p>打卡地點: {CHECKIN_LOCATION.lat.toFixed(6)}, {CHECKIN_LOCATION.lng.toFixed(6)}</p> */}
        <div className={styles.info_main}>
          <h1 className={styles.time}>{time}</h1>
          <p className={styles.distance}>{CHECKIN_RADIUS} 公尺內可打卡</p>
        </div>

        <button className={styles.reset} onClick={handleReloadPosition}>
          重新定位
        </button>

        {isWithinRange !== null && (
          <p style={{ color: isWithinRange ? "green" : "red" }}>
            {isWithinRange
              ? "你在允許範圍內可以打卡！"
              : " 你超出範圍無法打卡！"}
          </p>
        )}
      </div>

      {isClient && location && (
        <div style={{ position: "relative", filter:isMenu?' grayscale(80%)':''}} >
          <DynamicMap
            location={location}
            checkInLocation={CHECKIN_LOCATION}
            radius={CHECKIN_RADIUS}
          />
          <button
            onClick={handleCheckIn}
            className={styles.container_checkBotton}
            style={{
              backgroundColor: isWithinRange ? "#439E5D" : "#DD5252",
            }}
            disabled={!isWithinRange}
          >
            打卡
          </button>
        </div>
      )}
       </>
      
      }


          


      {/* <h3>打卡紀錄</h3>
      <ul>
        {checkIns.map((ci) => (
          <li key={ci.id}>{ci.time} - {ci.location.lat}, {ci.location.lng}</li>
        ))}
      </ul> */}
      {/* <button onClick={handleLogout}>登出</button> */}
      {show === 'Documental' && 
        <Documental checkIns={checkIns}/>
      }
      
    </div>
    
  );

 

  // 避免服務器端和客戶端渲染不一致，使用統一的初始狀態
  if (!isClient) {
    return (
      <div className={styles.container}>
        <h2>載入中...</h2>
      </div>
    );
  }

  return <div>{!user ? renderLoginForm() : renderUserDashboard()}</div>;
}

export default Home;
