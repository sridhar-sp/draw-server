# Draw & Guess Game Server

![CodeQL](https://github.com/half-blood-prince/draw-server/workflows/CodeQL/badge.svg?branch=master)

A Backend server helps to create/join a drawing game.

---

## Requirements

For development, you will need Node.js, npm and Redis installed in your environement.

## Install

    $ git clone https://github.com/half-blood-prince/draw-server
    $ cd draw-server
    $ npm install

## Run server

Start the application server

    $ npm start

This project is configured with the 'ts-node-dev'. If you make some changes and wanted those changes apply immediately without restarting the server. Use the below command to start the application

    $ npm run dev

## Docs

Run `/api-docs` end point to get the full api documentation

Usecase and sequence diagrams can be found [here](https://half-blood-prince.github.io/draw-server)
