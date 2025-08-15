# Project Summary: NL Wildfire Air-Quality-Tracker

This document provides a technical overview of the NL Wildfire Air Quality Tracker project, detailing its architecture, backend processes, and mobile application structure.

## Overall Architecture

The project follows a client-server model designed for simplicity and scalability:

1.  **Data Ingestion (Backend)**: A Python-based backend periodically fetches wildfire and weather data from external sources (e.g., CWFIS, Environment Canada).
2.  **Data Processing & Modeling**: The backend processes this data, runs air quality prediction models (currently mocked), and generates a set of static JSON files.
3.  **Data Publishing**: These static files are committed and pushed to the `gh-pages` branch of the GitHub repository, effectively using GitHub Pages as a free, scalable JSON API.
4.  **Mobile App (Frontend)**: A React Native application for iOS and Android fetches the static JSON data from the GitHub Pages URL, caches it, and displays it to the user on an interactive map.

This static-site-generation approach minimizes server costs and maintenance while providing a robust data source for the mobile app.

---

## Backend

The backend is a collection of Python scripts responsible for data collection, processing, and publishing.

-   **Technology Stack**:
    -   Python 3
    -   `requests`, `beautifulsoup4`: For fetching and parsing data from web sources.
    -   `loguru`: For robust logging.
    -   `tenacity`: For retry logic on network requests.
    -   No database; the "database" is the set of generated JSON files.

-   **Core Logic**:
    -   `update_data.py`: The main entry point. It orchestrates the entire data update process.
    -   `wildfire_fetcher.py`: Fetches active wildfire data from the Canadian Wildland Fire Information System (CWFIS), filtering for fires within Newfoundland and Labrador's geographical bounds. It includes fallbacks for different data formats (JSON, KML).
    -   `weather_fetcher.py`: Fetches weather data and forecasts from Environment Canada APIs for specific locations (e.g., active fire locations).
    -   `static_generator.py`: Takes the processed wildfire and weather data, along with air quality predictions, and generates the final `data.json`, `metadata.json`, and other static files.
    -   **Publishing**: The `update_data.py` script contains logic to automatically check out the `gh-pages` branch, copy the new data files, and commit/push the changes.

---

## Mobile App (Frontend)

The mobile app provides a user-friendly interface to visualize the wildfire and air quality data.

-   **Technology Stack**:
    -   React Native (TypeScript)
    -   `react-native-maps`: For the core map interface.
    -   `@react-native-async-storage/async-storage`: For local data caching.

-   **Project Structure**:
    -   `App.tsx`: The main entry point for the application.
    -   `src/screens/MapScreen.js`: The primary and only screen, which contains all UI and logic for displaying the map, markers, and information panels.
    -   `src/services/DataService.js`: A singleton service responsible for fetching data from the GitHub Pages URL. It handles caching (in-memory and AsyncStorage), data processing/massaging, and notifying UI components of updates.
    -   `src/components/`: Contains reusable UI components like the community selector, information panels, and map legend.

-   **Core Functionality**:
    -   **Data Fetching**: `DataService.js` fetches `data.json` from the static API.
    -   **Caching**: Data is cached for 30 minutes to reduce network requests and stored in `AsyncStorage` to provide offline access to the last known data.
    -   **Map View**: Displays wildfire locations as markers, air quality predictions as a circular overlay, and key communities.
    -   **User Interaction**: Users can select a community to view detailed AQHI forecasts, tap on fires to see details, and toggle map layers.
    -   **Cross-Platform**: Standard React Native structure with `android` and `ios` folders, indicating it is set up for both platforms.

---
## Dev Environment Setup Log (2025-08-15)

**Goal**: Set up the local development environment to run the React Native application on an Android emulator/device.

**Progress**:
- Verified that Node.js and npm are installed.
- Identified that the Java Development Kit (JDK) was missing and the `ANDROID_HOME` environment variable was not set.
- Discussed and selected JDK 17 as the correct version for compatibility with the Android build tools and React Native.
- The user downloaded and extracted OpenJDK 17 to `E:\Program Files\Java\jdk-17.0.2`.
- Attempted to set environment variables via the command line, but this failed due to the length of the system's `Path` variable.

**Current Status**:
- The `JAVA_HOME` variable was found to be incorrectly pointing to the Android Studio JRE.
- Instructions were provided to manually update the system environment variables through the Windows GUI:
    1.  **Set `JAVA_HOME` to `E:\Program Files\Java\jdk-17.0.2`**.
    2.  **Add `%JAVA_HOME%\bin` to the system `Path`**.

**Next Steps**:
1.  Verify the manual changes by running `javac -version` in a **new terminal**.
2.  Once the JDK is verified, proceed with installing the Android SDK via Android Studio and setting the `ANDROID_HOME` environment variable.
3.  Finally, attempt to build and run the app using `npx react-native run-android`.