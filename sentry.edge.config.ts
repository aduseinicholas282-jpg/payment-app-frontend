import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4938e4b34c1ae14a8d546fc369cef9e4@o4511762892652544.ingest.de.sentry.io/4511762940559440",
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
});
