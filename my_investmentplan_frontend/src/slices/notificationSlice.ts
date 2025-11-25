
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getAllNotificationsByInvestorId } from "../api/Service/investor.api";
import type { TypedAxiosError } from "../Types/ApiError";

export interface Notification {
  notificationId: number;
  publicInvestorId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  isLiveEvent?: boolean;
}

type NotificationState = {
  list: Notification[];
  loading: boolean;
  error: string | null;
};

const initialState: NotificationState = {
  list: [],
  loading: false,
  error: null,
};


export const fetchNotifications = createAsyncThunk<
  Notification[],
  string, 
  { rejectValue: string }
>("notifications/fetchAll", async (publicInvestorId, { rejectWithValue }) => {
  try {
    const result = await getAllNotificationsByInvestorId(publicInvestorId);
       return result.map(n => ({ ...n, isLiveEvent: false }));
  } catch (err) {
    const error = err as TypedAxiosError;
    return rejectWithValue(
      error.response?.data?.Exception ||
      error.response?.data?.message ||
      "Failed to fetch notifications."
    );
  }
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
  
    addNotification: (state, action: PayloadAction<Notification>) => {
    
       const exists = state.list.some(
        (n) => n.notificationId === action.payload.notificationId
      );
      if (!exists) {
        state.list.unshift({
          ...action.payload,
          isLiveEvent: true,
        });
      }
    },
     markLiveEventHandled: (state, action: PayloadAction<number>) => {
    const n = state.list.find(n => n.notificationId === action.payload);
    if (n) n.isLiveEvent = false;
  },


    markAllAsRead: (state) => {
      state.list.forEach((n) => (n.isRead = true));
    },

    clearNotifications: (state) => {
      state.list = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;

      
        const existingIds = new Set(state.list.map(n => n.notificationId));
        const newOnes = action.payload.filter(n => !existingIds.has(n.notificationId));
        state.list = [...newOnes, ...state.list];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load notifications.";
      });
  },
});

export const { addNotification, markAllAsRead,  markLiveEventHandled,clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
