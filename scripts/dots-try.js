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
 * @param {string} seeAgain - options for the "See Again" button: 'same', 'similar', 'easier'
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

function drawDots(parent, canvasID, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, seeAgain, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled) {

    // default variables
    var backendConfidence;
    var correctResponse;
    var sliderActive = true;
    var secondTimeAround = false;
    var start_timer;
    var dotPairs = [];
    var dotConfidences = [];
    var dotRTs = [];
    var choice_timer;
    var confidence_timer;


    // determine the parameters for the dot grids
    var low = dotCount;
    var high = Math.round(dotCount + dotsStaircase.getLast('logSpace'));

    var randomiser = Math.random();
    if (randomiser > 0.5) {
        var dots = [low, high];
        var majoritySide = 'right';
    } else {
        var dots = [high, low];
        var majoritySide = 'left';
    }
    trialDataVariable['dots_majoritySide'].push(majoritySide);
    dotPairs.push(dots);


    // draw the grid
    let grid = new DoubleDotGrid(dots[0], dots[1], {
            spacing: 100,
            paddingX: 6
        }
    );
    grid.draw(canvasID);


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


    // button name
    var buttonsToShow = {};
    buttonsToShow['submit'] = greenButtonName;


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

    // hide the response area
    $('.confidence-question').css('visibility', 'hidden');
    $('.response-area').css('visibility', 'hidden');


    // enable the cursor
    $('.jspsych-content').css('cursor', 'auto');


    // hide the masks (i.e. show the stimulus)
    $('.grid-mask').css('visibility', 'hidden');
    // start the timer
    start_timer = Date.now();


    // left or right mouse-click for decision
    $(document).on('mousedown', function(event) {
        console.log(event.button);
        // record the RT
        choice_timer = Date.now();
        // turn off these event handlers
        $(document).off('mousedown');
        $('.grid-mask').css('cursor', 'auto');
        // highlight the chosen box
        if (event.button == 0) {
            $('.mask-left').css('border', '5px solid rgb(13,255,146');
            $('.mask-right').css('border', '5px solid rgba(0,0,0,0)');
        } else if (event.button == 2) {
            $('.mask-left').css('border', '5px solid rgba(0,0,0,0)');
            $('.mask-right').css('border', '5px solid rgb(13,255,146');
        }
        // make response area visible
        $('.confidence-question').css('visibility', 'visible');
        document.getElementById("confidence-question").innerHTML = "<h1>Indicate your confidence with the slider below</h1>";
        $('.response-area').css('visibility', 'visible');

    });


    // reset the event loggers
    $('.submit-button').off('click');
    $('.scale-row').off('mousemove').off('click');



    function recordRating(backendConfidence, majoritySide, type) {     //NOTE add recording of initial response correctness!!!!!!!!!
        if (backendConfidence !== undefined) {
            // record correct/incorrect confidence
            if (majoritySide == 'left') {
                var invertedConfidence = 100 - backendConfidence;
                dotConfidences.push(invertedConfidence);

                if (invertedConfidence > 50) {
                    correctResponse = true;
                } else {
                    correctResponse = false;
                }

                if (!isTutorialMode && type == 'submit') {
                    dots_cumulativeScore += reverseBrierScore(invertedConfidence, correctResponse);
                }
            } else {
                dotConfidences.push(backendConfidence);

                if (backendConfidence > 50) {
                    correctResponse = true;
                } else {
                    correctResponse = false;
                }

                if (!isTutorialMode && type == 'submit') {
                    dots_cumulativeScore += reverseBrierScore(backendConfidence, correctResponse);
                }
            }
            console.log(dotPairs);
            console.log(dotConfidences);
        }
    }


    function buttonBackend(type) {
        // turn off the button options
        $('.scale-button').addClass('invisible');


        // record RT and reset the timer
        confidence_timer = Date.now();
        var RT = calculateRT(start_timer, confidence_timer);
        dotRTs.push(RT);


        // update the staircase
        dotsStaircase.next(correctResponse);
        staircaseSteps++;


        // calculate the wait time
        var waitTime = fixationPeriod + dotPeriod + transitionPeriod + RT;
        if (waitTime <= waitTimeLimit) {
            console.log('waitTime is ' + waitTime);
        } else {
            waitTime = waitTimeLimit;
            console.log('waitTime is ' + waitTime);
        }


        trialDataVariable['dots_waitTimes'].push(waitTime);
        trialDataVariable['dots_isCorrect'].push(correctResponse); // this is for calculating the bonus
        trialDataVariable['dots_pairs'].push(dotPairs);
        trialDataVariable['dots_confidences'].push(dotConfidences);
        trialDataVariable['dots_RTs'].push(dotRTs);
        trialDataVariable['dots_isTutorialMode'].push(isTutorialMode);
        trialCounterVariable++;


        // give feedback
        if (isTutorialMode) {
            if (correctResponse) {
                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(13,255,146)">CORRECT</h1>';
            } else {
                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(255,0,51)">INCORRECT</h1>';
            }
            setTimeout(function () {
                // clear the display on a timer
                document.getElementById('jspsych-canvas-sliders-response-wrapper').remove();
                document.getElementById('response-area').remove();
                console.log('dot display cleared: success!')
                console.log('that was trial ' + trialCounterVariable + ' of ' + trialCount);
            }, 1000);
        } else {
            // clear the display directly
            document.getElementById('jspsych-canvas-sliders-response-wrapper').remove();
            document.getElementById('response-area').remove();
            console.log('dot display cleared: success!')
            console.log('that was trial ' + trialCounterVariable + ' of ' + trialCount);

            dots_totalTrials++;
        }

        if (trialCounterVariable < trialCount) {
            // draw the fixation dot
            setTimeout(function () { drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, seeAgain, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled); }, waitTime);

        } else {
            // evaluate accuracy
            setTimeout(function () {
                var accuracy = round(mean(trialDataVariable['dots_isCorrect']), 2) * 100;
                console.log('accuracy: ' + accuracy);

                if (isTutorialMode) {
                    if (accuracy >= accuracyThreshold) {
                        var section4_text = 'Congratulations, your accuracy during the last set of practice trials was ' + accuracy + '%.';
                        var section4_button = 'CONTINUE';
                    } else {
                        var section4_text = 'Your accuracy during these practice trials was ' + accuracy + '%, which is below the required accuracy threshold. Please click "Repeat" below to repeat the practice round.';
                        var section4_button = 'REPEAT';
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

                    if (accuracy >= accuracyThreshold) {
                        $('#dots-tutorial-continue').on('click', function () {
                            console.log(trialDataVariable);
                            permanentDataVariable["dots_accuracy"].push(accuracy);
                            permanentDataVariable["dots_pairs"].push(trialDataVariable["dots_pairs"]);
                            permanentDataVariable["dots_majoritySide"].push(trialDataVariable["dots_majoritySide"]);
                            permanentDataVariable["dots_confidences"].push(trialDataVariable["dots_confidences"]);
                            permanentDataVariable["dots_moreAsked"].push(trialDataVariable["dots_moreAsked"]);
                            permanentDataVariable["dots_isCorrect"].push(trialDataVariable["dots_isCorrect"]);
                            permanentDataVariable["dots_RTs"].push(trialDataVariable["dots_RTs"]);
                            permanentDataVariable["dots_waitTimes"].push(trialDataVariable["dots_waitTimes"]);

                            $('body').css('cursor', 'auto');
                            jsPsych.finishTrial();
                            return;
                        });
                    } else {
                        $('#dots-tutorial-continue').on('click', function () {
                            drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, seeAgain, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, isTutorialMode, accuracyThreshold, yellowButtonEnabled, redButtonEnabled, redButtonName, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled);
                            return;
                        });
                    }
                } else {
                    // if not in tutorial mode
                    permanentDataVariable["dots_accuracy"].push(accuracy);
                    permanentDataVariable["dots_isTutorialMode"].push(trialDataVariable["dots_isTutorialMode"]);
                    permanentDataVariable["dots_pairs"].push(trialDataVariable["dots_pairs"]);
                    permanentDataVariable["dots_majoritySide"].push(trialDataVariable["dots_majoritySide"]);
                    permanentDataVariable["dots_confidences"].push(trialDataVariable["dots_confidences"]);
                    permanentDataVariable["dots_moreAsked"].push(trialDataVariable["dots_moreAsked"]);
                    permanentDataVariable["dots_isCorrect"].push(trialDataVariable["dots_isCorrect"]);
                    permanentDataVariable["dots_RTs"].push(trialDataVariable["dots_RTs"]);
                    permanentDataVariable["dots_waitTimes"].push(trialDataVariable["dots_waitTimes"]);

                    dots_totalCorrect += trialDataVariable.dots_isCorrect.filter(Boolean).length;
                    dots_blockCount++;

                    $('body').css('cursor', 'auto');
                    jsPsych.finishTrial();
                    return;
                }
            }, 1500);
        }
    }


    $('.scale-row').on({
        mousemove: function (event) {
            var scaleOffsetLeft = cumulativeOffset(document.getElementById('scale')).left;
            var scaleWidth = document.getElementById('scale').offsetWidth;
            var Xmin = scaleOffsetLeft;

            if (sliderActive) {
                backendConfidence = Math.round(((event.pageX - Xmin) / scaleWidth) * 100);

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
                    $('#scale-right-fill, #confidence-value-right').css('width', barWidth.toString() + 'vmin').css('border-right', '5px solid rgb(255,50,50)');
                    $('#scale-left-fill, #confidence-value-left').css('width', '0vmin').css('border-left', '5px solid rgba(0,0,0,0)');
                } else if (backendConfidence < 50) {
                    $('#scale-left-fill, #confidence-value-left').css('width', barWidth.toString() + 'vmin').css('border-left', '5px solid rgb(255,50,50)');
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
        click: function () {
            sliderActive = false;

            // show buttons
            if (!sliderActive) {
                $('.scale-button').removeClass('invisible');
            }

            if (defaultOptionEnabled) {
                // record data
                confidence_timer = Date.now();
                var RT = calculateRT(start_timer, confidence_timer);
                dotRTs.push(RT);
                recordRating(backendConfidence, majoritySide, 'initial');

                // wipe the slate and show the default option with timer if first time
                if (!secondTimeAround) {
                    // clear the grids
                    var dotCanvas = document.getElementById('jspsych-canvas-sliders-response-canvas');
                    console.log('width: ' + dotCanvas.width + ' height: ' + dotCanvas.height);
                    var context = dotCanvas.getContext('2d');
                    context.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
                    context.beginPath();

                    // hide masks and response areas
                    $('.response-area, .confidence-question, .grid-mask, #jspsych-canvas-sliders-response-canvas').css('visibility', 'hidden');

                    var defaultQuestionValue = '';
                    if (redButtonName == 'SKIP INSTEAD') {
                        defaultQuestionValue = 'See Again?';
                    } else if (redButtonName == 'SEE AGAIN INSTEAD') {
                        defaultQuestionValue = 'Continue?';
                    }

                    var defaultQuestion = createGeneral(
                        defaultQuestion,
                        document.getElementById('jspsych-canvas-sliders-response-wrapper'),
                        'div',
                        'fixation-cross see-again',
                        'default-question',
                        defaultQuestionValue
                    );

                    // draw a central timer
                    countdownTimer(document.getElementById('jspsych-canvas-sliders-response-wrapper'), 3, 3000);

                    $('.response-area, #tooltip-row-bottom').css('visibility', 'visible');
                    $('#tooltip-row-top, #tooltip-arrow-top, #scale-row').css('visibility', 'hidden');

                    setTimeout(function () {
                        document.getElementById('countdown').remove();
                        document.getElementById('default-question').remove();
                        $('.response-area, #tooltip-row-bottom').css('visibility', 'hidden');
                        $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'visible');

                        if (defaultQuestionValue == 'See Again?' && !secondTimeAround) {
                            buttonBackend('seeAgain');
                        } else {
                            buttonBackend('submit');
                        }
                    }, 3000);

                    // wipe the slate and end trial if second time
                } else {

                }
            } else {
                //
            }
        },
    });


    $('.submit-button').on('click', function () {
        buttonBackend('submit');
    });


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
 * @param {string} seeAgain - options for the "See Again" button: 'same', 'similar', 'easier'
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
function drawFixation(parent, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, seeAgain, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled) {

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

    //timeout function clears the ficatoin cross, then draws the canvas for the dots grid, and then calls the drawDots function
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
        drawDots(parent, canvasID, canvasWidth, canvasHeight, dotCount, dotsStaircase, upperColor, lowerColor, dots_tooltipLabels, dots_endLabels, showPercentage, seeAgain, waitTimeLimit, fixationPeriod, dotPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, defaultOptionEnabled);
    }, fixationPeriod);
}