/** April 2018 -- Linda Wei (https://github.com/lindaelwei)
 * IST-gameboard rewritten as a singular plugin for jsPsych.
 */

jsPsych.plugins['jspsych-IST'] = (function () {
  var plugin = {};

  plugin.info = {
    name: 'jspsych-IST',
    description: 'The Information Sampling Task (IST) - now with confidence sampling options',
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
        default: 10,
        description: 'INTEGER: the number of trials in a block. Default is 10.'
      },
      difficulty_levels: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'difficulty levels',
        default: [13, 13, 14, 14, 15, 15, 16, 16, 17, 17],
        description: 'ARRAY OBJECT: the difficulty levels possible in the block. Default is 10 values - equal to the number of trials default - ranging from 14 to 18 inclusive.'
      },
      colors_list: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'possible colours',
        default: ["#62BFED", "#E637BF", "#FE5F55", "#FFBC51", "#34D188"],
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
      confidenceTrials: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'specified confidence rating trials',
        default: [],
        description: 'ARRAY: specifies the trials on which confidence ratings will be sought. If empty array (default), the function will automatically generate a 5-item array containing one trial from each period of 1-5, 6-10, 11-15, 16-20, and 20-25.'
      },
      showScoreboard: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'show scoreboard',
        default: true,
        description: 'BOOLEAN: indicates whether the scoreboard area is shown'
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
    // reset the page defaults
    display_element.innerHTML = '';
    $('body')
      .css('display', 'block')
      .css('width', '100%')
      .css('height', '100%')
      .css('background-color', 'black')
      .css('overflow-y', 'hidden');
    $.scrollify.destroy();

    /* PLUGIN OBJECTS & VARIABLES */
    var trialCounter = 0;

    // randomly shuffle and record the difficulty levels
    var randomisedTrialDifficulty = shuffle(trial.difficulty_levels);

    // when all page elements have loaded, call resetGameboard() with params:
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
     * @param {bool} showScoreboard - show/hide scoreboard area
     * @param {bool} showRule - show game rule or (persistent) number of points per trial
     * @param {int} feedbackFreq = the number of trials after which feedback is shown
     * @param {bool} showScore = show score or accuracy feedback
     * @param {bool} showCumulative - show cumulative feedback
     */

    $(document).ready(resetGameboard(
      display_element,
      display_element,
      trial.trial_type,
      trial.score_rule,
      trial.trial_count,
      trialCounter,
      randomisedTrialDifficulty,
      trial.colors_list,
      trial.showBoard,
      false,
      dataObject,
      trial.confidenceFrequency,
      trial.confidenceTrials,
      trial.showScoreboard,
      trial.showRule,
      trial.feedbackFreq,
      trial.showScore,
      trial.showCumulative
    ));

    // scroll to top of the window (otherwise it gets stuck at the bottom due to overflow)
    $(window).scrollTop(0);
  }; // close plugin.trial

  return plugin;
})(); // close the plugin as an anonymous function