# Sketch Guess
A real-time collaborative drawing application that allows multiple users to draw together on a shared canvas.

## Status

🔨 Currently Building

## Tech Stack

### Frontend
- React
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Socket.IO

## Completed Features
- Canvas free-hand drawing
- basic shape tools
- Drawing and Chat synchronization
- rooms logic with showing joined users and chat
- Word selection system
- Automatic word selection on timeout
- showing selected word to drawer and its encoding to guessers
- correct guess logic and displaying guessed correctly

## Planned
- undo redo buttons
- colors and brush size
- guarented delivery from server to client using database
- round end logic
- auto round end on timer end
- update player points logic
- like unlike drawing option
- room host can kick or accept players
- player turn logic
- shop logic to cast buff debuff
- private/ public room logic
- global leaderboard

## Design Decisions and their Reasons

### Why Nanoid for Unique Room ID generation?
**Initial approach:** Generate an ID by hashing a combination of 
username + timestamp with a secret key.

**Problem:** these type of hashes produce long outputs (32-64 chars) and
truncating to make them shareable increases collision probability 
significantly. Since each digit can be hexadecimal i.e 0-9 or a-f i.e 16 values

**Decision:** so i decided to use Nanoid since its specifically designed to produce short unique IDs with minimal chance of collision. Since Its default alphabet contains 64 URL-safe characters. Moreover it produces more share friendly joinCodes.

#### Using Local storage
**Initial approach:** use local storage to store playerID to prevent score loss on reconnection

**Problem:** But this give rise to another Problem of overWriting player details if that same player rejoins from same browser using different name. Also to prevent this if i tend to store username in url parameter then link won't be shareable

**Decision:** Using Session Storage to store the playerID for that session only hence preventing overwriting on new tab and still playerID persists on tab reload

#### Global Socket
**Initial approach:** using a global socket for all the pages of app

**Problem:** With this approach socket is created at landingPage which lasts for all pages.But if after someone joins the game and then goes back to the landing Page, now since socket has already joined the previous room, i have to remove previous joined rooms before letting him enter a new room. Moreover if after joining the game room reloads the game window now the original socket which had joined the room gets disconnected and a new socket is made for which i have to again call join room. Moreover

**Decision:** So this problem points that either i should create a new socket everytime a player enters game page or use a global socket but handle the extra remove previous room logic. So i created a seperate socket for game Page.



##  Technical Challenges Faced and Solutions

### Live Preview

**Problem:**
If shapes are made along with user mouse movement then instead of only drawing completed shape, multiple copies of shapes are made along the way.

**Solution:** I used an array.
At the end when user releases the mouse final shape is stored in array. Then whole canvas is then cleared and shapes from array are redrawn.

### Canvas Sizing

**Problem:**
Canvas element uses a fixed width and height. As a result the drawing area did not adapt correctly to different screen sizes or window resizes, leading to layout and responsiveness issues.

**Solution:**
Added an observer to container of canvas to observe change in size. whenever change is detected, canvas size is adjusted accordingly to always fit its parent container making it responsive. Also since it erases all drawings due to change in size, all drawings are redrawn from array mentioned in live preview problem.

### Player Data storage on Frontend
**Problem:**
I originally used UseRef to store player data in a map.But since useRef doesn't trigger rerender any new players joined won't show up in playerList

**Solution:**
I swtiched to using UseState but since a map declared as useState doesn't allow direct insertion of element, so during SetPlayerList i declare a new map same as my previous map and then append new player Data in it and return the new map

### Round Information Synchronization
**Problem:**
The server emits roundInfo when new turn begins but sometimes since canvas Page hasn't reached rendering stage where it can accept the info hence it was missed. The main reason for this was since the roundInfo was generated on sent from landing page to server but utilized by canvas Page. so server never new when the canvas Page is ready to accept that info

**Solution:**
Implemented reqRoundInfo.<br>
So now whenever canvas Page is ready or need the round info it requests the server and server responds with the info. Hence ensuring the data recieve is never missed

### Different Views for Drawer and Guessers

**Problem:**
When a round starts, the drawer must see the actual word while every other player should only see its encoded form (i.e `_____`).This same logic should work even when the server automatically selects a word after the choosing timer expires, where no frontend socket event is available.

**Solution:**
Stored the current drawer's `socketID` on the server and used targeted Socket.IO emissions:
- `io.to(drawerSocketID).emit(...)` to send the actual word only to the drawer.
- `io.to(roomID).except(drawerSocketID).emit(...)` to send the encoded word to every other player.
This allowed the server to initiate the transition to the playing phase regardless of whether the word was chosen by the player or automatically after a timeout.
