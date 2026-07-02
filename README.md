## 📁 `README.md`

```markdown
# MyBlogMark – Full Stack Blog Application
A full-featured blog platform built with **Spring Boot** (backend) and **React + Vite** (frontend). It includes user authentication, blog post management, comments, likes, admin dashboard, and more.
---

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration and login with **JWT** (JSON Web Token)
- Role-based access control (**Admin** vs **User**)
- Protected routes and secure API endpoints

### 📝 Blog Management
- Create, edit, view, and delete blog posts
- Upload **multiple images** per post
- **Rich text** content support
- Category-based filtering

### 💬 Engagement
- Comment on posts
- Reply to comments (nested comments)
- Like / unlike posts
- View count tracking

### 👑 Admin Panel
- Dashboard with real-time stats (posts, users, comments, categories)
- Manage **users** (view, delete)
- Manage **categories** (add, delete)
- Manage **all posts** (view, delete)
- Manage **comments** (view, delete)

### 👤 User Dashboard
- Personal dashboard with stats (posts, views, likes, comments)
- View and edit profile
- Upload profile picture
- Recent activity feed

---

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.4.1**
- **Spring Security** + **JWT**
- **Spring Data JPA** (Hibernate)
- **MySQL** (Database)
- **Lombok**
- **Maven**

### Frontend
- **React 18**
- **Vite** (Build tool)
- **Bootstrap 5** (CSS framework)
- **Axios** (HTTP client)
- **React Router DOM** (Routing)
- **Context API** (State management)

## 📦 Installation & Setup

### Prerequisites
- **Java 17** or higher
- **Node.js 18** or higher
- **MySQL** (or any compatible database)

---

### 2️⃣ Backend Setup (Spring Boot)

```bash
cd backend
```

#### Configure Database
Open `src/main/resources/application.properties` and update your database credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/blogdb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=yourpassword

jwt.secret=yourSecretKeyAtLeast32CharactersLong
jwt.expiration=86400000
```

#### Run the Backend

```bash
mvn clean install
mvn spring-boot:run
```

The backend will start at: `http://localhost:8080`

---

### 3️⃣ Frontend Setup (React + Vite)

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

#### Configure API Base URL

Update `src/services/api.js` if needed (default is `http://localhost:8080/api`):

```javascript
baseURL: 'http://localhost:8080/api'
```

#### Run the Frontend

```bash
npm run dev
```

The frontend will start at: `http://localhost:3000`

---

## 🔧 Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:8080/api
```

---

## 📂 Project Structure

### Backend Structure

```
backend/
├── src/main/java/com/aanchal/blogApp/
│   ├── config/               # Security, WebConfig, etc.
│   ├── controller/           # REST Controllers
│   ├── dto/                  # Data Transfer Objects
│   ├── entity/               # JPA Entities
│   ├── repository/           # JPA Repositories
│   ├── security/             # JWT & Security classes
│   ├── service/              # Service Interfaces
│   └── serviceImpl/          # Service Implementations
├── uploads/                  # Uploaded images (profile, posts)
└── application.properties
```

### Frontend Structure

```
frontend/
├── src/
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # Reusable components
│   ├── context/              # AuthContext, etc.
│   ├── hooks/                # Custom hooks (useAuth)
│   ├── layouts/              # Layout components (Sidebar, Navbar)
│   ├── pages/                # Page components
│   │   ├── admin/            # Admin pages
│   │   ├── AllBlogs/
│   │   ├── CreatePost/
│   │   ├── Dashboard/
│   │   ├── EditPost/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── MyBlogs/
│   │   ├── Profile/
│   │   ├── Register/
│   │   └── ViewPost/
│   ├── services/             # API services
│   ├── styles/               # CSS files
│   └── App.jsx
├── index.html
└── package.json
```

---

## 🔑 API Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts (public) |
| GET | `/api/posts/{id}` | Get single post (public) |
| POST | `/api/posts` | Create a new post (auth) |
| PUT | `/api/posts/{id}` | Update a post (auth, author) |
| DELETE | `/api/posts/{id}` | Delete a post (auth, author) |
| POST | `/api/posts/{id}/like` | Toggle like on a post |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/{id}/comments` | Add a comment |
| POST | `/api/posts/comments/{id}/replies` | Reply to a comment |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Get admin dashboard stats |
| GET | `/api/admin/users` | Get all users (admin only) |
| GET | `/api/admin/posts` | Get all posts (admin only) |
| DELETE | `/api/admin/users/{id}` | Delete a user (admin only) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgements

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Bootstrap](https://getbootstrap.com/)
- [Axios](https://axios-http.com/)
- [JJWT](https://github.com/jwtk/jjwt)

---

## 👨‍💻 Author

**Your Name** – [@Aanchal0208](https://github.com/Aanchal0208)

---

⭐ If you like this project, give it a star on GitHub!
```

---

## 📁 Folder Structure for Screenshots

Create a folder called `screenshots/` in your project root and add these images:

```
screenshots/
<img width="1917" height="862" alt="image" src="https://github.com/user-attachments/assets/3fc28089-be4c-432b-9090-23c9e533e9ff" />
<img width="1917" height="867" alt="image" src="https://github.com/user-attachments/assets/7042b5db-7f32-466a-87d0-0c0df5fe6b72" />
<img width="1917" height="866" alt="image" src="https://github.com/user-attachments/assets/33deb12f-eab2-42a9-a918-8ff18da8cfdb" />
<img width="1917" height="852" alt="image" src="https://github.com/user-attachments/assets/7aee614e-5c0d-498f-83c2-ed21721abd6d" />
<img width="1917" height="858" alt="image" src="https://github.com/user-attachments/assets/65ba0793-3061-4efb-86a4-f61a546e068b" />
<img width="1917" height="857" alt="image" src="https://github.com/user-attachments/assets/9e524dca-3c9a-4b9d-b950-2b70ffafa5ee" />
<img width="1917" height="852" alt="image" src="https://github.com/user-attachments/assets/3ae7aacf-f773-46ce-be62-b11e5648ae89" />
<img width="1917" height="862" alt="image" src="https://github.com/user-attachments/assets/73f5f918-f915-4811-a5da-cc377dc11915" />
<img width="1917" height="865" alt="image" src="https://github.com/user-attachments/assets/9a60dcca-aa75-44dc-9a2e-9766a4eb2aaa" />
