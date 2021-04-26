/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-score-reveal'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-score-reveal',
    parameters: {
      performanceType: {
        type: jsPsych.plugins.parameterType.STRING,
        description: 'Possible variations: "accuracy", "score", "Brier".'
      },
      bonusThreshold: {
        type: jsPsych.plugins.parameterType.INT,
        description: 'Only used for "accuracy" type calculations',
        default: 0
      },
      flatBonusAmount: {
        type: jsPsych.plugins.parameterType.INT,
        description: 'Only used for "accuracy" type calculations',
        default: 0
      },
      conversionFactor: {
        type: jsPsych.plugins.parameterType.FLOAT,
        description: 'Only used for "score" and "Brier" type calculations',
        default: 0.0003
      },
    }
  };

  plugin.trial = function (display_element, trial) {
    var paymentMessage;
    var currentBonus;
    var newBonusPayment;

    // // calculate overall accuracy
    // dots_overallAccuracy = round(totalCorrect / totalTrials, 2) * 100;
    //
    // //jointOverallAccuracy = round(dots_jointTotalCorrect / totalTrials, 2) * 100;
    //
    // var accurate = 0;
    // for (var block=3; block <=5; block++) {
    //   accurate += dataObject["block_accuracy"][block];
    // }
    // accurate += accuracy;   //for the last block as this has not yet been pushed to the dataObject
    // jointOverallAccuracy = accurate / 4;

    switch(trial.performanceType) {
      case 'accuracy':
        var paymentPerCorrectDecision = 2;
        var bonusPayment  = round(overallScore * paymentPerCorrectDecision / 100, 2);

        dataObject["score"] = overallScore;
        dataObject["bonus_payment"] = bonusPayment;

        paymentMessage = 'Congratulations, you have made ' + overallScore + ' correct decisions in this experiment!';
        break;


      case 'brier':
        var paymentFactor = 2;
        overallScore = round(overallScore, 2);
        var bonusPayment  = round(overallScore * paymentFactor / 100, 2);
        dataObject["score"] = overallScore;
        dataObject["bonus_payment"] = bonusPayment;

        paymentMessage = 'Congratulations, you have reached a score of ' + overallScore + ' in this experiment!';
        break;

    }

    // clear display element and apply page default styles
    display_element.innerHTML = '';
    $('body')
      .css('height', 'auto')
      .css('background-color', 'black')
      .css('overflow', 'hidden');
    $.scrollify.destroy();

    var splashPage = createGeneral(
      splashPage,
      display_element,
      'section',
      'section',
      'score-reveal-page',
      ''
    );

    var fullscreenMessage = createGeneral(
      fullscreenMessage,
      splashPage,
      'div',
      'main-message',
      'score-reveal-message',
      '<h1>' + paymentMessage + '</h1>'
    );

    var subMessage = createGeneral(
      subMessage,
      splashPage,
      'div',
      'sub-message',
      'score-reveal-submessage',
      'This equates to a cash bonus of £' + bonusPayment + ' for you :)'
    );

    var continueButton = createGeneral(
      continueButton,
      splashPage,
      'button',
      'default-green-button',
      'score-reveal-continue',
      'CONTINUE'
    );

    continueButton.onclick = function() {
      //bonusPayment = newBonusPayment;
      jsPsych.finishTrial();
      return;
    };

    // make sure page starts at the top every time
    $(document).ready(function () {
      $(this).scrollTop(0);
    });
  };

  return plugin;
})();
