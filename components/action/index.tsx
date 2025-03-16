
// import { Link } from 'react-router-dom'
import styles from './action.module.css'
interface ActionProps {
    handleDocumental: (value:string) => void;
  }
  
export default function Action ({handleDocumental}:ActionProps) {
    return (
        
      <div className={styles.actions}>
        <ul className={styles.list}>
            <li onClick={()=>{
                handleDocumental('Documental')
            }} className={styles.item}><a>打卡紀錄</a></li>
            <li className={styles.item}><a>加班申請</a></li>
        </ul>
      </div>
    )
}