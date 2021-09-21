# Draw & Guess Game Server

![CodeQL](https://github.com/sridhar-sp/draw-server/workflows/CodeQL/badge.svg?branch=master)

A multi-player drawing game to play with your friends & family.

This is a drawing game where one player draw a given word and others will try to guess the word. Each player will take a turn on drawing and guessing. The scores will be assigned based on how quick participant guessed the word and how well their drawing is understood by other players.


## Requirements

* Local development will need Node.js, npm, Redis and RabbitMQ installed in your environement. 
* The application is dockerized so you can use docker also for local development.


## Install

    $ git clone https://github.com/sridhar-sp/draw-server
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
* [Usecase and sequence diagrams](https://sridhar-sp.github.io/draw-server)

## Credits

The sequence diagrams are created using [js-sequence-diagrams](https://bramp.github.io/js-sequence-diagrams/)

## Android client application
<a href='https://play.google.com/store/apps/details?id=com.gandiva.draw'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png'/></a>


<details><summary>See client application screens</summary>
<table >
  <tr>
    <th><img src="https://play-lh.googleusercontent.com/11Yfl672NhsQWjj5bA9bKis9cnPTy1Hpv_vj-PWm0-CTMp3-UnLF5ElKAopBibQocnQ" /> </th>
    <th><img src="https://play-lh.googleusercontent.com/Zx6bCDPEefyndkRlb7zae3OKMjfAKBNiHl0eNWDePbVGJS7n7EEITGygHIR-bx4pu3Q" /> </th>
    <th> <img src="https://play-lh.googleusercontent.com/lOSWzo1dW1UIDHhKBDB1k9-DyF2IEcA2GUnDfdty4xiaiIRqWjnUT1j0mHeWm_jx1wZF" /></th>
    <th> <img src="https://play-lh.googleusercontent.com/WTDuKa_DGTW0dremkCf8HkRhkWn9-A2MfqPJx8RzpAFJw-A8gwDYJmby-cMPwH1ABxo" /> </th>
  </tr>
    
  <tr>
    <th><img src="https://play-lh.googleusercontent.com/ThDtpsIeCAbxRh0jWlxbq6UXF3B7SVQP3kKbGYmTFF82KW35v4Ym1vnMyoqmlWLTCZU" /> </th>
    <th><img src="https://play-lh.googleusercontent.com/YIcNnw_3l6mbizefaj7MGZ0_kMtnMC5tuCDr_T77X-aCw_k9GJuJ6Uw7AMJiWHIPvg" /> </th>
    <th> <img src="https://play-lh.googleusercontent.com/FgLmSLW13LkcPhHJnTK6bUnFdHqJ0qK5XHTnByPCJQDRxvQM-yvLeIaCXZ6OA1KkNA" /></th>
    <th> <img src="https://play-lh.googleusercontent.com/i1MuWmyaU6WaBfcyot__vGOF-pfF0_BCFMqesyIYRRkB7GFZvgmtJrVrrmfd95dYyfc" /> </th>  
  </tr>
</table>   
</details>


