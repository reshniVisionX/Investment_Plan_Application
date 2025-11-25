
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchNotifications } from "../../slices/notificationSlice";
import { tokenstore } from "../../auth/tokenstore";
import Toast from "../../utils/Toast";
import "../../Styles/Notifications.css";
import { formatDateTime } from "../../utils/FormatDate";

const Notifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: notifications, loading,error } = useSelector(
    (state: RootState) => state.notifications
  );

  useEffect(() => {
    const investor = tokenstore.getInvestor();
    if (investor) {
       if (notifications.length === 0) {
        dispatch(fetchNotifications(investor.publicInvestorId));
        console.log("fetching notifications store is empty");
      }
    }
  }, [dispatch, notifications.length]);

  return (
    <div className="notifications-container">
      <h2>🔔 Notifications</h2>

      {loading ? (
        <p className="loading-text">Loading notifications...</p>
      ) : notifications.length > 0 ? (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={String(n.notificationId)} className={`notification-item ${n.isRead ? "read" : "unread"}`}>
              <p className="notification-message">{n.message}</p>
              <span className="notification-time">
                {formatDateTime(n.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data">No notifications found.</p>
      )}
     {error && <Toast message={error} type="error" onClose={() => {}} />}

      </div>
  );
};

export default Notifications;
