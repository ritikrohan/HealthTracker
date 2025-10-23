# Health Tracker - AI-Powered Health Monitoring

A comprehensive health tracking application that uses AI to analyze health documents, extract data, and provide insights and trend analysis.

## Features

- 🔐 **Secure Authentication** - Supabase Auth integration
- 📄 **Document Upload** - Support for PDF and image files
- 🤖 **AI-Powered Analysis** - OpenAI GPT-4 for data extraction
- 📊 **Data Visualization** - Interactive charts and graphs
- 📈 **Trend Tracking** - Compare current vs previous test results
- 🏥 **Health Categories** - Blood work, imaging, vital signs, and more
- 🔒 **Privacy & Security** - Enterprise-grade data protection

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4
- **Charts**: Recharts
- **UI Components**: Radix UI, Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### 2. Environment Configuration

The `.env.local` file has been configured with your Supabase credentials. You need to add your OpenAI API key:

```bash
# Add your OpenAI API key to .env.local
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Database Setup

Run the SQL schema in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the SQL to create all tables and policies

### 4. Storage Setup

Create a storage bucket in Supabase:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `health-documents`
3. Set it to public if you want direct access to files
4. Configure RLS policies for the bucket

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── upload/        # Document upload endpoint
│   │   ├── process-document/ # AI processing endpoint
│   │   ├── reports/       # Reports API
│   │   └── comparisons/   # Comparison API
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── upload/           # Upload components
│   ├── charts/           # Data visualization
│   └── comparison/       # Report comparison
├── lib/                  # Utility libraries
│   ├── supabase.ts      # Supabase client
│   ├── auth.ts          # Auth utilities
│   └── ai-extraction.ts # AI processing
└── middleware.ts         # Next.js middleware
```

## API Endpoints

- `POST /api/upload` - Upload health documents
- `POST /api/process-document` - Process documents with AI
- `GET /api/reports` - Fetch health reports
- `GET /api/comparisons` - Fetch report comparisons

## Database Schema

### Tables

- **users** - User profiles (extends Supabase auth.users)
- **health_documents** - Uploaded document metadata
- **health_reports** - AI-extracted health data
- **test_comparisons** - Trend analysis between tests

### Key Features

- Row Level Security (RLS) enabled
- Automatic user creation triggers
- Optimized indexes for performance
- JSONB for flexible data storage

## AI Processing

The application uses OpenAI GPT-4 to:

1. **Extract structured data** from health documents
2. **Identify abnormal values** and flag them
3. **Generate health summaries** with recommendations
4. **Compare test results** and identify trends
5. **Provide medical insights** based on the data

## Security Features

- Supabase Row Level Security (RLS)
- JWT-based authentication
- File type and size validation
- Secure file storage
- Data encryption at rest

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.

---

**Note**: This application is for educational and personal use. Always consult with healthcare professionals for medical advice.