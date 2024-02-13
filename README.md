# Code Duel
As a personal project, I built this coding platform which lets players compete against each other to solve coding challenges. 
It's organized into game rooms where users can join, chat amongst themselves, and choose a coding problem to solve. Then, under a time limit, users compete against each other to be the first one to solve the coding problem.

This project also involved creating a code execution service, which is in its own repo at code-execution-microservice.

# How to play
Once you've made an account, you will have the ability to create rooms or join rooms. Create or join a room, and optionally wait for other people to join your room.

In the room, you can adjust the following settings:
* The difficulty - this controls which problems you can pick
* The time limit - from 5 to 60 minutes
* The coding problem

Once you're in the actual game, you will be able to see the full details of the coding problem and begin coding your solution.

For now, you can choose from the following programming languages:
* Python
* Go
* Bash (shell)

Some of these may be buggy, but the most thoroughly tested language is Python, so that's what I recommend in general.

When you submit a code solution, the code execution service will run your code and return the output, as well as any error information. This will show in the console at the bottom of the screen.
The first person to pass all test cases will win the game. If the time expires, then whoever has passed the most test cases so far will win.

# Technical Details

## Stack
Here are the details of the tech stack:

Front end:
* React
* Typescript
* Vercel (for deployment of client)

Back end:
* Go
* Firebase
  * auth
  * Firestore db (noSQL)
* Fly.io (for deployment of backend)

## Features
I made this project mainly as a challenge for myself to learn some new concepts and practice new skills. Here are some interesting things I worked with during this project:

### Backend
As a challenge, I decided to code this in Go, a language I'm just now being introduced to. It was a great way to get my hands dirty and make me learn, so it was a lot of fun. Using Go on the backend, I made APIs for authentication, websocket connections, database actions, and also managing game sessions.

#### Authentication
For authentication, technically the front end handles logging users in with their credentials, but once the client receives a token from firebase, that token is validated on the server immediately during the login process, and also whenever a protected API endpoint is accessed (via a custom authentication middleware).

#### Websocket Handling
A big part of this project is the websocket handling. Websocket connections are used for users who join a room, and those connections are maintained throughout to handle chat messages, room updates (when the room owner changes settings), game updates (when a player passes test cases for their code solution), and more.

When first establishing the socket connection, the server waits for an authentication message that contains the firebase JWT, and verifies it to make sure the user is authenticated. Then, it assumes its normal behavior of relaying messages to other clients.

The websocket connections are also used for noticing when a user leaves a room suddenly. If the connection is cut unexpectedly (e.g. the user goes to the homepage without using the "Leave" button) then it treats it as the user leaving, and handles removing them from the room/game.

#### Managing game sessions
Game sessions are managed as part of the state of the actual server; this limits the scalability of the server, but I think that's okay considering my current number of daily active users is approximately 0 :). In the future, I may consider storing the game session state in firestore somehow, so that these servers can be stateless and scaled up easier.

Nevertheless, game sessions are initialized and then maintain a "game loop" that ticks ever minute, checking if the game has expired yet. Each client also counts down on their own, but once the server's game loop expires, it broadcasts a game over message to all connected clients, which includes the winner information.

#### Code execution
This was one of the more difficult parts of this project. To see more details about how the code is actually executed and its output obtained, see the code-execution-microservice repo.

One of the tricky parts about this was figuring out a way to standardize adding input values to code snippets, and making them runnable so their output would be captured. In short, we keep special variables in the code snippet string that can be replaced by formatting the string to insert input values.
This can work pretty easily when only one programming language is considered, but since this is supporting the execution of several languages, I had to create code that formats input values to strings that are correct for the supported languages (e.g. an array in Python has different syntax than in Go, and booleans are written differently, etc).
Not only the input, but capturing the output and comparing it with what's expected also has this same problem. Capturing output from python will show data types differently than in Go, so there needed to be some standardization and conversion of data types to strings.

This process can still be improved, and will likely be updated in the future as we support more complicated inputs and outputs for coding problems.

### Frontend
The frontend was just made using Typescript and React; so pretty standard stuff overall. I'll highlight the interesting pieces below.

#### Realtime websocket connections
This was also my first time working with websocket connections to enable realtime communication between different clients. 
This was primarily implemented for creating chat rooms, but it was also used for updating rooms with the settings as they are changed in real time, as discussed in the back-end section.

I ended up making my own implementation of websocket handling (instead of using a common package like Socket.io), just because I thought it would be good experience and it would give me more insight into how it actually works.

The main challenges at first were handling connecting to the server, and keeping that connection stable; there were lots of issues like connections opening and closing repeatedly, connections disconnecting unexpectedly, etc, and most of those things worked out to being related to funky things going on with state management and mounting in React.
Eventually, I ended up with a WebsocketProvider component that I could wrap around other components to give access to websocket hooks down the component hierarchy. This was really beneficially because I could easily control access to websocket messages and subscribing listener callbacks as needed.

#### Code Editor
Including this just as an interesting tidbit, but for the code editor I chose to use Monaco Editor; this is the editor that powers VS code, so it works very smoothly and has a familiar UI to developers. 
If you are looking to make a coding platform of some kind, I'd recommend this just due to how easy it is to plug into your project and use right away.
