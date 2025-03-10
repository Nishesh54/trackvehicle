# Emergency Vehicle Tracker

A responsive web application for emergency vehicle services built with Next.js and Tailwind CSS.

## Features

- User authentication (login and registration)
- Live location sharing with emergency responders
- Map display of nearby emergency vehicles using OpenStreetMap and Leaflet
- Sorting of vehicles based on proximity and estimated arrival times
- Responsive UI with dashboard showing user and vehicle locations in real-time

## Technology Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Maps**: Leaflet.js with OpenStreetMap
- **Backend**: Supabase (mock implementation for now)

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd emergency-vehicle-tracker
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/src/app`: Next.js app router pages
- `/src/components`: Reusable UI components
- `/src/lib`: Utilities, store, and backend services
- `/public`: Static assets including marker icons for maps

## Mock Data

Currently, the application uses mock data for vehicles and authentication. In a production environment, this would be replaced with real data from Supabase or another backend service.

## Future Improvements

- Implement real authentication with Supabase
- Add real-time location updates using WebSockets
- Enhance map functionality with routing and directions
- Add notifications for user when vehicles are approaching
- Add admin dashboard for managing vehicles and emergencies

## License

MIT 