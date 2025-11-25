import { configureStore, combineReducers,type AnyAction } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import stockReducer from "./slices/stockSlice";
import fundReducer from "./slices/fundSlice";
import notificationReducer from "./slices/notificationSlice";


const appReducer = combineReducers({
  auth: authReducer,
  stocks: stockReducer,
  funds: fundReducer,
  notifications: notificationReducer,
});


const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action:AnyAction) => {
  if (action.type === "auth/logout") {
   console.log("Logging out and resetting state");
    state = undefined;
  }
  return appReducer(state, action);
};


export const store = configureStore({
  reducer: rootReducer,
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
