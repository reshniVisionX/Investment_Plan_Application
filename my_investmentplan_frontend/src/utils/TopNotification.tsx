import React, { useEffect, useState } from "react";
import "../Styles/TopNotification.css";
import './FormatDate';
import { formatDateTime } from "./FormatDate";

interface NotificationProps {
  message: string;
  time: string;
  onClose: () => void;
}

const TopNotification: React.FC<NotificationProps> = ({ message, time, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show animation
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // wait for fade-out animation
    }, 2800);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`top-notification ${visible ? "show" : ""}`}>
      <div className="notif-content">
        <p className="notif-message">{message}</p>
        <span className="notif-time">
          {formatDateTime(time)}
        </span>
      </div>
    </div>
  );
};

export default TopNotification;
