

// class partner {
//     constructor(name) {
//         this.confidenceVariance = 10;
//         this.confidenceMean = 25;
//         this.accuracy = 75
//     }
// }
// partner1 = new partner("partner1")
//
//


let accuracy = 75;                  //change later
let confidenceVariance = 10;         //change later
let confidenceMean = 25;            //change later

function partner(accuracy, confidenceVariance, confidenceMean) {
    var partnerChoice;
    var random = Math.random();
    if (random > accuracy) {
        if (majoritySide == "left") {
            partnerChoice = "left"
        } else if (majoritySide == "right") {
            partnerChoice = "right"
        }
    } else {
        if (majoritySide == "left") {
            partnerChoice = "right"
        } else if (majoritySide == "right") {
            partnerChoice = "left"
        };
    };

    let partnerConfidence = confidenceMean + confidenceVariance; //change later to sampling from distribution

    var partnerMarker = createGeneral(
        partnerMarker,
        noDragSlider,
        'div',
        'marker ' + name,
        'partnerMarker',
        ''
    );
    if (partnerChoice == "left") {
        $('.partnerMarker').css('left', partnerConfidence + '%');
    } else if (partnerChoice == "right") {
        $('.partnerMarker').css('left', 50 + partnerConfidence + '%');
    };

};

partner()