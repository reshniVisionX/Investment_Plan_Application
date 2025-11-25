# 📈 Investment Plan Application

A full-stack real-time investment management platform that allows investors to manage **stocks**, **mutual funds**, and monitor their entire portfolio with **live market updates**, secure authentication, and instant notifications. Built with **React (TypeScript)** on the frontend and **ASP.NET Core + SignalR** on the backend.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure investor login using JWT.
- Token stored and managed through a custom token store.
- Logout resets the entire Redux state (auth, funds, stocks, notifications).

### 📊 Real-Time Market Updates (SignalR)
- Live stock and mutual fund updates pushed through SignalR.
- Each investor subscribes only to their own stocks/funds.
- Queue-based subscription recovery on reconnect.
- Auto re-registration after SignalR reconnects.

### 🔔 Real-Time Notifications
- Personal notifications pushed instantly to the user.
- Notifications stored in Redux with `isLiveEvent` flag.
- Prevents duplicate notifications.
- Full sync with database notifications (read/unread support).

### 💼 Portfolio Management
- Fetch complete portfolio of stocks and mutual funds.
- Live update of portfolio values as prices change.
- Validation (missing stock selection, missing allocation, etc.).
- Smooth UI with Toast notifications.

### 📝 KYC Capture (Photo + Digital Signature)
- Capture live photo using **Webcam API**.
- Digital signature using **HTML Canvas 2D API**.
- Convert both photo & signature from base64 → File objects.
- Verification required before moving to the next onboarding step.

### 🧩 Clean Frontend Architecture
- React + TypeScript.
- Redux Toolkit slices for stocks, funds, auth, notifications.
- Async Thunks for API calls.
- Modular components with reusable logic.
- Complete TypeScript typings for all DTOs.

### 🔧 Robust Backend Architecture (ASP.NET Core)
- SignalR Hub for managing connections & real-time updates.
- Per-investor connectionId mapping using ConcurrentDictionary.
- Group-based subscription for individual stocks & funds.
- Broadcast service for pushing stock/fund updates efficiently.
- Clean separation of Services, Controllers, DTOs, Hubs, and Repositories.

---

## 🏗️ Tech Stack

### **Frontend**
- React (TypeScript)
- Redux Toolkit
- SignalR Client
- Axios
- Webcam API
- Canvas API

### **Backend**
- ASP.NET Core Web API
- SignalR
- C#
- Entity Framework (if used)
- SQL Database

---

## 📡 Real-Time Data Flow Overview

1. Investor logs in → Token + investor details saved.
2. SignalR connection starts.
3. Backend registers the investor + stores connectionId.
4. Frontend subscribes to relevant stocks/funds.
5. Backend broadcasts updates only to subscribed groups.
6. Redux slices update UI instantly.
7. Live notifications appear with toast and `isLiveEvent`.
8. Portfolio values auto-refresh based on real-time prices.

---

## 🧱 Project Structure

