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

##  Technical Challenges Faced and Solutions

### Live Preview

#### Problem:
    If shapes are made along with user mouse movement then instead of only drawing completed shape, multiple copies of shapes are made along the way.
#### Solution - used an array
    At the end when user releases the mouse final shape is stored in array. Then whole canvas is then cleared and shapes from array are redrawn.

#### Canvas Sizing

#### Problem:
    Canvas element uses a fixed width and height. As a result the drawing area did not adapt correctly to different screen sizes or window resizes, leading to layout and responsiveness issues.
#### Solution 
    Added an observer to container of canvas to observe change in size. whenever change is detected, canvas size is adjusted accordingly to always fit its parent container making it responsive. Also since it erases all drawings due to change in size, all drawings are redrawn from array mentioned in live preview problem.