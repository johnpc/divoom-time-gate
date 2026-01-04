# Divoom Time Gate

TypeScript script to display Home Assistant status on Divoom Time Gate screens.

## Features

- **Screen 1**: Heated stairs status (OFF/1 ON/2 ON)
- **Screen 2**: Smart locks status (LOCKED/X/2 LOCKED)
- **Screen 3**: Garage door status with timestamp
- **Screen 4**: Weather information
- **Screen 5**: Lights count

## Setup

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run the script:
```bash
npm start
```

### Docker

1. Create `.env` file with your configuration

2. Run with docker-compose:
```bash
docker-compose up -d
```

Or pull from Docker Hub:
```bash
docker pull mrorbitman/divoom-time-gate:latest
```

## Environment Variables

- `DIVOOM_IP` - IP address of your Divoom Time Gate
- `HOME_ASSISTANT_URL` - Your Home Assistant URL
- `HOME_ASSISTANT_TOKEN` - Home Assistant long-lived access token
- `SLEEP_DURATION` - Update interval in seconds (default: 300)

## Development

- `npm start` - Run the script
- `npm run preview` - Generate images without sending to device (dry-run mode)
- `npm run build` - Compile TypeScript
- `npm run lint` - Check for linting errors
- `npm run format` - Format code with Prettier

Generated images are saved to the `generated/` directory for review.
