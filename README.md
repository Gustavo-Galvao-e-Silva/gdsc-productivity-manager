# Welcome to GDScheduler

**GDScheduler** is an open-source productivity manager designed for student clubs and small organizations that need to track tasks effectively. It’s a no-BS app with a simple setup and interface, allowing project managers to automatically track and flag team members who haven't completed their assigned tasks.

The app currently uses **Clerk** for authentication and role management, and **Firebase** for cloud storage and database management.

---

## 🚀 Requirements & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- npm (comes with Node.js)

This project uses `npm` and includes a `package-lock.json` file to ensure consistent dependency versions. Please use `npm install` instead of other package managers.

### Installation

1. **Clone the repository:**

   ```bash
   git clone <ttps://github.com/Gustavo-Galvao-e-Silva/gdsc-productivity-manager.git

2. **Install dependencies:**
   ```bash
   npm install
   
## 🔧 Cloud Configuration

To run the project locally or deploy your own instance, follow these steps:

1. **Firebase Setup:**
  Go to the Firebase Console.
  Create a new project.
  Enable Firestore Database.
  Copy your Firebase project configuration (API key, project ID, etc.).
  Add this config to your .env.local file in the root directory of the project.
2. **Clerk Setup:**
  Visit Clerk.dev and create a new project.
  Copy your Clerk frontend and backend API keys.
  Add them to your .env.local file as well.
