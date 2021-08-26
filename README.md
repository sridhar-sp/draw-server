# Draw & Guess Game Server

![CodeQL](https://github.com/half-blood-prince/draw-server/workflows/CodeQL/badge.svg?branch=master)

A multi-player drawing game to play with your friends & family.

This is a drawing game where one player draw a given word and others will try to guess the word. Each player will take a turn on drawing and guessing. The scores will be assigned based on how quick participant guessed the word and how well their drawing is understood by other players.


## Requirements

* Local development will need Node.js, npm, Redis and RabbitMQ installed in your environement. 
* The application is dockerized so you can use docker also for local development.


## Install

    $ git clone https://github.com/half-blood-prince/draw-server
    $ cd draw-server
    $ npm install

## Run server

Start the application server

    $ npm start

This project is configured with the 'ts-node-dev'. If you make some changes and wanted those changes apply immediately without restarting the server. Use the below command to start the application

    $ npm run dev

## Run using docker

    $ docker-compose up

## Docs

* Run `/api-docs` end point to get the full api documentation
* [Usecase and sequence diagrams](https://half-blood-prince.github.io/draw-server)

## Credits

The sequence diagrams are created using [js-sequence-diagrams](https://bramp.github.io/js-sequence-diagrams/)

## Android client application
<a href='https://play.google.com/store/apps/details?id=com.gandiva.draw&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/></a>
