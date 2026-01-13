# Event Manager Application

This is a full-stack **Event Management Web Application** built with **Next.js**, **MongoDB**, and **NextAuth.js**.  
The platform allows users to browse events, confirm participation, and allows organizers to create, edit, and delete events.

The project was developed for academic purposes and follows modern web development practices.

---

## Features

### Authentication
- User authentication using **NextAuth.js**
- Login and Signup with credentials
- Role-based access:
  - **Attendee**
  - **Organizer**

---

### Events
- Browse all available events
- View event details:
  - Title
  - Description
  - Date
  - Location
  - Category
  - Price
  - Available seats
- Search and filter events by:
  - Category
  - Date (upcoming, ongoing, canceled)
  - Price
- Mark events as **Favorites**

---

### Participation
- Users can confirm participation to events
- Events become **Sold Out** automatically when capacity is reached
- Participation is disabled when no seats are available
- Users can see events they participated in under **“My Tickets”**

---

### Organizer Dashboard
- Organizers can:
  - Add new events
  - Edit their own events
  - Delete their own events
- Only the event organizer is allowed to edit or delete an event
- Organizers can see the number of attendees for each event

---

## Technologies Used

### Frontend
- **Next.js** (Pages Router)
- **React**
- **CSS Modules**
- Responsive UI

### Backend
- **Next.js API Routes**
- **MongoDB** with **Mongoose**
- **NextAuth.js** for authentication

---

## Project Structure

