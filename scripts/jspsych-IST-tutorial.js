/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-IST-tutorial'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-IST-tutorial',
    prettyName: 'Information Sampling Task (with confidence) tutorial',
    parameters: {
      trial_type: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'trial type',
        default: 'ISTc',
        description: 'STRING: the type of trial to run ("IST" or "ISTc"). Default is "ISTc" - IST with confidence.'
      },
      score_rule: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'gameplay rule',
        description: 'STRING: the rule for calculating score ("FW" or "DW"). Default is "FW".'
      },
      trial_count: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'trial count',
        default: 1,
        description: 'INTEGER: the number of trials in the tutorial. Default is 2.'
      },
      difficulty_level: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'difficulty level',
        default: 15,
        description: 'INTEGER: the difficulty level of the tutorial. Default is 15.'
      },
      colors_list: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'possible colours',
        default: ['#9984D4', '#62BFED', '#E637BF', '#FE5F55', '#FFBC51', '#34D188'],
        description: 'ARRAY OBJECT: the colors cycled between in the block. Default is the 80s colour scheme.'
      },
      showBoard: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'show board at end',
        default: false,
        description: 'BOOLEAN: indicates whether the entire gameboard should be shown at the end. Default is "false".'
      },
      confidenceFrequency: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'frequency of confidence ratings',
        default: 'none',
        description: 'STRING: sets how often confidence ratings are asked. Currently acceptable values: "tile" (after every tile selection), "trial" (after user selects response; "randomInt" (randomly after a couple of tile selections, and also after user selects response); "none" (for IST)).'
      },
      isFirstTime: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'first time explanation',
        default: true,
        description: 'BOOLEAN: indicates whether this is the first time the IST is being explained.'
      },
      showScoreboard: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'show scoreboard',
        default: true,
        description: 'BOOLEAN: indicates whether the scoreboard is shown'
      },
      showRule: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'show score rule',
        default: false,
        description: 'BOOLEAN: indicates whether the score rule is displayed in the scoreboard instead of the score during the trial.'
      },
      feedbackFreq: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'feedback frequency',
        default: 1,
        description: 'INTEGER: specifies how frequently feedback should be shown to participants (number of trials per feedback round).'
      },
      showScore: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'show score',
        default: true,
        description: 'BOOLEAN: indicates whether the score or a simple accuracy feedback (percentage correct) is shown during the feedback round.'
      },
      showCumulative: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'cumulative feedback',
        default: false,
        description: 'BOOLEAN: indicates whether feedback is cumulative or not in nature.'
      }
    }
  };

  plugin.trial = function (display_element, trial) {
    // clear display element and apply page default styles
    display_element.innerHTML = '';
    $('body')
      .css('display', 'block')
      .css('width', '100%')
      .css('height', 'auto')
      .css('background-color', 'black')
      .css('overflow', 'auto');
    $.scrollify.enable(); // enable any previous Scrollify instances
    $.scrollify.destroy(); // remove all previous Scrollify instances

    // make sure page starts at the top every time
    removeHash();
    removeQueryString();

    // set up scroll snap points (jQuery)
    $(function() {
      $.scrollify({
        section: "section",
        sectionName: "section-name",
        interstitialSection: "",
        easing: "easeOutExpo",
        scrollSpeed: 1100,
        offset: 0,
        scrollbars: false,
        standardScrollElements: "",
        setHeights: false,
        overflowScroll: true,
        updateHash: false,
        touchScroll: true,
        before: function() {},
        after: function() {},
        afterResize: function() {},
        afterRender: function() {}
      });
    });

    /* PLUGIN OBJECTS & VARIABLES */
    var trialCounter = 0;
    var isTooltipsOn = true;
    var isTutorialMode = true;
    var tutorialIndex = 0;
    var confidenceTrials = [1, 6, 13, 16, 22];

    /* TUTORIAL TEXT */

    // text for the first page (red screen)
    if (trial.isFirstTime) {
      var section1_text = 'In the next part of the experiment, you will be playing a short game with tiles.';

      var section2_text = 'During this game, you will see a gameboard with 25 tiles. Clicking on a tile will reveal its underlying colour. Your goal is to figure out which of the 2 underlying colours is the <highlight style="color: rgb(13,255,146)"><b>majority colour</b> (colour of the majority of tiles)</highlight>. You can select as many tiles as you like to help you decide. When you are ready to give your answer, you can press the matching round response button below the gameboard.';
    } else {
      var section1_text = 'Now we are going to change the game slightly.';

      var section2_text = '';
    }

    // text for the second page (instruction screen)
    if (trial.trial_type == 'ISTc') {
      switch(trial.confidenceFrequency) {
        case 'trial':
          if (trial.isFirstTime) {
            section2_text += '<br><br>' +
              'After you press the response button, a popup will appear at the bottom of the screen, asking you to <highlight style="color: rgb(13,255,146)"><b>rate your confidence for your choice</b></highlight>.';

          } else {
            section2_text += '<br><br>' +
              'From now on, after pressing the response button, a popup will appear at the bottom of the screen, asking you to <highlight style="color: rgb(13,255,146)"><b>rate your confidence for your choice</b></highlight>.';
          }
          break;

        case 'randomInt':
          if (trial.isFirstTime) {
            section2_text += '<br><br>' +
              'Every so often during the game, a popup will appear at the bottom of the screen, asking you to <highlight style="color: rgb(13,255,146)"><b>guess the majority colour and rate your confidence</b></highlight> for that guess.';

          } else {
            section2_text += '<br><br>' +
              'From now on, every so often during the game, a popup will appear at the bottom of the screen, asking you to <highlight style="color: rgb(13,255,146)"><b>guess the majority colour and rate your confidence</b></highlight> for that guess.';
          }
          break;

        case 'tile':
          if (trial.isFirstTime) {
            section2_text += '<br><br>' +
              'Every time after you select a tile, a popup will appear at the bottom of the screen, asking you to <highlight style="color: rgb(13,255,146)"><b>guess the majority colour and rate your confidence</b></highlight> for that guess.';

          } else {
            section2_text += '<br><br>' +
              'From now on, every time after you select a tile, a popup will appear at the bottom of the screen, asking you to <highlight style="color: rgb(13,255,146)"><b>guess the majority colour and rate your confidence</b></highlight> for that guess.';
          }
          break;
      }
    } else if (trial.trial_type == "forced") {
      section2_text += '<br><br>' +
        'You will now be playing the same game as before, but from now on, <highlight style="color: rgb(13,255,146)">the computer will decide when you must give your answer about the majority colour.</highlight> <br><br> At the beginning of the game, the response buttons will be grey. But after selecting a number of tiles predetermined by the computer, <highlight style="color: rgb(13,255,146)">the response buttons will change from grey to the colours of the tiles.</highlight> At this point, you will no longer be able to select any more tiles and must give your best answer about the majority colour.';

    } else {
      if (trial.isFirstTime) {
        section2_text += '<br><br>' +
        'You will be awarded points for pressing the response button that matches the majority colour. The total number of points you earn throughout the various games in this experiment will be converted to a <b>cash bonus</b> at the end of the experiment.';
      } else {
        section2_text += '<br><br>' +
        'In the following game rounds, you will no longer asked to rate your confidence about the majority colour. <br><br> Everything else about the game remains the same: you will be awarded points for pressing the response button that matches the majority colour. The total number of points you earn throughout the various games in this experiment will be converted to a <b>cash bonus</b> at the end of the experiment.';
      }
    }

    /* HELPER FUNCTION: Intro.js tooltips */
    function introIST1() {
      var intro = introJs();
      intro.setOptions({
        nextLabel: 'Next',
        prevLabel: 'Back',
        keyboardNavigation: false,
        exitOnOverlayClick: false,
        showStepNumbers: false,
        showBullets: false,
        showProgress: false,
        scrollToElement: false,
        steps: [
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: 'Your task is to decide what the underlying colour of the majority of tiles is. Before making your decision, you can select as many tiles as you like. <br><br> Please click <b>Next</b> to continue.',
            position: 'center'
          },
          {
            element: document.querySelector('#gameboard'),
            intro: 'This is the <b>gameboard</b>. You can click on a tile to reveal its underlying colour.',
            position: 'left'
          },
          {
            element: document.querySelector('#left-response'),
            intro: 'This is a <b>response button</b>. To indicate your final answer for the majority colour, click on the matching response button.',
            position: 'center'
          },
          {
            element: document.querySelector('#scoreboard'),
            intro: 'This board will show the <b>game mode</b> (how points are scored) during the game. <br><br> In addition, after pressing a response button, the number of points you won or lost on that round of the game will be shown here. The score will flash <b style="color: rgb(13,255,146)">green</b> for correct responses and <b style="color: rgba(255,0,51,1)">red</b> for incorrect responses.',
            position: 'bottom-middle-aligned'
          },
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: 'Click on the <b>Done</b> button in this tooltip to close the tutorial, or the <b>Back</b> button in this tooltip to see previous tutorial instructions again. <br><br> After closing the tutorial, you will need to complete <b>this practice round of the game</b> before this instruction page automatically continues.',
            position: 'center'
          }
        ]
      });

      intro.start();
      intro.onbeforechange(function () {
        isTooltipsOn = true;
        $('.introjs-prevbutton, .introjs-nextbutton').css('display', 'inline-block');
        $('.gameboard, .response-button').css('pointer-events', 'none');
        $('.scale-row, .submit-button').addClass('unclickable');
      });
      intro.onafterchange(function (targetElement) {
        var stepNumber = intro.getCurrentStepInfo()._currentStep;
        // console.log(stepNumber);
        if (stepNumber == 4) {
          $('.introjs-nextbutton').css('display', 'none');
        }
      });
      intro.onbeforeexit(function () {
        return false;
      });
      intro.oncomplete(function () {
        intro.onbeforeexit(function () {
          isTooltipsOn = false;
          $('.scale-row, .submit-button').removeClass('unclickable');
          $('.gameboard, .response-button').css('pointer-events', 'auto');
          $('.gameboard').off('click');
          return true;
        });
        intro.exit();
      });
    }

    function introIST2() {
      var intro = introJs();
      intro.setOptions({
        nextLabel: 'Next',
        prevLabel: 'Back',
        keyboardNavigation: false,
        exitOnOverlayClick: false,
        showStepNumbers: false,
        showBullets: false,
        showProgress: false,
        scrollToElement: false,
        steps: [
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: 'Your task is to decide what the underlying colour of the majority of tiles is. Before making your decision, you can select as many tiles as you like. <br><br> <highlight style="color: rgb(255,0,51)">In the next few rounds, you <b>will not</b> be asked to rate your confidence.</highlight> <br><br> Click on the <b>Done</b> button in this tooltip to close this tooltip. Once you complete this practice round, this instruction page will automatically continue.',
            position: 'center'
          }
        ]
      });

      intro.start();
      intro.onbeforechange(function () {
        isTooltipsOn = true;
        $('.introjs-prevbutton, .introjs-nextbutton').css('display', 'inline-block');
        $('.gameboard, .response-button').css('pointer-events', 'none');
        $('.scale-row, .submit-button').addClass('unclickable');
      });
      intro.onafterchange(function (targetElement) {
        var stepNumber = intro.getCurrentStepInfo()._currentStep;
        // console.log(stepNumber);
      });
      intro.onbeforeexit(function () {
        return false;
      });
      intro.oncomplete(function () {
        intro.onbeforeexit(function () {
          isTooltipsOn = false;
          $('.scale-row, .submit-button').removeClass('unclickable');
          $('.gameboard, .response-button').css('pointer-events', 'auto');
          $('.gameboard').off('click');
          return true;
        });
        intro.exit();
      });
    }

    function introRandInt1() {
      var intro = introJs();
      intro.setOptions({
        nextLabel: 'Next',
        prevLabel: 'Back',
        keyboardNavigation: false,
        exitOnOverlayClick: false,
        showStepNumbers: false,
        showBullets: false,
        showProgress: false,
        scrollToElement: false,
        steps: [
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: 'Your task is to decide what the underlying colour of the majority of tiles is. Before making your decision, you can select as many tiles as you like. <br><br> In addition, at some points in this game you will be asked to rate your confidence in your choice or your guess about the majority colour. <br><br> Please click <b>Next</b> to continue.',
            position: 'center'
          },
          {
            element: document.querySelector('#gameboard'),
            intro: 'This is the <b>gameboard</b>. You can click on a tile to reveal its underlying colour.',
            position: 'left'
          },
          {
            element: document.querySelector('#left-response'),
            intro: 'This is a <b>response button</b>. To indicate your final decision about the majority colour of the gameboard, click on the matching response button.',
            position: 'center'
          },
          {
            element: document.querySelector('#scoreboard'),
            intro: 'This board will show the <b>game mode</b> (how points are scored) during the game. <br><br> In addition, after you press a response button, the board will show the number of points you won or lost on that round of the game. The score will flash <b style="color: rgb(13,255,146)">green</b> for correct responses and <b style="color: rgba(255,0,51,1)">red</b> for incorrect responses.',
            position: 'bottom-middle-aligned'
          },
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: '<highlight style="color: rgb(255,0,51)"><b>Click on any tile and then click Next to continue.</b></highlight>'
          },
          {
            element: document.querySelector('.noDragSlider'),
            intro: 'Below is the <b>confidence rating popup</b>. Each time this popup appears, we want you to guess what colour you think the majority of the tiles is and rate your confidence for that guess. <br><br> The <b>colour</b> of the rating bar indicates which colour you think is the majority. <br><br> The <b>length</b> of the rating bar indicates how confident you are of that guess.',
          },
          {
            element: document.querySelector('.scale'),
            intro: 'To change the colour or length of the rating bar, hover your cursor over the rating bar. <br><br> When you are satisfied with the colour and length of the rating bar, left-click to submit your rating.'
          },
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: 'Click on the <b>Done</b> button in this tooltip to close the tutorial and finish your confidence rating, or use the <b>Back</b> button in this tooltip to see previous tutorial instructions again. <br><br> After closing the tutorial, you will need to complete <b>this practice round of the game</b> before this instruction page automatically continues.',
            position: 'center'
          }
        ]
      });

      intro.start();
      intro.onbeforechange(function () {
        isTooltipsOn = true;
        $('.introjs-prevbutton, .introjs-nextbutton').css('display', 'inline-block');
        $('.gameboard, .response-button').css('pointer-events', 'none');
        $('.scale-row, .submit-button').addClass('unclickable');
      });
      intro.onafterchange(function (targetElement) {
        var stepNumber = intro.getCurrentStepInfo()._currentStep;
        console.log(stepNumber);
        if (stepNumber <= 1) {
          $('.introjs-prevbutton').css('display', 'none');
        }
        if (stepNumber == 4) {
          $('.gameboard').css('pointer-events', 'auto');
          $('.introjs-nextbutton').css('display', 'none');
          $('.gameboard').on('click', function () {
            $('.gameboard').css('pointer-events', 'none');
            $('.introjs-nextbutton').css('display', 'inline-block');
          });
        }
        if (stepNumber == 5) {
          $('.introjs-prevbutton').css('display', 'none');
        }
        if (stepNumber == 7) {
          $('.introjs-nextbutton').css('display', 'none');
        }
      });
      intro.onbeforeexit(function () {
        return false;
      });
      intro.oncomplete(function () {
        intro.onbeforeexit(function () {
          isTooltipsOn = false;
          $('.scale-row, .submit-button').removeClass('unclickable');
          $('.response-button').css('pointer-events', 'auto');
          $('.gameboard').off('click');
          return true;
        });
        intro.exit();
      });
    }

    function introRandInt2() {
      var intro = introJs();
      intro.setOptions({
        nextLabel: 'Next',
        prevLabel: 'Back',
        keyboardNavigation: false,
        exitOnOverlayClick: false,
        showStepNumbers: false,
        showBullets: false,
        showProgress: false,
        scrollToElement: false,
        steps: [
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: 'Your task is to decide what the underlying colour of the majority of tiles is. Before making your decision, you can select as many tiles as you like. <br><br> In addition, at some points in this game you will be asked to rate your confidence in your choice or your guess about the majority colour. <br><br> Please click <b>Next</b> to continue.',
            position: 'center'
          },
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: '<highlight style="color: rgb(255,0,51)"><b>Click on any tile and then click Next to continue.</b></highlight>'
          },
          {
            element: document.querySelector('.noDragSlider'),
            intro: 'Below is the <b>confidence rating popup</b>. Each time this popup appears, we want you to guess what colour you think the majority of the tiles is and rate your confidence for that guess. <br><br> The <b>colour</b> of the rating bar indicates which colour you think is the majority. <br><br> The <b>length</b> of the rating bar indicates how confident you are of that guess.',
          },
          {
            element: document.querySelector('.scale'),
            intro: 'To change the colour or length of the rating bar, hover your cursor over the rating bar. <br><br> When you are satisfied with the colour and length of the rating bar, left-click to submit your rating.'
          },
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: 'Click on the <b>Done</b> button in this tooltip to close the tutorial and finish your confidence rating, or use the <b>Back</b> button in this tooltip to see previous tutorial instructions again. <br><br> After closing the tutorial, you will need to complete <b>this practice round of the game</b> before this instruction page automatically continues.',
            position: 'center'
          }
        ]
      });

      intro.start();
      intro.onbeforechange(function () {
        isTooltipsOn = true;
        $('.introjs-prevbutton, .introjs-nextbutton').css('display', 'inline-block');
        $('.gameboard, .response-button').css('pointer-events', 'none');
        $('.scale-row, .submit-button').addClass('unclickable');
      });
      intro.onafterchange(function (targetElement) {
        var stepNumber = intro.getCurrentStepInfo()._currentStep;
        // console.log(stepNumber);
        if (stepNumber <= 1) {
          $('.introjs-prevbutton').css('display', 'none');
          $('.gameboard').css('pointer-events', 'auto');
          if (stepNumber == 1) {
            $('.introjs-nextbutton').css('display', 'none');
            $('.gameboard').on('click', function () {
              $('.gameboard').css('pointer-events', 'none');
              $('.introjs-nextbutton').css('display', 'inline-block');
            });
          }
        }
        if (stepNumber == 4) {
          $('.introjs-nextbutton').css('display', 'none');
        }
      });
      intro.onbeforeexit(function () {
        return false;
      });
      intro.oncomplete(function () {
        intro.onbeforeexit(function () {
          isTooltipsOn = false;
          $('.scale-row, .submit-button').removeClass('unclickable');
          $('.response-button').css('pointer-events', 'auto');
          $('.gameboard').off('click');
          return true;
        });
        intro.exit();
      });
    }

    function introForced() {
      var intro = introJs();
      intro.setOptions({
        nextLabel: 'Next',
        prevLabel: 'Back',
        keyboardNavigation: false,
        exitOnOverlayClick: false,
        showStepNumbers: false,
        showBullets: false,
        showProgress: false,
        scrollToElement: false,
        steps: [
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: 'Your task is still to decide what the underlying colour of the majority of tiles is. <br><br> However, from now on, the computer will determine when you must make your decision. <br><br> Please click <b>Next</b> to continue.',
            position: 'center'
          },
          {
            element: document.querySelector('#left-response'),
            intro: 'Both response buttons will be greyed out at the beginning of the game.',
            position: 'center'
          },
          {
            element: document.querySelector('#scoreboard'),
            intro: 'When the computer thinks you need to decide, this board will flash with the message "DECIDE NOW", and the response buttons will change colour. <br><br> At that point, please click on the response button that you think shows the underlying colour of the majority of tiles.',
            position: 'bottom-middle-aligned'
          },
          {
            element: document.querySelector('#ISTc-tutorial-section3'),
            intro: 'Click on the <b>Done</b> button in this tooltip to close the tutorial, or use the <b>Back</b> button in this tooltip to see previous tutorial instructions again. <br><br> After closing the tutorial, you will need to complete <b>this practice round of the game</b> before this instruction page automatically continues.',
            position: 'center'
          }
        ]
      });

      intro.start();
      intro.onbeforechange(function () {
        isTooltipsOn = true;
        $('.introjs-prevbutton, .introjs-nextbutton').css('display', 'inline-block');
        $('.gameboard, .response-button').css('pointer-events', 'none');
        $('.scale-row, .submit-button').addClass('unclickable');
      });
      intro.onafterchange(function (targetElement) {
        var stepNumber = intro.getCurrentStepInfo()._currentStep;
        // console.log(stepNumber);
        if (stepNumber < 1) {
          $('.introjs-prevbutton').css('display', 'none');
        }
        if (stepNumber == 3) {
          $('.introjs-nextbutton').css('display', 'none');
        }
      });
      intro.onbeforeexit(function () {
        return false;
      });
      intro.oncomplete(function () {
        intro.onbeforeexit(function () {
          isTooltipsOn = false;
          $('.scale-row, .submit-button').removeClass('unclickable');
          $('.gameboard').css('pointer-events', 'auto');
          return true;
        });
        intro.exit();
      });
    }

    /* SECTION 1: Welcome */
    var section1 = createGeneral(
      section1,
      display_element,
      'section',
      'tutorial-section section1',
      'ISTc-tutorial-section1',
      ''
    );

    var section1_title = createGeneral(
      section1_title,
      section1,
      'div',
      'tutorial-text',
      'ISTc-tutorial-text1',
      section1_text
    );

    var scrollIcon = scrolldownIndicator(section1_title, 1, true);

    /* SECTION 2: Overview */
    var section2 = createGeneral(
      section2,
      display_element,
      'section',
      'tutorial-section section2',
      'ISTc-tutorial-section2',
      ''
    );

    // change the gameboard gif for IST
    if (trial.trial_type == 'IST') {
      var section2_image = createGeneral(
        section2_image,
        section2,
        'div',
        'gameboard-gif',
        'IST-gameboard-gif',
        ''
      );
    } else if (trial.trial_type == "ISTc") {
      var section2_image = createGeneral(
        section2_image,
        section2,
        'div',
        'gameboard-gif',
        'ISTc-gameboard-gif',
        ''
      );
    } else if (trial.trial_type == "forced") {
      var section2_image = createGeneral(
        section2_image,
        section2,
        'div',
        'gameboard-gif',
        'ISTc-forced-gameboard-gif',
        ''
      );
    }

    var section2_title = createGeneral(
      section2_title,
      section2,
      'div',
      'tutorial-text',
      'ISTc-tutorial-text2',
      '<div id="section2-text">' + section2_text + '</div>'
    );

    var scrollIcon = scrollIndicator(section2, 2, false);

    /* SECTION 3: Practice gameboard - with Intro.js tooltips! */
    var section3 = createGeneral(
      section3,
      display_element,
      'section',
      'tutorial-section section3',
      'ISTc-tutorial-section3',
      ''
    );

    // define the section in which the gameboard should be called, before calling the gameboard
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

     if (trial.trial_type == 'forced') {
       resetGameboard_forced(
         display_element,
         section3,
         trial.trial_type,
         trial.score_rule,
         trial.trial_count,
         trialCounter,
         trial.difficulty_level,
         trial.colors_list,
         trial.showBoard,
         isTutorialMode,
         dataObject,
         trial.confidenceFrequency,
         confidenceTrials,
         trial.showScoreboard,
         trial.showRule,
         trial.feedbackFreq,
         trial.showScore,
         trial.showCumulative,
         [0.75],
         2
       )
     } else {
       resetGameboard(
         display_element,
         section3,
         trial.trial_type,
         trial.score_rule,
         trial.trial_count,
         trialCounter,
         trial.difficulty_level,
         trial.colors_list,
         trial.showBoard,
         isTutorialMode,
         dataObject,
         trial.confidenceFrequency,
         confidenceTrials,
         trial.showScoreboard,
         trial.showRule,
         trial.feedbackFreq,
         trial.showScore,
         trial.showCumulative
       );
     }

    // prevent user from clicking the gameboard or the response buttons before the tutorial has started
    $('.gameboard, .response-button').css('pointer-events', 'none');

    var startTime = Date.now();

    var startTutorialButton = createGeneral(
      startTutorialButton,
      section3,
      'button',
      'default-green-button glowy-box start-tutorial',
      'ISTc-start-tutorial',
      'CLICK HERE TO START <br> THE GAME TUTORIAL'
    );

    $('#ISTc-start-tutorial').on('click', function () {
      if (tutorialIndex == 0) {
        $('.start-tutorial').css('display', 'none');

        if (trial.trial_type == 'IST') {
          if (trial.isFirstTime) {
            introIST1();
          } else {
            introIST2();
          }

        } else if (trial.trial_type == 'ISTc' && trial.confidenceFrequency == 'randomInt') {
          if (trial.isFirstTime) {
            introRandInt1();
          } else {
            introRandInt2();
          }

        } else if (trial.trial_type == 'forced' && trial.confidenceFrequency == 'randomInt') {
          introForced();
        }

        $.scrollify.disable();
        tutorialIndex++;
        // console.log(tutorialIndex);
      }
    });

    // make sure page starts at the top every time
    // console.log('reached bottom');
    $('html, body').animate({
      scrollTop: $('#ISTc-tutorial-section1').offset().top
    }, 1);
  }; // close plugin.trial

  return plugin;
})(); // close the plugin as an anonymous function