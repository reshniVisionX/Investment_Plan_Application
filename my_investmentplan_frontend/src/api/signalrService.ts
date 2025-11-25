
import * as signalR from "@microsoft/signalr";
import { store } from "../store";
import { addStockUpdate } from "../slices/stockSlice";
import { addFundUpdate } from "../slices/fundSlice";
import { addNotification } from "../slices/notificationSlice";
import { tokenstore } from "../auth/tokenstore";
import type {
  BroadCastStockUpdDTO,
  BroadCastFundUpdDTO,
  NotificationDTO,
} from "../Types/BroadCast";


let connection: signalR.HubConnection | null = null;

let queuedStockSubs: number[] = [];
let queuedFundSubs: number[] = [];

const processSubscriptionQueue = async () => {
  if (!connection || connection.state !== signalR.HubConnectionState.Connected)
    return;

  for (const stockId of queuedStockSubs) {
    await connection.invoke("SubscribeStock", stockId);
    console.log("📡 Subscribed (queued): Stock-" + stockId);
  }
  queuedStockSubs = [];

  for (const fundId of queuedFundSubs) {
    await connection.invoke("SubscribeFund", fundId);
    console.log(" Subscribed (queued): Fund-" + fundId);
  }
  queuedFundSubs = [];
};

export const subscribeToStock = async (stockId: number): Promise<void> => {

  if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
    console.log(" Queueing stock subscription:", stockId);
    queuedStockSubs.push(stockId);
    return;
  }

  await connection.invoke("SubscribeStock", stockId);
  console.log(" Subscribed immediately: Stock-" + stockId);
};

export const subscribeToFund = async (fundId: number): Promise<void> => {
  if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
    console.log(" Queueing fund subscription:", fundId);
    queuedFundSubs.push(fundId);
    return;
  }

  await connection.invoke("SubscribeFund", fundId);
  console.log(" Subscribed immediately: Fund-" + fundId);
};

export const startSignalRConnection = async (): Promise<void> => {
  const investor = tokenstore.getInvestor();
  if (!investor) {
    console.warn(" No investor found. Skipping SignalR connection.");
    return;
  }
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log(" SignalR already connected.");
    return;
  }

  
  if (connection) {
    try {
      await connection.stop();
      console.log(" Old SignalR connection stopped.");
    } catch 
  {console.log("error while stopping old connection")}
    connection = null;
  }


  connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7285/notificationhub")
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

    connection.on("StockUpdated", (update: BroadCastStockUpdDTO) => {
    console.log(" Stock update received:", update);
    store.dispatch(
      addStockUpdate({
        stockId: update.stockId,
        currentMarketPrice: update.currentMarketPrice,
        totalShares: update.totalShares,
        volumeTraded: update.volumeTraded,
        updatedAt: update.updatedAt,
      })
    );
  });

connection.on("FundUpdated", (update: BroadCastFundUpdDTO) => {
  console.log(" Fund update received:", update);

  store.dispatch(
    addFundUpdate({
      fundId: update.fundId,
      fundName: update.fundName,
      nav: update.nav,
      aum: update.aum,
      totalUnits: update.totalUnits,
      minInvestmentAmount: update.minInvestmentAmount,
      updatedAt: update.updatedAt,
    })
  );
});



  connection.on("NotificationReceived", (notification: NotificationDTO) => {
    console.log(" Notification:", notification);
    store.dispatch(addNotification(notification));
  });

  connection.onreconnected(async () => {
    console.log(" Reconnected. Re-registering investor…");
    await connection!.invoke("RegisterInvestor", investor.publicInvestorId);

    console.log(" Processing queued subscriptions…");
    await processSubscriptionQueue();
  });

  connection.onreconnecting(() => console.log(" SignalR reconnecting..."));
  connection.onclose(() => console.log(" SignalR disconnected"));
 try {
    await connection.start();
    console.log(" SignalR Connected:", connection.connectionId);

    await connection.invoke("RegisterInvestor", investor.publicInvestorId);
    console.log("Investor registered:", investor.publicInvestorId);
    await processSubscriptionQueue();
  } catch (err) {
    console.error(" SignalR Connection Error:", err);
  }
};


export const stopSignalRConnection = async (): Promise<void> => {
  if (connection) {
    try {
      await connection.stop();
      console.log(" SignalR stopped.");
    } catch (err) {
      console.error("Error stopping SignalR:", err);
    } finally {
      connection = null;
    }
  }
};
