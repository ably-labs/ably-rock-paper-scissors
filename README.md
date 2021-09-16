# ably-rock-paper-scissors

This project contains a multiplayer game in which players battle as ever-changing hand shapes of rock, paper, and scissors.

## Running it

Firstly, [sign up to Ably](https://ably.com/signup) to get a free Ably Account. Go to one of your Ably Account's [Apps](https://ably.com/accounts/any/apps/any), and get an [API key](https://ably.com/accounts/any/apps/any/app_keys) for it.

Once you have the API key, create a `.env` file, and add the API key as:

```
API_KEY={your Ably API key}
```

With that, simply run `npm run` to start up a server!

Navigate to `localhost:3000` if you're running it locally to access the game's welcome page.

## About the game
You will appear on a map as a hand. You will be either rock, paper or scissors.

If you collide with another player, then one of you will be defeated if you are different hand shape.

* Paper defeats rock
* Rock defeats scissors
* Scissors defeats paper

Every 5 seconds, everyone's colour and shape will change. Each player you defeat gets you a point. Good luck!
