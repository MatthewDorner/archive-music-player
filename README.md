##Archive Music Player

This is a demo app I used to help myself learn React. I used some boilerplate code from these tutorials:

https://blog.cloudboost.io/creating-your-first-mern-stack-application-b6604d12e4d3

https://www.djamware.com/post/5a90c37980aca7059c14297a/securing-mern-stack-web-application-using-passport


The application uses archive.org's public API to allow a user to search for and play music from archive.org's collection of public-domain Grateful Dead recordings. A demo is available here: http://archive-music-player-archive-music-player2.1d35.starter-us-east-1.openshiftapps.com/

It uses MongoDB to allow a user to create an account and then save a list of their favorite recordings.

To set up:

Go to server/config/settings.js
These are the environmental values needed for the app: your mongoDb connect string, and an appropriate secret for password encryption.

then run:

npm install
npm start

Then you should be able to access the app on localhost:8000.
