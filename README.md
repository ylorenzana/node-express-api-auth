# Node.js + Express.js Authentication API Boilerplate

This is a project meant to be used as a starting point for APIs that require user sign up/sign in and authentication. Meant to be consumed by a SPA. **This is a WIP**, if you find any issues or concerns with the security of the implementation, please, open a new issue or contact me directly [@yanglorenzana](https://twitter.com/yanglorenzana) on Twitter. PR's are of course, also welcome!

TODO:

- Currently researching and working on a password reset mechanism
- ~~Another security mechanism against CSRF~~ :heavy_check_mark:
- Request throttling

Tried following [json:api](http://jsonapi.org/) specification for the design of the API for the error responses, but didn't get a good example for other response objects.

The auth system uses 16 random bytes generated with the node.js crypto module as authentication tokens.

Project uses mongoose.js for data modeling and express.js for easy server setup.

## Project Setup

To run project locally:

- Clone repo
- `npm install` in root directory
- Add your mongoDB uri to `secrets.js` file or add it to your ENV variables
- `npm start` to run nodemon in watch mode
- Use [postman](https://https://www.getpostman.com/) to test endpoints or curl if you're cool

## Overview of auth system:

1.  User registers account. Password is hashed and salted with bcrypt and is stored in database
2.  User enters credentials, server validates credentials. If valid, a random 16 byte token is generated and stored in database along with the user ID of the requesting user
3.  Token is set in a cookie along with the server's response
4.  Client includes cookie on subsequent requests.
5.  Protected endpoints send request through authentication middleware, which checks token received in request to exist in database and have a status of 'valid'. Only endpoints that use the authentication in this project are the api/users/me and api/users/logout, to be used as examples of how it would work
6.  To logout, client would send request to api/users/logout with their auth token. If token exists and is valid, set its status as 'expired'

### CSRF Protection

1.  Implemented CSRF-tokens for CSRF mitigation. Read more at 'Synchronizer (CSRF) Tokens' section of [OWASP CSRF Prevention](<https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet#General_Recommendations_For_Automated_CSRF_Defense>)
2.  Added new key to session schema. Every session now includes csrfToken key.
3.  Whenever a new user registers or existing user logs in, a new session is initialized. Sessions now require a csrfToken to be generated along with the original bearer token (using the same `generateToken()` method).
4.  Once session is initalized, server sets bearer token in a token cookie, but also responds with the session's csrf-token in body.
5.  This csrf-token **must** be attached to the headers of every request as `csrf-token: 'YOUR TOKEN HERE'` that _would change/modify server-side state_. In this case, the `DELETE api/users/me` and `PUT api/users/logout` routes require a csrf token.
6.  Protected routes use `csrfCheck` middleware. This middleware should be added to any route that would change state. The csrfCheck for the delete user route is somewhat redundant as it requires the user to provide credentials, but I included it to serve as example.

An example of login route response and placing the csrf-token in headers:

[![postman-example.png](https://s33.postimg.cc/6723bdo8v/postman-example.png)](https://postimg.cc/image/wfd80r8cb/)

## License

[MIT](https://github.com/ylorenzana/node-express-api-auth/blob/master/LICENSE)

Feedback and PR's welcome. Follow me [@yanglorenzana](https://twitter.com/yanglorenzana), DM's always open.
