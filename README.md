# 💜 My List

**A personal entertainment library — built with love and a little bit of purple.**

My List is a full-stack web application for organizing anime, TV series, movies, books, and games in one place.

Designed with a dreamy purple aesthetic, it allows users to create their own collections, track progress, rate favorites, and write personal reviews.

### 🌐 Live Demo

**[Explore My List](https://my-list-production.up.railway.app)**

### 🧪 Public Beta

**My List is currently in beta and was developed primarily as a portfolio project.**

The application is available for demonstration and testing, but it is not intended to be a production-grade service.

Please note:

- Some bugs or unexpected behavior may occur.
- Email verification is not currently available.
- Password recovery is not supported.
- Automated backups are not configured.
- User data and uploaded images may be lost in the event of a technical failure.

**Please use a unique password and avoid storing sensitive, confidential, or irreplaceable information.**

Feedback and bug reports are welcome!

### ✨ Features

- User registration, login, and logout
- Private collections for individual users
- Five categories: Anime, Series, Movies, Reading, and Games
- Create, edit, and delete entries
- Upload and remove custom cover images
- Add genres, descriptions, and personal reviews
- Rate entries from 0.5 to 5 stars
- Track progress: Completed, Incomplete, or Dropped
- Category-specific information such as episodes, pages, duration, and playtime
- Search and filter entries
- View collection statistics and average ratings

### 🛠️ Tech Stack

**Frontend**

- HTML5
- CSS3
- JavaScript

**Backend**

- Node.js
- Express.js
- REST API

**Database**

- PostgreSQL
- Neon

**Authentication & Security**

- bcryptjs
- JSON Web Tokens (JWT)
- HttpOnly cookies
- Express Rate Limit
- Helmet
- Origin validation

**Image Processing**

- Multer
- Sharp
- WebP optimization

**Deployment & Tools**

- Railway
- Docker
- Git & GitHub
- Visual Studio Code

### 📁 Project Structure

- `client/` — frontend pages, CSS, JavaScript, and assets
- `server/routes/` — authentication, entries, and photo endpoints
- `server/middleware/` — authentication middleware
- `server/sql/` — database SQL scripts
- `server/server.js` — Express application
- `Dockerfile` — production deployment configuration

### 🚀 Running Locally

1. Clone the repository.
2. Open the `server` directory.
3. Install dependencies:

   `npm ci`

4. Set up a PostgreSQL database using the SQL scripts in `server/sql/`.
5. Create `server/.env` with the following environment variables:
   - `DATABASE_URL` — PostgreSQL connection string
   - `JWT_SECRET` — a securely generated secret
   - `APP_ORIGIN=http://localhost:3000`

6. Start the application:

   `npm start`

7. Open `http://localhost:3000` in your browser.

Locally, the server uses port **3000** by default. In production, Railway provides the port through the `PORT` environment variable.

Never commit `.env` files or credentials to GitHub.

### 🔐 Security

My List implements password hashing, authenticated API endpoints, user-specific database queries, request rate limiting, Origin validation, and protective HTTP headers.

These mechanisms reduce common security risks but do not guarantee complete protection. The application remains a beta project.

### 📌 Project Status

**Public Beta — Portfolio Demonstration**

My List was developed as an independent full-stack project to demonstrate frontend development, backend API design, PostgreSQL integration, authentication, image processing, and cloud deployment.

The core functionality is implemented and publicly accessible. Further improvements may be made over time.

### 👩‍💻 Development

An independent full-stack portfolio project.
