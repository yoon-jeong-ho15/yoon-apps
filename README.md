# Hello Friends

A real-time chat and profile application built with Vite + React + TypeScript.

## Features

- 👤 **User Profile**: View user information and profile
- 💬 **Real-time Chat**: 1-on-1 and group chat with real-time messaging
- 🔔 **Notifications**: Unread message counts and notifications
- 🔒 **Authentication**: Secure authentication with Supabase Auth (email/password and Google OAuth)

## Tech Stack

- **Frontend**: Vite, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database & Real-time**: Supabase
- **Routing**: React Router v6
- **Animation**: Motion (Framer Motion)
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yoon-jeong-ho15/hello-friends.git
cd hello-friends
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase Authentication:
   - Go to your Supabase project dashboard
   - Navigate to **Authentication** > **Providers**
   - Enable **Email** provider
   - Configure email settings (optional: set up email templates)
   - **Enable Google OAuth** (optional but recommended):
     1. Go to **Authentication** > **Providers** > **Google**
     2. Enable the Google provider
     3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
        - Go to **APIs & Services** > **Credentials**
        - Create OAuth 2.0 Client ID
        - Add authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     4. Copy the Client ID and Client Secret to Supabase
     5. Save the configuration
   - **Important**: Make sure the `user` table schema matches the auth requirements
     - The `id` field should be a UUID and should match the Supabase Auth user ID
     - Required fields: `id`, `username`, `from`, `profile_pic`, `friend_group`
     - The `password` field can be empty for OAuth users

5. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
hello-friends/
├── src/
│   ├── components/      # React components
│   │   ├── chat/       # Chat-related components
│   │   ├── profile/    # Profile-related components
│   │   └── common/     # Shared components
│   ├── contexts/       # React Context providers
│   ├── lib/            # Utilities and data layer
│   │   ├── data/       # Database access functions
│   │   ├── supabase.ts # Supabase client
│   │   └── types.ts    # TypeScript types
│   ├── pages/          # Page components
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
└── ...config files
```

## Database Schema

The app uses the following Supabase tables:
- `user`: User information
- `chatroom`: Chat rooms
- `chatroom_member`: Chat room memberships
- `chat_message`: Chat messages
- `chat_read_status`: Message read status
- `notification`: User notifications

And the following RPC functions:
- `get_chatroom_data`: Fetch user's chatrooms
- `check_chatroom`: Check if chatroom exists
- `mark_chatroom_as_read`: Mark all messages in a chatroom as read
- `get_chat_messages_with_read_status`: Fetch messages with read status
- `get_unread_message_counts`: Get unread counts for all chatrooms

## Deployment

### AWS (S3 + CloudFront)
1. Build the project: `npm run build`
2. Upload the `dist/` folder to S3
3. Configure CloudFront to serve from the S3 bucket

### Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Vite configuration
3. Add environment variables in Vercel dashboard
4. Deploy

## License

MIT
