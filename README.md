# AI Chatbot Component

This is a React component for an AI chatbot interface with various features and customization options.

![image](https://github.com/user-attachments/assets/73997737-e287-4c2e-b535-161c25cd24a9)

## Features

- Real-time chat interface with user and bot messages
- Message reactions (like/dislike)
- Markdown rendering for messages
- Customizable bot text box color
- Error handling and toast notifications
- Automatic scroll to bottom
- Poor conversation detection with customer support option

## Dependencies

This component uses the following main dependencies:

- React
- date-fns
- lucide-react
- react-markdown
- remark-gfm
- shadcn/ui components

Make sure to install these dependencies before using the component.

## Usage

To use this component in your React application:

1. Import the component:

   ```jsx
   import { AiChatbot } from './path/to/AiChatbot';
   ```

2. Use the component in your JSX:

   ```jsx
   <AiChatbot />
   ```

## Customization

The chatbot interface allows users to customize the color of the bot's text box. This is done through a settings popover that sends a color prompt to a backend API.

## API Endpoints

The component expects two API endpoints:

1. `/api/chat`: For sending and receiving chat messages
2. `/api/botcolor`: For fetching a custom color for the bot's text box

Ensure these endpoints are set up in your backend to handle the respective requests.

## Styling

The component uses Tailwind CSS classes for styling. Make sure your project is set up with Tailwind CSS to maintain the intended appearance.
