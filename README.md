# TinyApp - A Lighthouse Project
This app is a URL Shortener is a service that takes a regular URL and transforms it into an encoded version, which redirects back to the original URL. For example:

https://www.lighthouselabs.ca → http://goo.gl/6alQXu

## Features
List of all the generated shorten URL and you can edit the URL anytime or delete the URL.
!["Screenshot 1"](docs/url_listing.png)

To create the URL simply just type the long URL into the input box and hit Submit button.
!["Screenshot 1"](docs/url_new.png)

This is the result after the URL is shorten and you can edit the URL for correction.
!["Screenshot 1"](docs/url_edit.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## How to use
1. After cloning this repo.
2. Run `npm install` to intall the app.
2. Run `npm start` to run the app.
3. Go to your browser and enter 'http://localhost:8080'