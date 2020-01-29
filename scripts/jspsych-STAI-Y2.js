/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-STAI-Y2'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-STAI-Y2',
    parameters: {
      name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Questionnaire Name',
        default: 'STAI-Y2',
        description: 'The formal name of the questionnaire.'
      },
      intro: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Introductory Statement',
        default: 'A number of statements which people have used to describe themselves are given below. Read each statement and then select the appropriate option to the right of the statement to indicate how you <u>generally feel</u>.<br><br><u>There are no right or wrong answers.</u> Do not spend too much time on any one statement but give the answer which seems to describe how you generally feel.',
        description: 'Space for a questionnaire title / leading question.'
      },
      subtitle: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Subtitle / Subheading',
        default: '',
        description: 'Space for additional information, like number of sections/pages and estimated duration.'
      },
      questions: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Questions',
        default: {
          page1: [
            'I feel pleasant',
            'I feel nervous and restless',
            'I feel satisfied with myself',
            'I wish I could be as happy as others seem to be',
            'I feel like a failure',
            'I feel rested',
            'I am "calm, cool, and collected"',
            'I feel that difficulties are piling up so that I cannot overcome them',
            'I worry too much over something that really doesn\'t matter',
            'I am happy',
            'I have disturbing thoughts'
          ],
          page2: [
            'I lack self-confidence',
            'I feel secure',
            'I make decisions easily',
            'I feel inadequate',
            'I am content',
            'Some unimportant thought runs through my mind and bothers me',
            'I take disappointments so keenly that I can\'t put them out of my mind',
            'I am a steady person',
            'I get in a state of tension or turmoil as I think over my recent concerns and interests'
          ]
        },
        description: 'Questionnaire questions.'
      },
      options: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Options',
        default: [
          'almost never',
          'sometimes',
          'often',
          'almost always'
        ],
        description: 'Questionnaire response options.'
      },
      scoreKey: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Score Key',
        default: {
          'almost never': 1,
          'sometimes': 2,
          'often': 3,
          'almost always': 4
        }
      }
    }
  };

  plugin.trial = function (display_element, trial) {
    // clear display element and apply page default styles
    display_element.innerHTML = '';
    $('body')
      .css('display', 'block')
      .css('height', 'auto')
      .css('background-color', 'black')
      .css('overflow', 'auto');
    $.scrollify.destroy();

    // set up scroll snap points (jQuery)
    $(function () {
      $.scrollify({
        section: "section",
        sectionName: "section-name",
        interstitialSection: "",
        easing: "easeOutExpo",
        scrollSpeed: 1100,
        offset: 0,
        scrollbars: true,
        standardScrollElements: "",
        setHeights: true,
        overflowScroll: true,
        updateHash: false,
        touchScroll: true,
        before: function () { },
        after: function () { },
        afterResize: function () { },
        afterRender: function () { }
      });
    });

    // make sure the page starts at the top each time
    removeHash();
    removeQueryString();

    // empty response object to store responses at the end
    var score = 0;
    var onlyOnce = 0;
    var questionRTs = {};

    /* change these parameters to adjust the survey matrix appearance (CSS) */
    var containerWidth = 80;
    var quarterContainerWidth = 0.25 * containerWidth;
    var questionWidth = 0.5 * containerWidth;
    var opterWidth = 0.5 * containerWidth;
    var optionWidth = opterWidth / trial.options.length;
    var questionHeight = 8;
    var doubleQuestionHeight = 2 * questionHeight;

    document.body.style.setProperty('--containerWidth', containerWidth + 'vw');
    document.body.style.setProperty('--quarterContainerWidth', quarterContainerWidth + 'vw');
    document.body.style.setProperty('--questionWidth', questionWidth + 'vw');
    document.body.style.setProperty('--opterWidth', opterWidth + 'vw');
    document.body.style.setProperty('--optionWidth', optionWidth + 'vw');
    document.body.style.setProperty('--questionHeight', questionHeight + 'vh');
    document.body.style.setProperty('--doubleQuestionHeight', doubleQuestionHeight + 'vh');

    /* BUILD THE SURVEY IN THE DOM */
    var titlepage = createGeneral(
      titlepage,
      display_element,
      'section',
      'titlepage',
      'STAI-titlepage',
      '<div><h1>' + trial.intro + '</h1></div>' + '<p>' + trial.subtitle + '</p>'
    );

    scrollIndicator(titlepage, 1, true);

    var STAI_section1 = createGeneral(
      STAI_section1,
      display_element,
      'section',
      'surveyMatrix',
      'STAI-section1',
      ''
    );

    createSurveyMatrix(
      STAI_section1,
      'page1',
      trial.name,
      trial.questions.page1,
      trial.options
    );

    setTimeout(function() {
      // start the timer
      var startTime = Date.now();
      var startQuestion = Date.now();

      // define what happens when people click on the survey option area (not just the radio button)
      $('#jspsych-content').on('click', '#STAI-section1 .surveyMatrix-option', function() {
        // record the question RT
        var endQuestion = Date.now();
        var questionRT = calculateRT(startQuestion, endQuestion);
        // record the question data
        var questionName = $(this).children('input').attr('name');
        var questionAnswer = $(this).children('input').prop('value');
        // save data in dataObject
        dataObject.STAI_QA[questionName] = questionAnswer;
        questionRTs[questionName] = questionRT;

        // reset the trial timer
        startQuestion = Date.now();

        // once they fill out the entire first section, the second section will appear and screen will automatically scroll down to it
        if ($(':checked').length == trial.questions.page1.length && onlyOnce == 0) {
          // once they fill out the entire first section, the second section will appear and screen will automatically scroll down to it
          var STAI_section2 = createGeneral(
            STAI_section2,
            display_element,
            'section',
            'surveyMatrix',
            'STAI-section2',
            ''
          );
          createSurveyMatrix(
            STAI_section2,
            'page2',
            trial.name,
            trial.questions.page2,
            trial.options
          );

          var submitButton = createGeneral(
            submitButton,
            STAI_section2,
            'button',
            'default-green-button',
            'STAI-submit',
            'CONTINUE'
          );
          submitButton.setAttribute('type', 'submit');
          $('#STAI-submit').css('display', 'none');

          onlyOnce++;

          $.scrollify.update();

          $('html, body').animate({
            scrollTop: $('#STAI-section2').offset().top
          }, 1000);
        }
      });

      $('#jspsych-content').on('click', '#STAI-section2 .surveyMatrix-option', function() {
        // record the question RT
        var endQuestion = Date.now();
        var questionRT = calculateRT(startQuestion, endQuestion);
        // record the question data
        var questionName = $(this).children('input').attr('name');
        var questionAnswer = $(this).children('input').prop('value');
        // save data in dataObject
        dataObject.STAI_QA[questionName] = questionAnswer;
        questionRTs[questionName] = questionRT;

        // reset the trial timer
        startQuestion = Date.now();

        // add another event listener: if the number of checked items equals the number of questions, then unhide the submit button
        if ($(':checked').length == trial.questions.page2.length + trial.questions.page1.length) {
          $('#STAI-submit').fadeIn().css('display', 'flex');

          // define what happens when people click on the final submit button
          $('#STAI-submit').on('click', function () {
            var endTime = Date.now();
            var questionnaireRT = calculateRT(startTime, endTime);
            for (i = 0; i < trial.questions.page1.length; i++) {
              questionScore = trial.scoreKey[dataObject.STAI_QA['STAI-Y2_page1-' + i]];
              score += questionScore;
              dataObject['STAI_scorelist'].push(questionScore);
              dataObject['STAI_RTs'].push(questionRTs['STAI-Y2_page1-' + i]);
            }
            for (i = 0; i < trial.questions.page2.length; i++) {
              questionScore = trial.scoreKey[dataObject.STAI_QA['STAI-Y2_page2-' + i]];
              score += questionScore;
              dataObject['STAI_scorelist'].push(questionScore);
              dataObject['STAI_RTs'].push(questionRTs['STAI-Y2_page2-' + i]);
            }
            dataObject['STAI_score'] = score;
            dataObject['STAI_duration'] = questionnaireRT;
            console.log(dataObject);

            jsPsych.finishTrial();
            // finish
            return;
          });
        }
      });
    }, 250);

    // make sure the page scrolls up to the top when initial loading is complete
    $('html, body').animate({
      scrollTop: $('#STAI-titlepage').offset().top
    }, 1);
  }; // close plugin.trial

  return plugin; // close plugin
})();
