# QuikCort - AI-Powered Mediation Platform

QuikCort is an AI-based mediation platform that helps users quickly resolve small interpersonal or transactional conflicts through intelligent dispute resolution.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Case Management**: Create cases, invite opposing parties, and manage dispute resolution
- **AI-Powered Verdicts**: Integration with Google Gemini AI for intelligent dispute analysis
- **Evidence Support**: Upload and link evidence to support claims
- **Credibility System**: User credibility scoring based on case outcomes
- **Appeal Process**: Built-in appeal system for verdicts
- **Real-time Notifications**: Email notifications for case updates

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini API
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Project Structure

```
src/
├── config/
│   └── database.js          # Database connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── caseController.js    # Case management logic
│   └── verdictController.js # Verdict handling logic
├── middlewares/
│   ├── auth.js             # JWT authentication middleware
│   ├── errorHandler.js     # Error handling middleware
│   └── validation.js       # Input validation middleware
├── models/
│   ├── User.js             # User model
│   ├── Case.js             # Case model
│   ├── Submission.js       # Submission model
│   └── Verdict.js          # Verdict model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── cases.js            # Case management routes
│   ├── verdicts.js         # Verdict routes
│   └── index.js            # Main router
├── utils/
│   └── geminiService.js    # Gemini AI integration
└── app.js                  # Main application file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quikcort-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration - MongoDB Atlas
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/quikcort?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Gemini AI Configuration
   GEMINI_API_KEY=your-gemini-api-key-here
   GEMINI_MODEL=gemini-pro
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/stats` - Get user statistics

### Cases
- `POST /api/cases` - Create a new case
- `GET /api/cases` - Get user cases
- `GET /api/cases/:caseId` - Get specific case
- `PUT /api/cases/:caseId` - Update case
- `DELETE /api/cases/:caseId` - Cancel case
- `POST /api/cases/join/:token` - Join case via invitation
- `POST /api/cases/:caseId/submit` - Submit claim for case
- `POST /api/cases/:caseId/appeal` - Appeal verdict

### Verdicts
- `GET /api/verdicts` - Get user verdicts
- `GET /api/verdicts/stats` - Get verdict statistics
- `GET /api/verdicts/case/:caseId` - Get verdict for case
- `GET /api/verdicts/:verdictId` - Get verdict details
- `PUT /api/verdicts/:verdictId/finalize` - Finalize verdict

## Database Models

### User
- Personal information (name, email)
- Credibility score
- Case statistics (total, won, lost)
- Authentication data

### Case
- Case details (title, description, category)
- Parties (creator, opposing party)
- Status tracking
- Invitation system
- Deadline management

### Submission
- Claim details
- Evidence links
- Submitter information
- Edit history

### Verdict
- AI-generated decision
- Confidence score
- Reasoning and key points
- Compensation recommendations
- Appeal tracking

## AI Integration

The platform uses Google Gemini AI to analyze disputes and generate verdicts. The AI considers:
- Both parties' claims and evidence
- User credibility scores
- Case category and context
- Historical patterns

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- Helmet security headers

## Deployment

### Render.com
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy with automatic builds

### MongoDB Atlas Setup
1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new project

2. **Create Free Cluster**
   - Click "Build a cluster"
   - Choose "FREE" tier (M0 Sandbox)
   - Select a cloud provider and region
   - Name your cluster (e.g., "quikcort-cluster")

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `quikcort`

6. **Update Environment Variables**
   - Add the connection string to your `.env` file as `MONGO_URI`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRE` | JWT token expiration time | No |
| `PORT` | Server port | No |
| `NODE_ENV` | Environment (development/production) | No |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, email support@quikcort.com or create an issue in the repository.
