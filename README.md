# Node.js + Express.js Authentication API Boilerplate

This is a project meant to be used as a starting point for APIs that require user sign up/sign in and authentication.

TODO:

- Currently researching and working on a password reset mechanism
- Another security mechanism against CSRF.
- Throttle requests

Tried following [json:api](http://jsonapi.org/) specification for the design of the API for the error responses, but didn't get a good example for other response objects.

The auth system uses 16 random bytes generated with the node.js crypto module as authentication tokens.

Project uses mongoose.js for data modeling and express.js for easy server setup.

## Project Setup

To run project locally:

- Clone repo
- `npm install` in root directory
- Add your mongoDB uri to `secrets.js` file or add it to your ENV variables
- `npm start` to run nodemon in watch modes
- Use [postman](https://https://www.getpostman.com/) to test endpoints or curl if you're cool

## Overview of auth system:

1.  User registers account. Password is hashed and salted with bcrypt and is stored in database
2.  User enters credentials, server validates credentials. If valid, a random 16 byte token is generated and stored in database along with the user ID of the requesting user
3.  Token is set in a cookie along with the server's response
4.  Client includes cookie on subsequent requests.
5.  Protected endpoints send request through authentication middleware, which checks token received in request to exist in database and have a status of 'valid'. Only endpoints that use the authentication in this project are the api/users/me and api/users/logout, to be used as examples of how it would work
6.  To logout, client would send request to api/users/logout with their auth token. If token exists and is valid, set its status as 'expired'
