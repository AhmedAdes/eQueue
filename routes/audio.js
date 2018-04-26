/* 
fluent-ffmpeg

Must have those files  ffmpeg.exe , ffprobe.exe  and then set their path as below 
point to your deisred path , for other OS , check NPM website 

ffmpeg.setFfmpegPath(path.join(__dirname, '../bin/ffmpeg.exe'));
ffmpeg.setFfprobePath(path.join(__dirname, '../bin/ffprobe.exe'));
*/

var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var ffprobe = require('ffprobe')
var ffmpeg = require('fluent-ffmpeg');
var path = require('path')

ffmpeg.setFfmpegPath(path.join(__dirname, '../bin/ffmpeg.exe'));
ffmpeg.setFfprobePath(path.join(__dirname, '../bin/ffprobe.exe'));

var filePath = path.join(__dirname, '../audio/');
var fs = require('fs');
var audFiles = [],
    soundNames = []
var stream, currentFile;


router.post("/audio", function (req, res, next) {

    var command = new ffmpeg();
    soundNames = playQAud(req.body.ticket, req.body.audioLang);
    soundNames.forEach(function (soundName) {
        command = command.addInput(filePath + req.body.audioLang + "/" + soundName);
    });

    command.mergeToFile(filePath + 'all.mp3')
        .on('error', function (err) {
            console.log('Error ' + err.message);
        })
        .on('end', function () {
            var stat = fs.statSync(filePath + 'all.mp3');
            res.header("Access-Control-Allow-Origin", "*");
            res.writeHead(200, {
                "Conten-Type": "audio/mpeg",
                "Content-Length": stat.size
            });
            fs.createReadStream(filePath + 'all.mp3')
                .pipe(res)
                .on('finish', () => {
                    res.end();
                })
        })
});

function playQAud(tickets, audioLang) {
    let qNum = 0;
    let letter;
    let paths = [];

    for (let i = 0; i < tickets.length; i++) {
        qNum = parseInt(tickets[i]['ServiceNo'].substr(0, 4));
        letter = tickets[i]['ServiceNo'].substr(5, 1);

        paths.push('tone.mp3');
        paths.push('client.mp3');
        paths.push('number.mp3');

        switch (audioLang) {
            case 'ar':
                if (qNum < 20) {
                    paths.push(qNum + '.mp3');
                } else if (qNum > 20 && qNum < 100) {
                    if (qNum.toString().substr(1, 1) == '0')
                        paths.push(qNum + '.mp3');
                    else {
                        paths.push(qNum.toString().substr(1, 1) + '.mp3');
                        paths.push('and.mp3');
                        paths.push(qNum.toString().substr(0, 1) + '0' + '.mp3');
                    }
                }
                break;
            case 'fr':
                if (qNum <= 100) {
                    paths.push(qNum + '.mp3');
                } else if (qNum > 100) {
                    let hundreds = parseInt(qNum.toString().substr(0, 1))
                    let tens = parseInt(qNum.toString().substr(1, 2))

                    if (hundreds == 1) {
                        paths.push('100.mp3');
                        paths.push(tens + '.mp3');
                    } else {
                        paths.push(hundreds + '.mp3');
                        paths.push('100.mp3');
                        paths.push(tens + '.mp3');
                    }
                }
                break;
            case 'en':
                if (qNum < 20) {
                    paths.push(qNum + '.mp3');
                } else if (qNum > 20 && qNum < 100) {
                    if (qNum.toString().substr(1, 1) == '0')
                        paths.push(qNum + '.mp3');
                    else {
                        paths.push(qNum.toString().substr(1, 1) + '.mp3');
                        paths.push('and.mp3');
                        paths.push(qNum.toString().substr(0, 1) + '0' + '.mp3');
                    }
                }
                break;
        }

        paths.push(letter + '.mp3')
        paths.push('Window.mp3')
        paths.push('number.mp3')
        paths.push(tickets[i]['ProvWindow'] + '.mp3')
        console.log(paths)
    }
    return paths;
}
module.exports = router;