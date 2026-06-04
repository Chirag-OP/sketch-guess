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
- Basic Drawing and Chat synchronization -> needs upgrades

## Planned
- undo redo buttons
- colors and brush size
- rooms logic
- landing page for user login 
- showing joined users
- guarented delivery from server to client using database

## Design Decisions and their Reasons

### Why Nanoid for Unique Room ID generation?
**Initial approach:** Generate an ID by hashing a combination of 
username + timestamp with a secret key.

**Problem:** these type of hashes produce long outputs (32-64 chars) and
truncating to make them shareable increases collision probability 
significantly. Since each digit can be hexadecimal i.e 0-9 or a-f i.e 16 values

**Decision:** so i decided to use Nanoid since its specifically designed to produce short unique IDs with minimal chance of collision. Since Its default alphabet contains 64 URL-safe characters


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

