/************* GAMEBOARD FUNCTION ****************/

/**
   * @function resetGameboard()
   * @param {Object} container - containing div for the gameboard
   * @param {Object} parent - parent div
   * @param {string} trialType - the type of trial (IST or ISTc)
   * @param {string} rule - the scoring rule (FW or DW)
   * @param {int} trialCount - the number of trials this gameboard function will be iterated over
   * @param {int} trialCounterVariable - the ongoing count of the number of trials/iterations (saved in a variable with scope outside this function)
   * @param {Array} difficultyLevel - the difficulty levels possible (length of the array = number of trials/iterations)
   * @param {Array} colorArray - the colours possible
   * @param {bool} showBoard - should the board be shown at the end of a trial?
   * @param {bool} isTutorialMode - is the board in tutorial mode?
   * @param {Object} trialDataVariable - variable with global scope for saving all trial data
   * @param {string} confidenceFrequency - frequency of asking for a confidence rating ('trial' = once per trial after making a response; 'tile' = once every tile selection; 'randomInt' = once randomly every preset interval)
   * @param {Array} confidenceTrials - specified confidence trials
   * @
   */

function resetGameboard(container, parent, trialType, rule, trialCount, trialCounterVariable, difficultyLevel, colorArray, showBoard, isTutorialMode, trialDataVariable, confidenceFrequency, confidenceTrialArray, showScoreboard, showRule, feedbackFreq, showScore, showCumulative) {

  // basic gameboard information
  trialDataVariable['IST_trialType'].push(trialType);
  trialDataVariable['IST_scoreRule'].push(rule);
  trialDataVariable['IST_isForcedChoice'].push(false);
  // reset page styles if not in tutorial mode
  if (isTutorialMode) {
    var typeSuffix = 'tutorial';
    trialDataVariable['IST_isTutorialMode'].push(true);
  } else {
    // clear the display element
    container.innerHTML = '';
    // set the colour of the display element to black
    container.style.backgroundColor = 'black';
    // add 'tutorial' to the data tags
    var typeSuffix = '';
    trialDataVariable['IST_isTutorialMode'].push(false);
  }

  /** DEFAULT LOCAL VARIABLES */

  var tileIDs = [
    51, 52, 53, 54, 55,
    41, 42, 43, 44, 45,
    31, 32, 33, 34, 35,
    21, 22, 23, 24, 25,
    11, 12, 13, 14, 15
  ];
  var tileSequence = [];
  var majTileSequence = [];
  var minTileSequence = [];
  var tileRTs = [];
  var majoritySeen = 0;
  var minoritySeen = 0;
  var confidenceTrials = [];
  var reportedConfidence = [];
  var confidenceRTs = [];
  var chosenColor;
  var confidence_end;

  /* DEFAULT GAMEBOARD SETTINGS */

  // gameboard size
  var gameboardSize = '70vmin';
  var miniGameboardSize = '50vmin';
  document.body.style.setProperty('--gameboardSize', gameboardSize);

  // score and reps counter
  var score = 0;
  var rep = 1;

  // majority and minority colours
  var randomisedColors = shuffle(colorArray);
  var majorityColor = randomisedColors[0];
  var minorityColor = randomisedColors[1];
  document.body.style.setProperty('--majorityColor', majorityColor);
  document.body.style.setProperty('--minorityColor', minorityColor);
  trialDataVariable['IST_majorityColour'].push(majorityColor);
  trialDataVariable['IST_minorityColour'].push(minorityColor);

  // majority and minority tiles
  var randomisedTiles = shuffle(tileIDs);
  if (isTutorialMode) {
    var majorityTiles = randomisedTiles.slice(0, difficultyLevel);
    var minorityTiles = randomisedTiles.slice(difficultyLevel);
    if (contains(trialDataVariable['IST_difficulty'], difficultyLevel)) {
      rep = 1 + containsN(trialDataVariable['IST_difficulty'], difficultyLevel);
    }
  } else {
    var majorityTiles = randomisedTiles.slice(0, difficultyLevel[trialCounterVariable]);
    var minorityTiles = randomisedTiles.slice(difficultyLevel[trialCounterVariable]);
    if (contains(trialDataVariable['IST_difficulty'], difficultyLevel[trialCounterVariable])) {
      rep = 1 + containsN(trialDataVariable['IST_difficulty'], difficultyLevel[trialCounterVariable]);
    }
  }
  trialDataVariable['IST_repetition'].push(rep);
  trialDataVariable['IST_difficulty'].push(majorityTiles.length);
  trialDataVariable['IST_majorityTiles'].push(majorityTiles);
  trialDataVariable['IST_minorityTiles'].push(minorityTiles);

  // colour of the left/right sides
  var leftRightRandomizer = Math.random();
  if (leftRightRandomizer > 0.5) {
    var majoritySide = "left";
    var leftColor = majorityColor;
    document.body.style.setProperty('--leftColor', majorityColor);
    var rightColor = minorityColor;
    document.body.style.setProperty('--rightColor', minorityColor);
  } else {
    var majoritySide = "right";
    var leftColor = minorityColor;
    document.body.style.setProperty('--leftColor', minorityColor);
    var rightColor = majorityColor;
    document.body.style.setProperty('--rightColor', majorityColor);
  }
  trialDataVariable['IST_leftRight_randoms'].push(leftRightRandomizer);
  trialDataVariable['IST_majoritySide'].push(majoritySide);

  // confidence trials
  if (confidenceFrequency == 'randomInt') {
    if (confidenceTrialArray.length != 0) {
      var presetConfidenceTrials = confidenceTrialArray;
    } else {
      var presetConfidenceTrials = randIntGen([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25]
      ]);
    }
    trialDataVariable['IST_confidence_preset'].push(presetConfidenceTrials);
  } else {
    trialDataVariable['IST_confidence_preset'].push(confidenceFrequency);
  }

  // confidence slider
  var backendConfidence = 50;
  var displayedConfidence;
  var sliderActive;
  var lastSelection = false;
  var showPercentage = false;

  // tooltip labels
  if (confidenceFrequency == 'trial') {
    var confidenceQuestion = 'How confident are you of your choice?';
    var ISTc_tooltipLabels = [
      'probably<br>wrong',
      'maybe<br>wrong',
      'maybe<br>correct',
      'probably<br>correct'
    ];
    var ISTc_endLabels = [
      '<div>certainly<br>WRONG</div>',
      '<div>certainly<br>CORRECT</div>'
    ];
  } else {
    var confidenceQuestion = 'How sure are you of the majority colour?';
    var ISTc_tooltipLabels = [
      'very<br>confident',
      'somewhat<br>confident',
      'somewhat<br>confident',
      'very<br>confident'
    ];
    var ISTc_endLabels = [
      '<div>CERTAIN<br>it\'s this colour</div>',
      '<div>CERTAIN<br>it\'s this colour</div>'
    ];
  }

  // set confidence scroll direction == because scrolling up is always associated with the right response button and down with the left response button, we can determine which end of the confidence scale the majority choice lies on too
  if (confidenceFrequency == 'trial') {
    var upperColor = 'rgb(13,180,13)'; // green
    var lowerColor = 'rgb(255,50,50)'; // red
    $('.tooltip-left, #overlay-label-left').css('color', lowerColor);
    $('.tooltip-right, #overlay-label-right').css('color', upperColor);
  } else {
    var upperColor = rightColor;
    var lowerColor = leftColor;
  }
  document.body.style.setProperty('--displayedColor', upperColor);

  /** LOCAL HELPER FUNCTIONS
   * @function showConfidence()
   * @function hideConfidence()
   * @function endTrial()
   */

  function noScoreboard() {
    // hide scoreboard and prevent it from displaying
    $('.scoreboard').css('width', '0vmin').css('visibility', 'hidden');
    $('.response-area').css('width', '60vmin');
    $('.response-button').css('width', '15vmin').css('height', '8vmin');
  }


  function showConfidence() {
    // disable Scrollify
    $.scrollify.disable();

    // shrink margin-top if in tutorial mode
    if (isTutorialMode) {
      $('.gameboard').css('margin', '-13vh auto 0');
    }
    // prevent gameboard clicks and adjust size to 50vmin
    $('.gameboard')
      .css('width', miniGameboardSize)
      .css('height', miniGameboardSize)
      .css('pointer-events', 'none');
    // adjust response area back to standard (gameboard) width
    $('.response-area').css('width', gameboardSize);
    // make confidence question visible
    $('.noDragSlider, .confidence-question').css('visibility', 'visible');
    // hide response buttons
    $('.response-button, .scoreboard')
      .css('pointer-events', 'none')
      .addClass('hidden');

    // activate the confidence slider and restart the tile selection timer
    sliderActive = true;
    overlay_start_time = Date.now();
  }


  function hideConfidence() {
    // regrow margin-top if in tutorial mode
    if (isTutorialMode) {
      $('.gameboard').css('margin', '5vh auto 0');
    }

    switch(confidenceFrequency) {
      case 'randomInt':
        if (lastSelection) {
          // calculate trial RT
          var trialRT = calculateRT(start_time, confidence_end);
          trialDataVariable['IST_trialRT'].push(trialRT);
          // hide confidence question
          $('.noDragSlider, .confidence-question').css('visibility', 'hidden');
          // expand response area height
          $('.response-area').css('height', '10vmin');
          // expand scoreboard height and width
          $('.scoreboard').css('height', '10vmin')
            .css('width', '30vmin')
            .removeClass('preliminary')
            .removeClass('hidden')
            .css('visibility', 'visible');

          endTrial();
        } else {
          // re-enable Scrollify
          $.scrollify.enable();
          // readjust gameboard size to standard size
          $('.gameboard')
            .css('width', gameboardSize)
            .css('height', gameboardSize)
            .css('pointer-events', 'auto');
          // reset response area
          if (!showScoreboard) {
            noScoreboard();
          }
          // hide slider and confidence question
          $('.noDragSlider, .confidence-question').css('visibility', 'hidden');
          // unhide response buttons and scoreboard
          $('.response-button, .scoreboard')
            .css('pointer-events', 'auto')
            .removeClass('hidden');

          tile_start_time = Date.now();
        }
        break;
      case 'tile':
        // re-enable Scrollify
        $.scrollify.enable();
        // readjust gameboard size to standard size
        $('.gameboard')
          .css('width', gameboardSize)
          .css('height', gameboardSize)
          .css('pointer-events', 'auto');
        // reset response area
        if (!showScoreboard) {
          noScoreboard();
        }
        // hide slider and confidence question
        $('.noDragSlider, .confidence-question').css('visibility', 'hidden');
        // unhide response buttons and scoreboard
        $('.response-button, .scoreboard')
          .css('pointer-events', 'auto')
          .removeClass('hidden');

        tile_start_time = Date.now();
        break;
      case 'trial':
        // calculate trial RT
        var trialRT = calculateRT(start_time, confidence_end);
        trialDataVariable['IST_trialRT'].push(trialRT);
        // hide confidence question
        $('.noDragSlider, .confidence-question').css('visibility', 'hidden');
        // expand response area height
        $('.response-area').css('height', '10vmin');
        // expand scoreboard height and width
        $('.scoreboard').css('height', '10vmin')
          .css('width', '30vmin')
          .removeClass('preliminary')
          .removeClass('hidden')
          .css('visibility', 'visible');

        endTrial();
        break;
    }
  }

  function endTrial() {
    // determine the end of trial pause
    var endTrialTimer = (confidenceFrequency == 'tile') ? 1000 : 1500;

    // provide feedback, if specified in parameters
    if (IST_totalTrials % feedbackFreq == 0) {
      if (showScore) {
        if (!showCumulative) {
          document.getElementById('scoreboard-text').innerHTML = 'POINTS THIS TRIAL';
          document.getElementById('score').innerHTML = score;
        } else {
          // remove visual (colour) feedback
          $('.score').removeClass('correct').removeClass('incorrect');
          document.getElementById('scoreboard-text').innerHTML = 'TOTAL POINTS';
          document.getElementById('score').innerHTML = IST_cumulativeScore;
        }
      } else {
        if (!showCumulative) {
          document.getElementById('scoreboard-text').innerHTML = 'YOUR CHOICE';
          if ($('.score').hasClass('correct')) {
            document.getElementById('score').innerHTML = 'correct';
          } else {
            document.getElementById('score').innerHTML = 'incorrect';
          }
        } else {
          // remove visual (colour) feedback
          $('.score').removeClass('correct').removeClass('incorrect');
          document.getElementById('scoreboard-text').innerHTML = 'CORRECT SO FAR';
          document.getElementById('score').innerHTML = IST_cumulativeCorrect + ' out of ' + IST_totalTrials;
        }
      }
    }

    // show the whole gameboard, if specified in parameters
    $('.defaultColor').each(function () {
      if (showBoard && contains(majorityTiles, parseInt($(this).attr('id'), 10))) {
        $(this).removeClass('defaultColor').addClass('majorityColor');
      } else if (showBoard && contains(minorityTiles, parseInt($(this).attr('id'), 10))) {
        $(this).removeClass('defaultColor').addClass('minorityColor');
      }
    });

    // end the trial
    setTimeout(function () {
      // save the tile (total, majority, and minority) and confidence sequence and RT arrays to trial data
      trialDataVariable['IST_tileSequence'].push(tileSequence);
      trialDataVariable['IST_majoritySequence'].push(majTileSequence);
      trialDataVariable['IST_minoritySequence'].push(minTileSequence);
      trialDataVariable['IST_tileRTs'].push(tileRTs);
      trialDataVariable['IST_confidence_actual'].push(confidenceTrials);
      trialDataVariable['IST_confidence_ratings'].push(reportedConfidence);
      trialDataVariable['IST_confidenceRTs'].push(confidenceRTs);

      // decide what to do based on trial counter
      trialCounterVariable++;

      if (trialCounterVariable < trialCount) {
        // clear the board
        document.getElementById('gameboard').remove();
        document.getElementById('response-area').remove();
        // console.log("board cleared: success!");
        // reset the local confidence variables
        reportedConfidence = [];
        confidenceRTs = [];
        // call the gameboard again
        resetGameboard(container, parent, trialType, rule, trialCount, trialCounterVariable, difficultyLevel, colorArray, showBoard, isTutorialMode, trialDataVariable, confidenceFrequency, confidenceTrialArray, showScoreboard, showRule, feedbackFreq, showScore, showCumulative);
      } else {
        // if not in tutorial mode, clear the display, log the final data object with jsPsych, and return
        if (!isTutorialMode) {
          // clear the display element
          parent.innerHTML = '';
          // finish the trial and save the data
          console.log(trialDataVariable);
          jsPsych.finishTrial();
          return;

        } else {
          // if in tutorial mode, create new sections below the gameboard section with more game instructions
          if (rule == 'DW') {
            var scoreText = '<h1>You will now play another 10 rounds of this game in "Decreasing" mode.</h1> In this game mode, the number of points you earn for a correct answer will vary: if you correctly choose the majority colour, you will <u><b>win 10 points for every black tile remaining on the board</b></u>. However, if your choice is incorrect, you will <u><b>lose 100 points, regardless of the number of tiles you have seen</b></u>. The total number of points you earn through all the game rounds will be used to calculate your cash bonus at the end.'
          } else {
            var scoreText = '<h1>You will now play another 10 rounds of this game in "Fixed" mode.</h1> In this game mode, if you correctly choose the majority colour, you will <u><b>win 100 points, regardless of the number of tiles you have selected</b></u>. However, if your choice is incorrect, you will <u><b>lose 100 points, also regardless of the number of tiles seen</b></u>. The total number of points you earn throughout all the game rounds will be used to calculate your cash bonus at the end.'
          }

          var section4 = createGeneral(
            section4,
            container,
            'section',
            'tutorial-section section4',
            'ISTc-tutorial-section4',
            ''
          );

          var section4_title = createGeneral(
            section4_title,
            section4,
            'div',
            'tutorial-text',
            'ISTc-tutorial-text4',
            scoreText
          );

          var section4_button = createGeneral(
            section4_button,
            section4,
            'button',
            'default-white-button glowy-box',
            'ISTc-tutorial-continue',
            '<div>CONTINUE TO GAME</div>'
          );

          // update Scrollify with the new section
          $.scrollify.update();

          // get the page to automatically scroll to the new section
          $('html, body').animate({
            scrollTop: $('#ISTc-tutorial-section4').offset().top
          }, 1000);

          // on clicking the continue button in that final section, destroy the Scrollify instance, log the data in the final jsPsych data object, and return
          $('#ISTc-tutorial-continue').on('click', function () {
            $.scrollify.destroy();
            console.log(trialDataVariable);
            jsPsych.finishTrial();
            return;
          });
        }
      }
    }, endTrialTimer); // close setTimeout()
  }


  /* DRAW THE GAMEBOARD */

  // draw the gameboard area
  var gameboard = createGeneral(
    gameboard,
    parent,
    'div',
    'gameboard',
    'gameboard',
    ''
  );
  // draw the 25 tiles within the gameboard
  for (var row = 5; row > 0; row--) {
    for (var column = 1; column < 6; column++) {
      var tile = createGeneral(
        tile,
        gameboard,
        'div',
        'tile defaultColor',
        row.toString() + column.toString(),
        ''
      );
    }
  }

  // draw the response area (score board and response buttons)
  var response_area = createGeneral(
    response_area,
    parent,
    'div',
    'response-area',
    'response-area',
    ''
  );

  var confidence_question = createGeneral(
    confidence_question,
    response_area,
    'div',
    'confidence-question',
    'confidence-question',
    '<h1>' + confidenceQuestion + '</h1> (click on scale to select)'
  );

  // draw the confidence response area
  var confidence_meter = noDragSlider('ISTc_slider', response_area, ISTc_tooltipLabels, ISTc_endLabels, {submit: 'SUBMIT'});
  $('.submit-button').addClass('centered');

  // draw the left and right response buttons, and the scoreboard located centrally between them. default for left and right response buttons is pointer-events: none in gameboard.css
  var left_response = createGeneral(
    left_response,
    response_area,
    'div',
    'response-button leftColor',
    'left-response',
    ''
  );
  var scoreboard = createGeneral(
    scoreboard,
    response_area,
    'div',
    'scoreboard preliminary',
    'scoreboard',
    ''
  );
  var right_response = createGeneral(
    right_response,
    response_area,
    'div',
    'response-button rightColor',
    'right-response',
    ''
  );

  // add a score value and caption to the scoreboard
  if (showRule) {
    var scoreboardCaption = 'GAME MODE';
    if (rule == 'DW') {
      var scoreboardValue = 'Decreasing';
    } else if (rule == 'FW') {
      var scoreboardValue = 'Fixed';
    }
  } else {
    var scoreboardCaption = 'POINTS THIS TRIAL';
    var scoreboardValue = score;
  }

  var score_caption = createGeneral(
    score_caption,
    scoreboard,
    'p',
    'text default-text',
    'scoreboard-text',
    scoreboardCaption
  );
  var score_value = createGeneral(
    score_value,
    scoreboard,
    'p',
    'score default-text',
    'score',
    scoreboardValue
  );

  /* FORMATTING CHANGES */

  // set left/right colour classes
  if (leftRightRandomizer > 0.5) {
    left_response.setAttribute('class', 'response-button leftColor MAJ');
  } else {
    right_response.setAttribute('class', 'response-button rightColor MAJ');
  }
  // hide scoreboard if specified
  if (!showScoreboard) {
    noScoreboard();
  }


  /* START THE BOARD ANIMATION SEQUENCE (powered by jQuery) */

  // start counters and timers
  var start_time = Date.now();
  var tile_start_time = Date.now();
  var overlay_start_time;
  var tileCount = 0;

  // prevent clicking of response button before tile selection
  $('.response-button').css('pointer-events', 'none');
  // turn off event handlers
  $('.escape-button').off('click');
  $('.submit-button').off('click');
  $('.scale').off('mousemove').off('click');


  // TILE CLICK
  $('.tile').on('click', function(event) {
    $('.gameboard').css('pointer-events', 'none');
    tileCount++;
    // record the click RT
    var tileclickRT = calculateRT(tile_start_time, Date.now());
    // save the ID of the clicked tile in clickedTile array object
    tileSequence.push(parseInt($(event.currentTarget).attr('id'), 10));
    // save the RT for that tile click in tileClickRTs array object
    tileRTs.push(tileclickRT);
    // reveal the colour linked to that tile ID and prevent further click events on that tile
    if (contains(majorityTiles, parseInt($(event.currentTarget).attr('id'), 10))) {
      $(event.currentTarget).removeClass('defaultColor').addClass('majorityColor').css('pointer-events', 'none');
      majoritySeen++;
    } else if (contains(minorityTiles, parseInt($(event.currentTarget).attr('id'), 10))) {
      $(event.currentTarget).removeClass('defaultColor').addClass('minorityColor').css('pointer-events', 'none');
      minoritySeen++;
    }
    // update the maj/min tile counts to respective array objects
    majTileSequence.push(majoritySeen);
    minTileSequence.push(minoritySeen);

    // display the confidence rating page
    if (confidenceFrequency == 'tile' || (confidenceFrequency == 'randomInt' && contains(presetConfidenceTrials, tileCount))) {
      confidenceTrials.push(tileCount);
      setTimeout(function () { showConfidence(); }, 1);
    } else {
      $('.gameboard, .response-button').css('pointer-events', 'auto');
      tile_start_time = Date.now();
    }
  });

  // RESPONSE BUTTON CLICK
  $('.response-button').on('click', function(event) {
    lastSelection = true;
    // prevent clicking if it has class 'unclickable' (applied in IntroJS tutorial)
    if (!$(event.currentTarget).hasClass('unclickable')) {
      var end_time = Date.now();
      // freeze the gameboard (prevent any further clicks)
      $('.gameboard, .response-button').css('pointer-events', 'none');
      // show the response button as depressed
      $(event.currentTarget).css('box-shadow', '0vmin 0vmin 2vmin white');

      // calculate and record choice RT
      var choiceRT = calculateRT(tile_start_time, end_time);
      trialDataVariable['IST_choiceRT'].push(choiceRT);

      // record the response button choice (left or right)
      trialDataVariable['IST_buttonChoice'].push($(event.currentTarget).attr('id'));

      // update the score based on the gameplay rule specified in parameters
      var remainingCards = $('.defaultColor').length;
      if ($(event.currentTarget).hasClass('MAJ')) {
        $('.score').removeClass('incorrect').addClass('correct');
        IST_cumulativeCorrect++;
        if (rule == 'DW') {
          score += 10 * remainingCards;
        } else {
          score += 100;
        }
      } else {
        $('.score').removeClass('correct').addClass('incorrect');
        score += -100;
      }
      trialDataVariable['IST_scores'].push(score);
      if (!isTutorialMode) {
        IST_cumulativeScore += score;
        IST_totalTrials++;
        console.log('You have scored ' + IST_cumulativeScore + ' points across ' + IST_totalTrials + ' trials so far.');
      }

      // mark response as correct or incorrect in trial data
      if ($('.score').hasClass('correct')) {
        chosenColor = majorityColor;
        trialDataVariable['IST_isCorrect'].push(true);
      } else {
        chosenColor = minorityColor;
        trialDataVariable['IST_isCorrect'].push(false);
      }
      trialDataVariable['IST_majoritySeen'].push(majoritySeen);
      trialDataVariable['IST_minoritySeen'].push(minoritySeen);
      trialDataVariable['IST_totalSeen'].push(majoritySeen + minoritySeen);
      if (rule == "FW" && !isTutorialMode) {
        trialDataVariable['IST_FW_totalSeen'].push(majoritySeen + minoritySeen);
      } else if (rule == "DW" && !isTutorialMode) {
        trialDataVariable['IST_DW_totalSeen'].push(majoritySeen + minoritySeen);
      }

      // calculate the P(correct) at the point of decision
      var dp_pcorrect = getPCorrect((majoritySeen + minoritySeen), majoritySeen);
      if (rule == "FW" && !isTutorialMode) {
        trialDataVariable['IST_FW_pCorrect'].push(dp_pcorrect);
      } else if (rule == "DW" && !isTutorialMode) {
        trialDataVariable['IST_DW_pCorrect'].push(dp_pcorrect);
      }

      // show the confidence meter if specified
      if (trialType == 'ISTc') {
        switch(confidenceFrequency) {
          case 'randomInt':
            // check if this trial has already had a confidence rating question
            if (contains(presetConfidenceTrials, tileCount)) {
              var trialRT = calculateRT(start_time, end_time);
              trialDataVariable['IST_trialRT'].push(trialRT);
              endTrial();
            } else {
              confidenceTrials.push(tileCount);
              setTimeout(function () { showConfidence(); }, 1);
            }
            break;
          case 'trial':
            $('.scale-content').css('background', chosenColor);
            $('.scale-fill').css('background-color: rgba(0,0,0,0)');
            $('.tooltip-left, #overlay-label-left').css('color', 'rgb(255,255,255)');
            $('.tooltip-right, #overlay-label-right').css('color', 'rgb(255,255,255)');
            setTimeout(function () { showConfidence(); }, 1);
            break;
          default:
            var trialRT = calculateRT(start_time, end_time);
            trialDataVariable['IST_trialRT'].push(trialRT);
            endTrial();
        }
      } else {
        var trialRT = calculateRT(start_time, end_time);
        trialDataVariable['IST_trialRT'].push(trialRT);
        endTrial();
      }
    }
  });

  // SCALE HOVER & CLICK
  $('.scale-row').on('mousemove', function(event) {
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
      if (confidenceFrequency == 'trial') {
        if (backendConfidence >= 50) {
          $('#scale-right-fill, #confidence-value-right').css('width', barWidth.toString() + 'vmin').css('border-right', '5px solid rgb(255,255,255)');
          $('#scale-left-fill, #confidence-value-left').css('width', '0vmin').css('border-left', '5px solid rgba(0,0,0,0)');
        } else if (backendConfidence < 50) {
          $('#scale-left-fill, #confidence-value-left').css('width', barWidth.toString() + 'vmin').css('border-left', '5px solid rgb(255,255,255)');
          $('#scale-right-fill, #confidence-value-right').css('width', '0vmin').css('border-right', '5px solid rgba(0,0,0,0)');
        }
      } else {
        if (backendConfidence >= 50) {
          $('#scale-right-fill, #confidence-value-right').css('width', barWidth.toString() + 'vmin');
          $('#scale-left-fill, #confidence-value-left').css('width', '0vmin');
        } else if (backendConfidence < 50) {
          $('#scale-left-fill, #confidence-value-left').css('width', barWidth.toString() + 'vmin');
          $('#scale-right-fill, #confidence-value-right').css('width', '0vmin');
        }
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
  });

  $('.scale-row').on('click', function(event) {
    // prevent clicking if it has class 'unclickable' (applied in IntroJS tutorial)
    if (!$(event.currentTarget).hasClass('unclickable')) {
      sliderActive = false;
      if (confidenceFrequency == 'randomInt' && lastSelection == false) {
        confidence_end = Date.now();
        sliderActive = true;
        $('.scale-button').addClass('invisible');
        if (backendConfidence !== undefined) {
          // save the confidence RT
          confidenceRT = calculateRT(overlay_start_time, confidence_end);
          confidenceRTs.push(confidenceRT);
          // save the recorded confidence value
          if (majoritySide == "left") {
            var invertedConfidence = 100 - backendConfidence;
            reportedConfidence.push(invertedConfidence);
          } else {
            reportedConfidence.push(backendConfidence);
          }
          // hide the overlay and make the bottom layer visible and clickable again
          hideConfidence();
        }
      } else {
        if (!sliderActive && backendConfidence >= 50) {
          $('.scale-button').removeClass('invisible');
        } else if (!sliderActive) {
          $('.scale-button').removeClass('invisible');
        }
      }
    }
  });

  // SCALE ESCAPE BUTTON CLICK
  $('.escape-button').on('click', function(event) {
    // prevent clicking if it has class 'unclickable' (applied in IntroJS tutorial)
    if (!$(event.currentTarget).hasClass('unclickable')) {
      sliderActive = true;
      $('.scale-button').addClass('invisible');
    }
  });

  // SCALE SUBMIT BUTTON CLICK
  $('.submit-button').on('click', function(event) {
    // prevent clicking if it has class 'unclickable' (applied in IntroJS tutorial)
    if (!$(event.currentTarget).hasClass('unclickable')) {
      confidence_end = Date.now();
      sliderActive = true;
      $('.scale-button').addClass('invisible');
      if (backendConfidence !== undefined) {
        // save the confidence RT
        confidenceRT = calculateRT(overlay_start_time, confidence_end);
        confidenceRTs.push(confidenceRT);
        // save the recorded confidence value
        if (majoritySide == "left") {
          var invertedConfidence = 100 - backendConfidence;
          reportedConfidence.push(invertedConfidence);
        } else {
          reportedConfidence.push(backendConfidence);
        }
        // hide the overlay and make the bottom layer visible and clickable again
        hideConfidence();
      }
    }
  });

} // close resetGameboard()