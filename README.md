# README

## Local Setup Instructions

- Have Node version `8.10.x` installed.
- Run `yarn install`.
- Have Ruby version `2.3.3` and Bundler installed.
- Run `bundle install`.
- Ensure that you can run the webpack server: `bin/webpack-dev-server --hot`.
- Install MongoDB and ensure that you can run the MongoDB server: `mongod --config /usr/local/etc/mongod.conf`.

## Run Instructions

- Start the webpack server: `bin/webpack-dev-server --hot`.
- Start the mongodb server: `mongod --config /usr/local/etc/mongod.conf`.
- Start the Rails server: `rails s`.
- Go to `localhost:3000` to access the app.

## Production Hosting Details

The production app is currently hosted on Heroku. The app name is `harvest-rails`. The app is accessible at the URL https://staffing.exygy.com. The app is currently set to use basic HTTP authentication in production. You can find the username and password in LastPass under the name "Exygy Staffing App". The username and password are set via Heroku environment variables.
