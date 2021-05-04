/**
 * @function drawDots()
 * @param {Object} parent - parent div
 * @param {string} canvasID - ID for the canvas object
 * @param {int} dotCount - minimum dot count
 * @param {Object} dotsStaircase
 * @param {boolean} moreRight - the greater dot count on the right?
 * @param {string} upperColor - colour for the right side of the scale
 * @param {string} lowerColor - colour for the left side of the scale
 * @param {Array} dots_tooltipLabels
 * @param {Array} dots_endLabels
 * @param {boolean} showPercentage = show percentage on scale?
 * @param {string} staircasingPractice - options for the "See Again" button: 'same', 'similar', 'off'
 * @param {int} waitTimeLimit - maximum wait time
 * @param {int} fixationPeriod
 * @param {int} dotPeriod
 * @param {int} transitionPeriod
 * @param {int} trialCount
 * @param {int} trialCounterVariable
 * @param {Object} trialDataVariable
 * @param {Object} permanentDataVariable
 * @param {boolean} isTutorialMode
 * @param {int} accuracyThreshold
 */

function drawDots(parent, canvasID, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, staircasingPractice, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled, partner) {

    // default variables
    var backendConfidence;
    var correctResponse;
    var jointCorrectResponse = NaN; //otherwise end of block feedback does not work :(
    var partnerCorrectResponse = NaN;
    var participantCorrectResponse = NaN;
    var sliderActive = true;
    var seeMore;  // set to true when more info is sought and the stimuli are shown a second time
    var stimulusPairs;
    var stimulusPairsSecond;
    var dotConfidences;
    var initialChoice;
    var partnerConfidences;
    var start_timer;
    var end_timer;
    var dotRTs; //reaction time for first dot decision
    var confidenceRTs; //reaction time until confidence is indicated
    var dotsSecondRTs; //reaction time for second dot decision in info seeking trials
    var infoChoiceRTs; //reaction time until choice between see more or final decision is made
    var accuracyThreshold = 60;  //threshold for practice trials (if we are in tutorialmode)
    var participant_chosen; //this is true/false whereas the other one counts
    var secondChoice;
    var changeOfMind;
    var brierConfidence;

    //if we are in the infoSeekingVersion, then determine if this trial will be an infoSeekingTrial
    //when blockCount=1 it means we are in the first block with partner 1 and we don't want info seeking trials
    //when blockCount=6 it means we are in the first block with partner 2 and we don't want info seeking trials
    var infoSeekingTrial;
    if (infoSeekingVersion === false || blockCount === 1 || blockCount === 6 || isTutorialMode===true) {
        infoSeekingTrial = false
    } else {
        infoSeekingTrial = trialOrder[trialCounterVariable];
    }

    if (infoSeekingTrial===true){
        seeMore = false;
    }

    // prevent context menu from opening on right click (context menu on right click enabled in case of "testing")
    // if (trialTypeOrder == "all") {
    //     document.addEventListener("contextmenu", function (e) {
    //         e.preventDefault();
    //     }, false);
    // }

    //change to the above if you want the contextmenu enabled in case of "testing"
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);


    // disable the cursor so that response is made with left/right mouse-click (enabled again after initial decision to use confidence slider
    $('.jspsych-content').css('cursor', 'none');


    // determine the parameters for the dot grids
    var dots, correctSide;
    var low = dotCount;
    var high;
    if (partner === "none") {
        high = Math.round(dotCount + dotsStaircase.getLast('logSpace'));
        dotCountHigherList.push(high);
        finalHigh = Math.round((high + Math.min.apply(Math, dotCountHigherList))/2);
    } else {
        high = finalHigh
    }
    var randomiser = Math.random();
    if (randomiser > 0.5) {
        dots = [low, high];
        correctSide = 'right';
    } else {
        dots = [high, low];
        correctSide = 'left';
    }
    trialDataVariable['correctSide'].push(correctSide) ;


    if (squirclesVersion === false) {
        stimulusPairs = dots;

        // draw the grid
        let grid = new DoubleDotGrid(dots[0], dots[1], {
                spacing: 100,
                paddingX: 6
            }
        );
        grid.draw(canvasID);
    } else {
        // determine the parameters for the squircles
        var total_circles = 8;
        var radius = 60;
        var color_sd = .1;
        // difference value will be staircased during practice mode
        // var color_means = [.5-4.5*difference, .5-3.5*difference, .5-2.5*difference, .5-1.5*difference, .5-0.5*difference,
        //     .5+0.5*difference, .5+1.5*difference, .5+2.5*difference, .5+3.5*difference, .5+4.5*difference];
        // var color_mean_level = randInt(0, 9); //anything from 1 to 10
        // var color_mean_two_level;
        //
        // console.log(difference);
        //
        // if (color_mean_level >= 5) {
        //     color_mean_two_level = color_mean_level - randInt(1, 5);
        // } else if (color_mean_level <= 4) {
        //     color_mean_two_level = color_mean_level + randInt(1, 5);
        // }
        //
        // var color_mean = color_means[color_mean_level];
        // var color_mean_two = color_means[color_mean_two_level];

        var color_mean = getRandomInt(1, 9-10*difference)/10;  //1 to 9 instead of 0 to 10 because of the variance around the mean
        var color_mean_two = color_mean + difference;

        console.log(color_mean);
        console.log(color_mean_two);
        console.log(difference);

        var moreRedSide = correctSide;
        var colours;
        if (moreRedSide === 'right') {
            colours = [Math.min(color_mean, color_mean_two), Math.max(color_mean, color_mean_two)];
        } else {
            colours = [Math.max(color_mean, color_mean_two), Math.min(color_mean, color_mean_two)];
        }
        stimulusPairs = colours;

        //draw the squircle stimuli
        drawSquircleStimuli(parent, canvasID, canvasWidth, canvasHeight, total_circles, radius,
            color_mean, color_sd, color_mean_two, moreRedSide);

        //cover half the stimulus
        var coverCanvas = document.createElement('canvas');
        div = document.getElementById("jspsych-canvas-sliders-response-stimulus");
        coverCanvas.id     = "coverCanvas";
        coverCanvas.width  = canvasWidth;
        coverCanvas.height = canvasHeight;
        coverCanvas.style.position = "absolute";
        div.appendChild(coverCanvas);

        var ctx = coverCanvas.getContext("2d");
        ctx.fillStyle = "black";
        var cy = coverCanvas.height/2;
        var cxl = coverCanvas.width / 2 - coverCanvas.width / 3;
        var cxr = coverCanvas.width / 2 + coverCanvas.width / 3;

        /*draw the left cover*/
        var sequence = myEvenLengthSequence(total_circles);
        for (i = 0; i < total_circles; i++) {
            if (sequence[i] === 1) {
                var angle = i * 2 * Math.PI / total_circles;
                var xl = cxl + Math.cos(angle) * radius;
                var y = cy + Math.sin(angle) * radius;
                ctx.beginPath();
                ctx.arc(xl, y, 21 - 0.5 * total_circles, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            }
        }

        /*draw the right cover*/
        var sequence = myEvenLengthSequence(total_circles);
        for (i = 0; i < total_circles; i++) {
            if (sequence[i] === 1) {
                var angle = i * 2 * Math.PI / total_circles;
                var xr = cxr + Math.cos(angle) * radius;
                var y = cy + Math.sin(angle) * radius;
                ctx.beginPath();
                ctx.arc(xr, y, 21 - 0.5 * total_circles, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            }
        }

    }



    // draw the stimulus masks
    var mask1 = createGeneral(
        mask1,
        document.getElementById('jspsych-canvas-sliders-response-stimulus'),
        'div',
        'grid-mask mask-left',
        'grid-mask-left',
        ''
    );

    var mask2 = createGeneral(
        mask2,
        document.getElementById('jspsych-canvas-sliders-response-stimulus'),
        'div',
        'grid-mask mask-right',
        'grid-mask-right',
        ''
    );


    //determine partner's p(correct) and then their choice
    // get p(correct) using randn_bm(min, max, skew) --> see helper.js
    var pCorrect;
    //p correct from normal distribution between 0.6 and 1 (mean 0.8)
    pCorrect = randn_bm(0.6, 1, 1);

    // pick correct response with p(Correct)
    var partnerChoice;
    var random = Math.random();
    if (random < pCorrect) {
        if (correctSide == "left") {
            partnerChoice = "left"
        } else if (correctSide == "right") {
            partnerChoice = "right"
        }
    } else {
        if (correctSide == "left") {
            partnerChoice = "right"
        } else if (correctSide == "right") {
            partnerChoice = "left"
        };
    };


    //given p(correct), determine partner's confidence according to c + (x - .5) * s + e
    //c is a constant do differentiate over- and under-confident partners (overconfident set to 0.6, underconfident set to 0.1)
    //s is the slope which I set to 0.8
    //e is random noise which I will sample from a normal distribution with m=0 and sd=.05
    var partnerConfidence;
    var partnerConfidenceMarker;
    var partnerConfidenceCorrect;
    var error;
    error = randn_bm(-0.05*3, 0.05*3, 1);
    if (partner == "underconfident") {
        partnerConfidence = 0.1 + (pCorrect - 0.5) * 0.8 + error;
        partnerConfidence = partnerConfidence*50;                     //change scale from 0-1 to 0-50
    } else if (partner == "overconfident") {
        partnerConfidence = 0.6 + (pCorrect - 0.5) * 0.8 + error;
        partnerConfidence = partnerConfidence*50;
    } else {
        partnerConfidence = 0   //if partner = none
    }


    // partner confidence marker on the slider
    if (partnerChoice === "left") {
        partnerConfidenceMarker = 50 - partnerConfidence
    } else {
        partnerConfidenceMarker = 50 + partnerConfidence
    }

    // partner confidence in the correct choice on scale from 0-100
    if (partnerChoice === correctSide) {
        partnerConfidenceCorrect = 50 + partnerConfidence
    } else {
        partnerConfidenceCorrect = 50 - partnerConfidence
    }

    if (partnerConfidenceCorrect > 50){
        partnerCorrectResponse = true;
    } else {
        partnerCorrectResponse = false;
    }


    if (partner === "none" || infoSeekingTrial === true) {
        partnerConfidences = undefined;
        partnerCorrectResponse = undefined;
    } else {
        partnerConfidences = partnerConfidenceCorrect;
    }



    // button name
    var buttonsToShow = {};
    buttonsToShow['submit'] = greenButtonName;
    buttonsToShow['moreInfo'] = yellowButtonName;


    // draw the slider
    var response_area = createGeneral(
        response_area,
        parent,
        'div',
        'response-area',
        'response-area',
        ''
    );
    var confidence_meter = noDragSlider('dots_slider', response_area, dots_tooltipLabels, dots_endLabels, buttonsToShow);


    // decision & confidence question
    var confidence_question = createGeneral(
        confidence_question,
        response_area,
        'div',
        'confidence-question',
        'confidence-question',
        '<h1>Which box contained more dots?</h1> (left click for left box, right click for right box)'
    );

    if (squirclesVersion === true) {
        document.getElementById('confidence-question').innerHTML = '<h1>Which circle was more red?</h1> (left click for left circle, right click for right circle)';
    }



    // reset the event loggers
    $('.submit-button').off('click');
    $('.more-button').off('click');
    $('.scale-row').off('mousemove').off('click');


    // hide the response area
    $('.confidence-question').css('visibility', 'hidden');
    $('.response-area').css('visibility', 'hidden');


    // hide the masks (i.e. show the stimulus)
    $('.grid-mask').css('visibility', 'hidden');
    // start the timer
    start_timer = Date.now();


    // left or right mouse-click for decision
    $(document).on('mousedown', function (event) {

        // turn off this event handler
        $(document).off('mousedown');

        // record the reaction time
        end_timer = Date.now();
        dotRTs = calculateRT(start_timer, end_timer);


        //skip some of the steps if we are in practice1 which is only used for staircasing (if (staircasingPractice != "practice1"))

        //time out for presenting blue box around chosen option (and confidence slider) as changes in screen can affect EEG signal

        setTimeout(function () {
            // enable the cursor
            $('.jspsych-content').css('cursor', 'auto');
            $('.grid-mask').css('cursor', 'auto');

            //restrict confidence slider to chosen side
            var sliderMask = createGeneral(
                sliderMask,
                document.getElementById('scale'),
                'div',
                '',
                'sliderMask',
                ''
            );

            //disable cursor for masked slider
            $('#sliderMask').click(function(event){
                event.preventDefault();
                return false;
            });


            // highlight the chosen box
            if (event.button == 0) {
                initialChoice = "left";
                $('.mask-left').css('border', '5px solid rgb(13, 219, 255');
                $('.mask-right').css('border', '5px solid rgba(0,0,0,0)');
                $('#sliderMask').css('left', '52%');
            } else if (event.button == 2) {
                initialChoice = "right";
                $('.mask-left').css('border', '5px solid rgba(0,0,0,0)');
                $('.mask-right').css('border', '5px solid rgb(13, 219, 255');
                $('#sliderMask').css('left', '-2%');
            }



            // make response area visible
            if (staircasingPractice !== "practice1") {
                $('.confidence-question').css('visibility', 'visible');
                document.getElementById("confidence-question").innerHTML = "<h1>Indicate your confidence with the slider below</h1>";
                $('.response-area').css('visibility', 'visible');
                start_timer = Date.now();
            } else {
                //use initial response rather than confidence rating to for "correct response" as fed into function when continue button is clicked
                if (initialChoice === correctSide) {
                    correctResponse = true;
                } else {
                    correctResponse = false;
                }
                //automatically trigger click on continue button
                setTimeout(function () {
                    buttonBackend('submit');
                }, 600)
            }
        }, 700);
    });


    // participant clicks on continue button
    function buttonBackend(type) {
        // turn off the button options
        $('.scale-button').addClass('invisible');

        // other options
        switch (type) {
            // yellow see again button is clicked
            case 'seeMore':
                seeMore = true;

                end_timer = Date.now();
                infoChoiceRTs = calculateRT(start_timer, end_timer);

                if (squirclesVersion === false) {
                    // easier dot grid
                    // clear the grids
                    var dotCanvas = document.getElementById('jspsych-canvas-sliders-response-canvas');
                    var context = dotCanvas.getContext('2d');
                    context.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
                    context.beginPath();


                    // update the dot difference
                    high = dotCount + Math.E ** (Math.log(dotsStaircase.getLast('logSpace')) + 0.5);
                    high = round(high, 0);
                    console.log(high);
                    //keep the same correct response
                    if (correctSide === "right") {
                        dots = [low, high];
                    } else {
                        dots = [high, low];
                    }
                    stimulusPairsSecond = dots;
                } else {
                    //hide the squircle covers (so they are not there the second time around)
                    var coverCanvas = document.getElementById("coverCanvas");
                    var ctx = coverCanvas.getContext("2d");
                    ctx.clearRect(0, 0, coverCanvas.width, coverCanvas.height);
                }


                // hide masks and response areas
                $('.mask-left').css('border', '4px solid rgb(255,255,255)');
                $('.mask-right').css('border', '4px solid rgb(255,255,255)');
                $('.response-area').css('visibility', 'hidden');
                $('.confidence-question').css('visibility', 'hidden');
                $('.grid-mask').css('visibility', 'hidden');
                $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'hidden');
                $('.more-button').remove();

                var fixationCross = createGeneral(
                    fixationCross,
                    document.getElementById('jspsych-canvas-sliders-response-wrapper'),
                    'div',
                    'fixation-cross see-again',
                    'fixation-cross',
                    '+'
                );

                setTimeout(function () {
                    document.getElementById('fixation-cross').remove();
                    $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'visible');

                    if (squirclesVersion === false) {
                        // redraw the canvas with new dot values
                        var gridNew = new DoubleDotGrid(dots[0], dots[1], {
                            spacing: 100,
                            paddingX: 6
                        });
                        gridNew.draw(canvasID);
                    }


                    // start the timer
                    start_timer = Date.now();


                    setTimeout(function () {
                        $('.grid-mask').css('visibility', 'visible');

                        setTimeout(function () {
                            sliderActive = true;
                            $('.confidence-question').css('visibility', 'visible');
                            document.getElementById("confidence-question").innerHTML = "<h1>Which box contained more " +
                                "dots?</h1> (left click for left box, right click for right box)</h1>";
                            if (squirclesVersion === true) {
                                document.getElementById('confidence-question').innerHTML = '<h1>Which circle was more red?</h1> (left click for left circle, right click for right circle)';
                            }
                            $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'visible');
                            document.getElementById('more-button').remove();
                            $('.submit-button').css('margin-left', '0');
                        }, transitionPeriod);
                    }, dotPeriod);
                }, fixationPeriod);



                // left or right mouse-click for decision
                $(document).on('mousedown', function (event) {

                    // turn off this event handler
                    $(document).off('mousedown');

                    // record the reaction time
                    end_timer = Date.now();
                    dotsSecondRTs = calculateRT(start_timer, end_timer);


                    // highlight the chosen box
                    if (event.button === 0) {
                        secondChoice = "left";
                        $('.mask-left').css('border', '5px solid rgb(13, 219, 255');
                        $('.mask-right').css('border', '5px solid rgba(0,0,0,0)');
                        $('#sliderMask').css('left', '52%');
                    } else if (event.button === 2) {
                        secondChoice = "right";
                        $('.mask-left').css('border', '5px solid rgba(0,0,0,0)');
                        $('.mask-right').css('border', '5px solid rgb(13, 219, 255');
                        $('#sliderMask').css('left', '-2%');
                    }


                    //record if second response was correct or false
                    changeOfMind = secondChoice !== initialChoice;

                    //show FINAL DECISION button
                    $('.submit-button').css('margin-left', 0);
                    setTimeout(function () {
                        $('.submit-button').css('visibility', 'visible');
                        // enable cursor for whole screen
                        $('body').css('cursor', 'auto');
                    }, transitionPeriod);

                });

                break;

            case 'finalDecision':
                //if see more is true then this is not the choice time anymore but simply the point at which the only option of final decision is clicked
                if (seeMore===false) {
                    end_timer = Date.now();
                    infoChoiceRTs = calculateRT(start_timer, end_timer);
                }

                //reset the button
                $('.submit-button').on('click', function () {
                    buttonBackend('submit');
                });


                if (strategicVersion === true) {
                    //show feedback
                    setTimeout(function () {
                        $('.submit-button').css('visibility', 'hidden');
                        if (seeMore === true) {
                            //second choice counts
                            if (secondChoice === correctSide) {
                                //correct
                                correctResponse = true;
                                overallScore++;
                                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(13,255,146)">CORRECT</h1>';
                            } else {
                                //incorrect
                                correctResponse = false;
                                document.getElementById('confidence-question').innerHTML = '<h1><highlight style="color: red">INCORRECT</highlight></h1>';
                            }
                        } else {
                            //initial choice counts
                            if (initialChoice === correctSide) {
                                //correct
                                overallScore++;
                                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(13,255,146)">CORRECT</h1>';
                            } else {
                                //incorrect
                                document.getElementById('confidence-question').innerHTML = '<h1><highlight style="color: red">INCORRECT</highlight></h1>';
                            }
                        }
                    }, 700);
                }


                //partners response not included in their accuracy percentage
                participantCorrectResponse = NaN; //participantCorrectResponse only counts group decision responses. correctResponse counts all responses.
                partnerCorrectResponse = NaN;
                jointCorrectResponse = NaN;


                //trigger submit button
                if (strategicVersion === true) {
                    //leave some time for feedback
                    setTimeout(function () {
                        buttonBackend('submit');
                    }, 2000);

                } else {
                    //trigger button directly when clicked
                    buttonBackend('submit');
                }

                break;

            default:
                // update the staircase if we are in practice mode (correctResponse is true or false such that dots stimulus becomes harder or off)
                if (partner === "none") {
                    dotsStaircase.next(correctResponse);
                    staircaseSteps++;
                    if (squirclesVersion === true) {
                        difference = 0.001*dotsStaircase.getLast('logSpace');
                    }
                }


                // calculate the wait time (this is from stimulus presentation until clicking continue, whereas RT is from stimulus presentation to initial choice via mouse-lick
                end_timer = Date.now();
                var waitTime = calculateRT(start_timer, end_timer);


                // clear the display on a timer
                setTimeout(function () {
                    document.getElementById('jspsych-canvas-sliders-response-wrapper').remove();
                    document.getElementById('response-area').remove();
                    console.log('that was trial ' + trialCounterVariable + ' of ' + trialCount);
                }, 500);


                //record trial data
                trialDataVariable['stimulus_waitTimes'].push(waitTime);
                trialDataVariable["dots_staircase"].push(dotsStaircase.getLast('logSpace'));
                trialDataVariable['isCorrect'].push(correctResponse);
                trialDataVariable['jointCorrect'].push(jointCorrectResponse);// this is for calculating the bonus
                trialDataVariable['partnerCorrect'].push(partnerCorrectResponse);
                trialDataVariable['participantCorrect'].push(participantCorrectResponse);
                trialDataVariable['stimulus_pairs'].push(JSON.stringify(stimulusPairs));
                trialDataVariable['participant_confidence'].push(dotConfidences);
                trialDataVariable['initial_choices'].push(initialChoice);
                trialDataVariable['partner_confidences'].push(partnerConfidences);
                trialDataVariable['stimulus_RTs'].push(dotRTs);
                trialDataVariable['confidence_RTs'].push(confidenceRTs);
                trialDataVariable['stimulus_second_RTs'].push(dotsSecondRTs);
                trialDataVariable['info_choice_RTs'].push(infoChoiceRTs);
                trialDataVariable['isTutorialMode'].push(isTutorialMode);
                trialDataVariable['partner'].push(partner);
                trialCounterVariable++;
                totalTrials++;
                trialDataVariable['trial_count'].push(totalTrials);

                trialDataVariable['participant_chosen'].push(participant_chosen);
                trialDataVariable['info_trial'].push(infoSeekingTrial);
                trialDataVariable['asked_more'].push(seeMore);
                trialDataVariable['stimulus_pairs_second'].push(JSON.stringify(stimulusPairsSecond));
                trialDataVariable['second_choices'].push(secondChoice);
                trialDataVariable['change_of_mind'].push(changeOfMind);


                // if current trial-number is less than total trial-number, call the drawFixation function and begin new trial
                if (trialCounterVariable < trialCount) {
                    setTimeout(function () { drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, staircasingPractice, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled, partner); }, 400);


                    // if current trial-number is equal to total trial-number, then evaluate accuracy and end the block
                } else {
                    // evaluate accuracy
                    setTimeout(function () {

                        if (strategicVersion === true) {
                            // if there is no partner, accuracy is based on individual responses, otherwise its based on joint decision accuracy
                            if (partner != "none") {
                                accuracy = round(meanNaN(trialDataVariable['jointCorrect']), 2) * 100;
                                participantAccu = round(meanNaN(trialDataVariable['participantCorrect']), 2) * 100;
                                partnerAccu = round(meanNaN(trialDataVariable['partnerCorrect']), 2) * 100;
                            } else {
                                accuracy = round(mean(trialDataVariable['isCorrect']), 2) * 100;
                            }
                        } else {
                            accuracy = round(mean(trialDataVariable['isCorrect']), 2) * 100;
                        }



                        //if we are in tutorial mode, practice trials need to be repeated in case accuracy is below accuracy threshold
                        if (isTutorialMode) {

                            if (accuracy >= accuracyThreshold) {
                                var section4_button = 'CONTINUE';
                                //var section4_text = 'Congratulations, your accuracy during the last set of trials was ' + accuracy + '%.';
                                var section4_text = 'Great, you are now ready to continue.';
                            } else {
                                var section4_button = 'REPEAT';
                                //var section4_text = 'Your accuracy during these trials was ' + accuracy + '%, which is below the required accuracy threshold. Please click "repeat" below to repeat the practice round.';
                                var section4_text = 'Your accuracy during these trials was below the required accuracy threshold. Please click "repeat" below to repeat the practice round.';
                            }

                            // set up feedback page
                            $('.jspsych-content-wrapper')
                                .css('width', '100%');

                            var section4 = createGeneral(
                                section4,
                                parent,
                                'section',
                                'tutorial-section section4',
                                'dots-tutorial-section4',
                                ''
                            );

                            var section4_title = createGeneral(
                                section4_title,
                                section4,
                                'div',
                                'tutorial-text',
                                'dots-tutorial-text4',
                                section4_text
                            );

                            $('#dots-tutorial-text4').css('font-size', '3vmax');

                            var section4_button = createGeneral(
                                section4_button,
                                section4,
                                'button',
                                'default-white-button glowy-box',
                                'dots-tutorial-continue',
                                '<div>' + section4_button + '</div>'
                            );


                            // if practice block was successful
                            if (accuracy >= accuracyThreshold) {

                                // we save the data

                                $('#dots-tutorial-continue').on('click', function () {
                                    //permanentDataVariable["block_accuracy"].push(accuracy);
                                    permanentDataVariable["isTutorialMode"].push(trialDataVariable["isTutorialMode"]);
                                    permanentDataVariable["partner"].push(trialDataVariable["partner"]);
                                    permanentDataVariable["dots_staircase"].push(trialDataVariable["dots_staircase"]);
                                    permanentDataVariable["trial_count"].push(trialDataVariable["trial_count"]);
                                    permanentDataVariable["stimulus_pairs"].push(trialDataVariable["stimulus_pairs"]);
                                    permanentDataVariable["correctSide"].push(trialDataVariable["correctSide"]);
                                    permanentDataVariable["participant_confidence"].push(trialDataVariable["participant_confidence"]);
                                    permanentDataVariable["initial_choices"].push(trialDataVariable["initial_choices"]);
                                    permanentDataVariable["partner_confidences"].push(trialDataVariable["partner_confidences"]);
                                    permanentDataVariable["isCorrect"].push(trialDataVariable["isCorrect"]);
                                    permanentDataVariable["jointCorrect"].push(trialDataVariable["jointCorrect"]);
                                    permanentDataVariable["partnerCorrect"].push(trialDataVariable["partnerCorrect"]);
                                    permanentDataVariable["participantCorrect"].push(trialDataVariable["participantCorrect"]);
                                    permanentDataVariable["stimulus_RTs"].push(trialDataVariable["stimulus_RTs"]);
                                    permanentDataVariable["confidence_RTs"].push(trialDataVariable["confidence_RTs"]);
                                    permanentDataVariable["stimulus_second_RTs"].push(trialDataVariable["stimulus_second_RTs"]);
                                    permanentDataVariable["info_choice_RTs"].push(trialDataVariable["info_choice_RTs"]);
                                    permanentDataVariable["stimulus_waitTimes"].push(trialDataVariable["stimulus_waitTimes"]);
                                    permanentDataVariable["block_count"].push(blockCount);

                                    permanentDataVariable["participant_chosen"].push(trialDataVariable["participant_chosen"]);
                                    permanentDataVariable["info_trial"].push(trialDataVariable["info_trial"]);
                                    permanentDataVariable["asked_more"].push(trialDataVariable["asked_more"]);
                                    permanentDataVariable["stimulus_pairs_second"].push(trialDataVariable["stimulus_pairs_second"]);
                                    permanentDataVariable["second_choices"].push(trialDataVariable["second_choices"]);
                                    permanentDataVariable["change_of_mind"].push(trialDataVariable["change_of_mind"]);

                                    // increase the block count
                                    blockCount++;

                                    saveCSV(subjectID, currentAttempt);

                                    // enable the cursor for the whole screen
                                    $('body').css('cursor', 'auto');

                                    // finish the trial
                                    jsPsych.finishTrial();
                                    return;
                                });


                                // if the practice block was not successful, we do not save the data and start a new block of trials
                            } else {
                                totalTrials = 100;
                                trialCounterVariable = 0;
                                // reset trial data variable
                                trialDataVariable = {
                                    trial_count: [],
                                    isTutorialMode: [],
                                    partner: [],
                                    dots_staircase: [],
                                    correctSide: [],
                                    initial_choices: [],
                                    participant_confidence: [],
                                    partner_confidences: [],
                                    participant_chosen: [],
                                    stimulus_pairs: [],
                                    isCorrect: [],
                                    jointCorrect: [],
                                    partnerCorrect: [],
                                    participantCorrect: [],
                                    info_trial: [],
                                    asked_more: [],
                                    stimulus_pairs_second: [],
                                    second_choices: [],
                                    change_of_mind: [],

                                    stimulus_RTs: [],
                                    confidence_RTs: [],
                                    stimulus_second_RTs: [],
                                    info_choice_RTs: [],
                                    stimulus_waitTimes: []
                                };
                                $('#dots-tutorial-continue').on('click', function () {
                                    setTimeout(function () { drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, staircasingPractice, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled, partner); }, 400);
                                });
                            }


                            // if we are not in tutorial mode
                        } else {
                            // we save the data

                            //permanentDataVariable["block_accuracy"].push(accuracy);
                            permanentDataVariable["trial_count"].push(trialDataVariable["trial_count"]);
                            permanentDataVariable["dots_staircase"].push(trialDataVariable["dots_staircase"]);
                            permanentDataVariable["isTutorialMode"].push(trialDataVariable["isTutorialMode"]);
                            permanentDataVariable["partner"].push(trialDataVariable["partner"]);
                            permanentDataVariable["stimulus_pairs"].push(trialDataVariable["stimulus_pairs"]);
                            permanentDataVariable["correctSide"].push(trialDataVariable["correctSide"]);
                            permanentDataVariable["participant_confidence"].push(trialDataVariable["participant_confidence"]);
                            permanentDataVariable["initial_choices"].push(trialDataVariable["initial_choices"]);
                            permanentDataVariable["partner_confidences"].push(trialDataVariable["partner_confidences"]);
                            permanentDataVariable["isCorrect"].push(trialDataVariable["isCorrect"]);
                            permanentDataVariable["jointCorrect"].push(trialDataVariable["jointCorrect"]);
                            permanentDataVariable["partnerCorrect"].push(trialDataVariable["partnerCorrect"]);
                            permanentDataVariable["participantCorrect"].push(trialDataVariable["participantCorrect"]);
                            permanentDataVariable["stimulus_RTs"].push(trialDataVariable["stimulus_RTs"]);
                            permanentDataVariable["confidence_RTs"].push(trialDataVariable["confidence_RTs"]);
                            permanentDataVariable["stimulus_second_RTs"].push(trialDataVariable["stimulus_second_RTs"]);
                            permanentDataVariable["info_choice_RTs"].push(trialDataVariable["info_choice_RTs"]);
                            permanentDataVariable["stimulus_waitTimes"].push(trialDataVariable["stimulus_waitTimes"]);
                            permanentDataVariable["block_count"].push(blockCount);

                            permanentDataVariable["participant_chosen"].push(trialDataVariable["participant_chosen"]);
                            permanentDataVariable["info_trial"].push(trialDataVariable["info_trial"]);
                            permanentDataVariable["asked_more"].push(trialDataVariable["asked_more"]);
                            permanentDataVariable["stimulus_pairs_second"].push(trialDataVariable["stimulus_pairs_second"]);
                            permanentDataVariable["second_choices"].push(trialDataVariable["second_choices"]);
                            permanentDataVariable["change_of_mind"].push(trialDataVariable["change_of_mind"]);

                            saveCSV(subjectID, currentAttempt);


                            // increase the block count
                            totalCorrect += trialDataVariable.isCorrect.filter(Boolean).length;
                            blockCount++;

                            //shuffle array that determines where the info seeking trials are
                            //for the first info seeking block with each partner (blocks 2 & 7) we keep the pre-determined list with false, false, true in the beginning
                            if (blockCount === 2 || blockCount === 7 ) {
                                infoSeekingTrialRandomisation = shuffle(infoSeekingTrialRandomisation);
                                trialOrder = trialOrderInit.concat(infoSeekingTrialRandomisation);
                            } else {
                                trialOrder= shuffle(trialOrder);
                            }


                            // enable the cursor for the whole screen
                            $('body').css('cursor', 'auto');

                            // finish the trial
                            jsPsych.finishTrial();
                            return;
                        }
                    }, 1500);
                }

        }

    }


    // enables slider
    $('.scale-row').on({
        mousemove: function (event) {
            var scaleOffsetLeft = cumulativeOffset(document.getElementById('scale')).left;
            var scaleWidth = document.getElementById('scale').offsetWidth;
            var Xmin = scaleOffsetLeft;

            if (sliderActive) {
                backendConfidence = Math.round(((event.pageX - Xmin) / scaleWidth) * 100);

                // style code
                if (backendConfidence >= 100) {
                    backendConfidence = 100;
                    displayedConfidence = backendConfidence;
                    document.body.style.setProperty('--displayedColor', upperColor);
                } else if (backendConfidence < 100 && backendConfidence >= 51) {
                    backendConfidence = backendConfidence;
                    displayedConfidence = backendConfidence;
                    document.body.style.setProperty('--displayedColor', upperColor);
                } else if (backendConfidence < 51 && backendConfidence >= 49) {
                    backendConfidence = backendConfidence;
                    displayedConfidence = 51;
                    if (backendConfidence >= 50) {
                        document.body.style.setProperty('--displayedColor', upperColor);
                    } else {
                        document.body.style.setProperty('--displayedColor', lowerColor);
                    }
                } else if (backendConfidence < 49 && backendConfidence > 0) {
                    backendConfidence = backendConfidence;
                    displayedConfidence = 100 - backendConfidence;
                    document.body.style.setProperty('--displayedColor', lowerColor);
                } else {
                    backendConfidence = 0;
                    displayedConfidence = 100 - backendConfidence;
                    document.body.style.setProperty('--displayedColor', lowerColor);
                }

                var barWidth = Math.abs((displayedConfidence - 50) * 0.5);
                if (backendConfidence >= 50) {
                    $('#scale-right-fill, #confidence-value-right').css('width', barWidth.toString() + 'vmin').css('border-right', '5px solid rgb(13, 219, 255)');
                    $('#scale-left-fill, #confidence-value-left').css('width', '0vmin').css('border-left', '5px solid rgba(0,0,0,0)');
                } else if (backendConfidence < 50) {
                    $('#scale-left-fill, #confidence-value-left').css('width', barWidth.toString() + 'vmin').css('border-left', '5px solid rgb(13, 219, 255)');
                    $('#scale-right-fill, #confidence-value-right').css('width', '0vmin').css('border-right', '5px solid rgba(0,0,0,0)');
                }

                if (showPercentage) {
                    if (backendConfidence > 45) {
                        document.getElementById('confidence-value-right').innerHTML = displayedConfidence + '%';
                        document.getElementById('confidence-value-left').innerHTML = '';
                    } else if (backendConfidence <= 45) {
                        document.getElementById('confidence-value-left').innerHTML = displayedConfidence + '%';
                        document.getElementById('confidence-value-right').innerHTML = '';
                    }
                }
            }
        },


        // when participant clicks on slider to indicate their confidence
        click: function () {

            end_timer = Date.now();
            confidenceRTs = calculateRT(start_timer, end_timer);

            //avoid double clicks by disabling click event for slider
            document.getElementById('scale-row').style.pointerEvents = 'none';

            // disable the slider
            sliderActive = false;


            // confidence is stored as "confidence in the correct answer"
            // i.e. if a person has confidence of 4% in their response but it is the incorrect one, this will be stored as 46% (confidence in the correct choice)
            var participantConfidenceCorrect;

            function recordRating(backendConfidence, correctSide, type) {
                if (backendConfidence !== undefined) {
                    console.log("majority side " + correctSide);
                    // record correct/incorrect confidence
                    if (correctSide == 'left') {
                        var invertedConfidence = 100 - backendConfidence;
                        participantConfidenceCorrect = invertedConfidence;
                        dotConfidences = invertedConfidence;

                        if (invertedConfidence > 50) {
                            correctResponse = true;
                            participantCorrectResponse = true; //participantCorrectResponse only counts group decision responses. correctResponse counts all responses.
                        } else {
                            correctResponse = false;
                            participantCorrectResponse = false; //participantCorrectResponse only counts group decision responses. correctResponse counts all responses.
                        }

                        // if (!isTutorialMode && type == 'submit') {
                        //     dots_cumulativeScore += reverseBrierScore(invertedConfidence, correctResponse); //this is false for the joint decision making but I don't use Brier Score anyways
                        // }
                    } else {
                        participantConfidenceCorrect = backendConfidence;
                        dotConfidences = backendConfidence;

                        if (backendConfidence > 50) {
                            correctResponse = true;
                            participantCorrectResponse = true; //participantCorrectResponse only counts group decision responses. correctResponse counts all responses.
                        } else {
                            correctResponse = false;
                            participantCorrectResponse = false; //participantCorrectResponse only counts group decision responses. correctResponse counts all responses.
                        }
                    }

                    if (strategicVersion === false) {
                        if (initialChoice === "left") {
                            brierConfidence = 100 - backendConfidence;
                        } else {
                            brierConfidence = backendConfidence;
                        }

                        if (!isTutorialMode && !infoSeekingTrial) {
                            overallScore += reverseBrierScore(brierConfidence, correctResponse); //this is false for the joint decision making but I don't use Brier Score anyways
                        }
                    }
                }
            }

            recordRating(backendConfidence, correctSide, 'initial');



            // draw partner's confidence marker
            setTimeout(function (){
                if (partner !== "none" && infoSeekingTrial !== true) {
                    var partnerMarker = createGeneral(
                        partnerMarker,
                        document.getElementById('scale'),
                        'div',
                        '',
                        'partnerMarker',
                        ''
                    );
                    $('#partnerMarker').css('left', partnerConfidenceMarker + '%');
                    if (partner === "underconfident") {
                        $('#partnerMarker').css('background-color', color1);
                    } else if (partner === "overconfident") {
                        $('#partnerMarker').css('background-color', color2);
                    } else {
                        $('#partnerMarker').css('background-color', "darkorange");
                    }
                }
            }, 600);

            // draw box around response with higher confidence
            // note here: the stored confidence values in the data object are confidences in the correct choice;
            // the normal confidences are on a scale of 0-50 regardless of left/right correct/wrong choice; they are necessary to compare who had higher confidence in the case that participant and partner choose different sides
            // the confidence scores for the markers are on a scale from 0-100 going from left to right on the confidence scale

            var higherConfidenceBox = createGeneral(
                higherConfidenceBox,
                document.getElementById('scale'),
                'div',
                '',
                'higherConfidenceBox',
                ''
            );

            if (partner !== "none" && infoSeekingTrial !== true) {

                if (strategicVersion === true) {
                    //automatically trigger click on continue button
                    setTimeout(function () {
                        buttonBackend('submit');
                    }, 3500);

                    setTimeout(function () {
                        var participantConfidence;
                        var participantConfidenceMarker = backendConfidence;
                        if (participantConfidenceMarker > 50) {
                            participantConfidence = participantConfidenceMarker - 50
                        } else {
                            participantConfidence = 50 - participantConfidenceMarker
                        }

                        //draw box around higher confidence response and provide feedback depending on higher confidence response being correct/incorrect
                        setTimeout(function () {
                            if (partnerConfidence < participantConfidence) {
                                participantChosen++;
                                participant_chosen = true;
                                if (participantConfidenceMarker > 50) {
                                    $('#higherConfidenceBox').css('left', 'calc(' + participantConfidenceMarker + '% + 2px)');
                                } else {
                                    $('#higherConfidenceBox').css('left', 'calc(' + participantConfidenceMarker + '% - 2px)');
                                }
                                $('#higherConfidenceBox').css('border', '6px solid rgb(13, 219, 255)');
                                $('#higherConfidenceBox').css('visibility', 'visible');
                                setTimeout(function (){
                                    if (participantConfidenceCorrect > 50) {
                                        document.getElementById('confidence-question').innerHTML = '<h1>JOINT DECISION: <highlight style="color: limegreen">CORRECT</highlight></h1>';
                                        $('#higherConfidenceBox').css('border', '6px solid limegreen');
                                        jointCorrectResponse = true;
                                        overallScore++;
                                    } else {
                                        document.getElementById('confidence-question').innerHTML = '<h1>JOINT DECISION: <highlight style="color: red">INCORRECT</highlight></h1>';
                                        $('#higherConfidenceBox').css('border', '6px solid red');
                                        jointCorrectResponse = false;
                                    }
                                }, 700);


                            } else {
                                partnerChosen++;
                                participant_chosen = false;
                                $('#higherConfidenceBox').css('left', partnerConfidenceMarker + '%');
                                if (partner === "underconfident") {
                                    $('#higherConfidenceBox').css('border', '6px solid ' + color1);
                                } else if (partner === "overconfident") {
                                    $('#higherConfidenceBox').css('border', '6px solid ' + color2);
                                } else {
                                    $('#higherConfidenceBox').css('border', '6px solid darkorange');
                                }
                                $('#higherConfidenceBox').css('visibility', 'visible');
                                setTimeout(function (){
                                    if (partnerConfidenceCorrect > 50) {
                                        document.getElementById('confidence-question').innerHTML = '<h1>JOINT DECISION: <highlight style="color: limegreen">CORRECT</highlight></h1>';
                                        $('#higherConfidenceBox').css('border', '6px solid limegreen');
                                        jointCorrectResponse = true;
                                        overallScore++;
                                    } else {
                                        document.getElementById('confidence-question').innerHTML = '<h1>JOINT DECISION: <highlight style="color: red">INCORRECT</highlight></h1>';
                                        $('#higherConfidenceBox').css('border', '6px solid red');
                                        jointCorrectResponse = false;
                                    }
                                }, 700);
                            }

                            // shot submit button
                            // setTimeout(function (){
                            //     $('.scale-button').removeClass('invisible');
                            // }, 500);


                        }, 200);


                        console.log("participantConfidenceMarker " + participantConfidenceMarker);
                        console.log("participantConfidence " + participantConfidence);
                        console.log("participantConfidenceCorrect " + participantConfidenceCorrect);

                        console.log("partnerConfidenceMarker " + partnerConfidenceMarker);
                        console.log("partnerConfidence " + partnerConfidence);
                        console.log("partnerConfidenceCorrect " + partnerConfidenceCorrect);
                    }, 1000);
                } else {
                    //automatically trigger click on continue button
                    setTimeout(function () {
                        buttonBackend('submit');
                    }, 1500);

                    setTimeout(function () {
                        var participantConfidence;
                        var participantConfidenceMarker = backendConfidence;
                        if (participantConfidenceMarker > 50) {
                            participantConfidence = participantConfidenceMarker - 50
                        } else {
                            participantConfidence = 50 - participantConfidenceMarker
                        }

                    }, 1000);
                }


            // if there is no partner or we are in an info seeking trial
            } else {
                if (partner === "none") {

                    if (strategicVersion === true) {
                        // give feedback based on individual choice
                        setTimeout(function (){
                            if (backendConfidence > 50) {
                                $('#higherConfidenceBox').css('left', 'calc(' + backendConfidence + '% + 2px)');
                            } else {
                                $('#higherConfidenceBox').css('left', 'calc(' + backendConfidence + '% - 2px)');
                            }
                            if (correctResponse == true) {
                                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(13,255,146)">CORRECT</h1>';
                                $('#higherConfidenceBox').css('border', '6px solid limegreen');
                            } else {
                                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(255,0,51)">INCORRECT</h1>';
                                $('#higherConfidenceBox').css('border', '6px solid red');
                            }
                            $('#higherConfidenceBox').css('visibility', 'visible');
                        }, 700);
                    }

                    // shot submit button more quickly if there is no partner to wait for
                    // setTimeout(function (){
                    //     $('.scale-button').removeClass('invisible');
                    // }, 1000);
                    //automatically trigger click on continue button more quickly when there is no partner to wait for
                    setTimeout(function () {
                        buttonBackend('submit');
                    }, 1000)
                //if we are in an info seeking trial
                } else {
                    console.log(stimulusPairs);
                    $('.scale-button').removeClass('invisible');
                    start_timer = Date.now();
                }
            }
        },
    });


    if (infoSeekingTrial === false) {
        // when continue button is clicked, the above specified function is called
        $('.submit-button').on('click', function () {
            buttonBackend('submit');
        });
    } else {
        $('.submit-button').on('click', function () {
            buttonBackend('finalDecision');
        });
    }

    // when see Again button is clicked, the above specified function is called
    $('.more-button').on('click', function () {
        buttonBackend('seeMore');
    });



    // hide the stimulus again for the next trial
    setTimeout(function () {
        // unhide the masks
        $('.grid-mask').css('visibility', 'visible');
        $('.confidence-question').css('visibility', 'visible');
    }, dotPeriod);


}

/**
 * @function drawFixation()
 * @param {Object} parent - parent div
 * @param {Object} canvasID - canvas object in which to draw grids
 * @param {int} canvasWidth - width of the canvas for dot grids
 * @param {int} canvasHeight - height of the canvas for dot grids
 * @param {int} dotCount - minimum dot count
 * @param {Object} dotsStaircase
 * @param {boolean} moreRight - the greater dot count on the right?
 * @param {string} upperColor - colour for the right side of the scale
 * @param {string} lowerColor - colour for the left side of the scale
 * @param {Array} dots_tooltipLabels
 * @param {Array} dots_endLabels
 * @param {boolean} showPercentage = show percentage on scale?
 * @param {string} staircasingPractice - options for the "See Again" button: 'same', 'similar', 'off'
 * @param {int} waitTimeLimit - maximum wait time
 * @param {int} fixationPeriod - duration of fixation period
 * @param {int} dotPeriod
 * @param {int} transitionPeriod
 * @param {int} trialCount
 * @param {int} trialCounterVariable
 * @param {Object} trialDataVariable
 * @param {Object} permanentDataVariable
 * @param {boolean} isTutorialMode
 * @param {int} accuracyThreshold
 */

//the script starts with the drawFixation function which is called in the jspsych-dots (this is also where all the necessary variable values are specified!)
function drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, staircasingPractice, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled, partner) {

    // set style defaults for page
    parent.innerHTML = '';
    $('body')
        .css('display', 'block')
        .css('height', '100%')
        .css('background-color', 'black')
        .css('overflow', 'hidden')
        .css('cursor', 'none');
    $('.jspsych-display-element')
        .css('display', 'flex')
        .css('margin', 'auto')
        .css('justify-content', 'center')
        .css('align-items', 'center')
        .css('flex-wrap', 'wrap')
        .css('wrap-direction', 'column');
    $.scrollify.destroy();

    //create the fixation cross
    var fixationCross = createGeneral(
        fixationCross,
        parent,
        'div',
        'fixation-cross',
        'fixation-cross',
        '+'
    );

    //timeout function clears the fixation cross, then draws the canvas for the dots grid, and then calls the drawDots function
    setTimeout(function () {
        // clear the fixation cross display
        document.getElementById('fixation-cross').remove();
        // draw the canvas for the dots grid
        var canvasID = 'jspsych-canvas-sliders-response-canvas';
        var canvas = '<canvas id="' + canvasID + '" height="' + canvasHeight +
            '" width="' + canvasWidth + '"></canvas>';

        let html = '<div id="jspsych-canvas-sliders-response-wrapper" class="jspsych-sliders-response-wrapper">';
        html += '<div id="jspsych-canvas-sliders-response-stimulus" style="display:flex">' + canvas + '</div>';

        parent.innerHTML += html;

        // call the draw dots function
        drawDots(parent, canvasID, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, staircasingPractice, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled, partner);
    }, fixationPeriod);
}
