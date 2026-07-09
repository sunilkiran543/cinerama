# Cinerama 🎬

A modern, responsive movie discovery and tracking platform built using React, TypeScript, and Vite. Cinerama integrates external RESTful movie APIs to allow users to search films, filter by genre, build a personal watchlist, and maintain data state with local persistence.

## 🚀 Features

- **Dynamic Search & Filtering:** Low-latency search indexing combined with clean genre filtering.
- **Watchlist Persistence:** Ability to save, rate, and track movies with state synchronized instantly to local storage.
- **API Resilience Architecture:** Implements a localized fallback mock database catalog path to guarantee zero-downtime and uninterrupted UX if the external REST API endpoints are unreachable.
- **End-to-End Type Safety:** Strictly enforced TypeScript interfaces mapping API response structures and payload data contracts across all components.
- **Clean Responsive UI:** Fully responsive layouts designed for intuitive navigation across desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Semantic CSS3 (with responsive breakpoints)
- **Backend/Server:** Node.js (`server.mjs`)
- **Data Integration:** RESTful Film API + Local Storage Web Persistence

## 📂 Project Structure

```text
Cinerama/
├── src/
│   ├── App.tsx       # Core layout and state orchestration
│   ├── main.tsx      # Application entry point
│   ├── types.ts      # Strictly typed TypeScript data models & interfaces
│   ├── storage.ts    # LocalStorage lifecycle management hooks
│   └── styles.css    # Responsive styles and component themes
├── index.html
├── package.json
└── server.mjs        # Production & local server orchestration
