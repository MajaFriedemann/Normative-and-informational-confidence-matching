/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-feedback-form'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-feedback-form',
    parameters: {
      askStrategy: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: true
      }
    }
  };

  plugin.trial = function (display_element, trial) {
    var technicalExpanded = false;
    // clear display element and apply page default styles
    display_element.innerHTML = '';
    $('body')
      .css('height', 'auto')
      .css('background-color', 'black')
      .css('overflow', 'auto');
    $.scrollify.destroy();

    var options = 5;

    /* change these parameters to adjust the survey matrix appearance (CSS) */
    var containerWidth = 50;
    var quarterContainerWidth = 0.25 * containerWidth;
    var questionWidth = containerWidth;
    var opterWidth = containerWidth;
    var optionWidth = opterWidth / options;
    var questionHeight = 15;
    var doubleQuestionHeight = 2 * questionHeight;

    document.body.style.setProperty('--containerWidth', containerWidth + 'vw');
    document.body.style.setProperty('--quarterContainerWidth', quarterContainerWidth + 'vw');
    document.body.style.setProperty('--questionWidth', questionWidth + 'vw');
    document.body.style.setProperty('--opterWidth', opterWidth + 'vw');
    document.body.style.setProperty('--optionWidth', optionWidth + 'vw');
    document.body.style.setProperty('--questionHeight', questionHeight + 'vh');
    document.body.style.setProperty('--doubleQuestionHeight', doubleQuestionHeight + 'vh');

    var container = createGeneral(
      container,
      display_element,
      'div',
      '',
      'feedback-container',
      ''
    );

    var header = createGeneral(
      header,
      container,
      'div',
      'question',
      'feedback-title',
      '<h2>Some more questions...</h2>'
    );


    var technicalPoll = createGeneral(
      technicalPoll,
      container,
      'div',
      'surveyMatrix centered-poll',
      'technicalPoll',
      ''
    );

    createSurveyMatrix(
      technicalPoll,
      '',
      'technicalPoll-YN',
      ['Did you experience any technical issues during the experiment?'],
      ['Yes', 'No']
    );

    var technicalCaption = createGeneral(
      technicalCaption,
      technicalPoll,
      'div',
      'question feedback-text-small',
      'feedbackQuestion-technical',
      'Please explain the issue in the textbox below:'
    );
    $('#feedbackQuestion-technical').css('display', 'none');

    var technicalText = createGeneral(
      technicalText,
      technicalPoll,
      'textarea',
      'question textarea',
      'feedbackText-technical',
      ''
    );
    $('#feedbackText-technical').css('display', 'none');


    var feedbackCaption = createGeneral(
      feedbackCaption,
      container,
      'div',
      'question feedback-text',
      'feedbackQuestion-comments',
      'Got any additional comments and feedback about the experiment experience, user-friendliness, etc.? Tell us here!'
    );
    $('#feedbackQuestion-comments').css('text-align', 'center');

    var feedbackText = createGeneral(
      feedbackText,
      container,
      'textarea',
      'question textarea',
      'feedbackText-comments',
      ''
    );

    $('#jspsych-content').on('click', '#technicalPoll .surveyMatrix-option', function () {
      var value = $(this).children('input').prop('value');
      if (value == 'Yes') {
        dataObject["technical_issues"] = true;
      } else {
        dataObject["technical_issues"] = false;
      }

      if (value == 'Yes' && !technicalExpanded) {
        $('#feedbackQuestion-technical').css('display', 'flex');
        $('#feedbackText-technical').css('display', 'flex');
        technicalExpanded = true;
      }
    });

    var continueButton = createGeneral(
      continueButton,
      container,
      'button',
      'default-green-button',
      'feedback-continue-button',
      'CONTINUE'
    );

    continueButton.onclick = function () {
      dataObject["feedback_technical"] = technicalText.value;
      dataObject["feedback_comments"] = feedbackText.value;
      jsPsych.finishTrial();
      return;
      saveCSV(subjectID, currentAttempt);
    };
  };

  return plugin;
})();
