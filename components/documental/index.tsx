import styles from './documental.module.css'

interface CheckInType {
    time: string;
    location: {
      lat: number;
      lng: number;
    };
    id: number;
  }
  
  interface DocumentalProps {
    checkIns: CheckInType[];
  }
  
  export default function Documental({ checkIns }: DocumentalProps) {
    return (
      <div>
        <ul className={styles.list}>
          {checkIns.map((ci) => (
            <li className={styles.item} key={ci.id}>
              {ci.time} &gt;
            </li>
          ))}
        </ul>
      </div>
    );
  }
  