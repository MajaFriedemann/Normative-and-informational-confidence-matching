/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-questionnaire'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-questionnaire',
    parameters: {
      name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Questionnaire name',
        description: 'The formal name of the questionnaire, used for setting the name of the sections and relating data back to the dataObject.'
      },
      shortName: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Shorthand questionnaire name',
        description: 'Shorthand name for the questionnaire, used in some section name settings'
      },
      intro: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Introductory statement',
        description: 'Space for a questionnaire title / leading question.'
      },
      subtitle: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Subtitle / subheading',
        default: '',
        description: 'Space for additional information, like number of sections/pages and estimated duration.'
      },
      questions: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Questions',
        default: {
          page1: [
            'Item1',
            'Item2'
          ],
          page2: [
            'Item3',
            'Item4'
          ]
        },
        description: 'Questionnaire questions.'
      },
      options: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Options',
        default: [
          'option1',
          'option2',
          'option3',
          'option4'
        ],
        description: 'Questionnaire response options.'
      },
      scoreKey: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Score key',
        default: {
          'option1': 1,
          'option2': 2,
          'option3': 3,
          'option4': 4,
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
    var questionQAs = {};
    var questionRTs = {};

    /* change these parameters to adjust the survey matrix appearance (CSS) */
    var containerWidth = 80;
    var resizeContainerWidth = containerWidth / trial.options.length;
    var questionWidth = 0.5 * containerWidth;
    var opterWidth = 0.5 * containerWidth;
    var optionWidth = opterWidth / trial.options.length;
    var questionHeight = 14;
    var doubleQuestionHeight = 2 * questionHeight;
    var questionFontSize = 2;
    var optionFontSize = 1;

    document.body.style.setProperty('--containerWidth', containerWidth + 'vw');
    // this name should be changed
    document.body.style.setProperty('--quarterContainerWidth', resizeContainerWidth + 'vw');
    document.body.style.setProperty('--questionWidth', questionWidth + 'vw');
    document.body.style.setProperty('--opterWidth', opterWidth + 'vw');
    document.body.style.setProperty('--optionWidth', optionWidth + 'vw');
    document.body.style.setProperty('--questionHeight', questionHeight + 'vh');
    document.body.style.setProperty('--doubleQuestionHeight', doubleQuestionHeight + 'vh');
    document.body.style.setProperty('--questionFontSize', questionFontSize + 'vmax')
    document.body.style.setProperty('--optionFontSize', optionFontSize + 'vmax');

    /* BUILD THE SURVEY IN THE DOM */
    if (trial.subtitle == '') {
      var titlepage = createGeneral(
        titlepage,
        display_element,
        'section',
        'titlepage',
        trial.shortName + '-titlepage',
        '<div><h1>' + trial.intro + '</h1></div>'
      );
    } else {
      var titlepage = createGeneral(
        titlepage,
        display_element,
        'section',
        'titlepage',
        trial.shortName + '-titlepage',
        '<div><h1>' + trial.intro + '</h1></div>' + '<p>' + trial.subtitle + '</p>'
      );
    }

    scrollIndicator(titlepage, 1, true);

    var section1 = createGeneral(
      section1,
      display_element,
      'section',
      'surveyMatrix',
      trial.shortName + '-section1',
      ''
    );

    createSurveyMatrix(
      section1,
      'page1',
      trial.name,
      trial.questions.page1,
      trial.options
    );

    setTimeout(function () {
      // start the timer
      var startTime = Date.now();
      var startQuestion = Date.now();

      // define what happens when people click on the survey option area (not just the radio button)
      $('#jspsych-content').on('click', '#' + trial.shortName + '-section1 .surveyMatrix-option', function () {
        // record the question RT
        var endQuestion = Date.now();
        var questionRT = calculateRT(startQuestion, endQuestion);
        // record the question data
        var questionName = $(this).children('input').attr('name');
        var questionAnswer = $(this).children('input').prop('value');
        // save data in dataObject
        questionQAs[questionName] = questionAnswer;
        questionRTs[questionName] = questionRT;

        // reset the trial timer
        startQuestion = Date.now();

        // once they fill out the entire first section, the second section will appear and screen will automatically scroll down to it
        if ($(':checked').length == trial.questions.page1.length && onlyOnce == 0) {
          // once they fill out the entire first section, the second section will appear and screen will automatically scroll down to it
          var section2 = createGeneral(
            section2,
            display_element,
            'section',
            'surveyMatrix',
            trial.shortName + '-section2',
            ''
          );
          createSurveyMatrix(
            section2,
            'page2',
            trial.name,
            trial.questions.page2,
            trial.options
          );

          var submitButton = createGeneral(
            submitButton,
            section2,
            'button',
            'default-green-button',
            trial.shortName + '-submit',
            'CONTINUE'
          );
          submitButton.setAttribute('type', 'submit');
          $('#' + trial.shortName + '-submit').css('display', 'none');

          onlyOnce++;

          $.scrollify.update();

          $('html, body').animate({
            scrollTop: $('#' + trial.shortName + '-section2').offset().top
          }, 1000);
        }
      });

      $('#jspsych-content').on('click', '#' + trial.shortName + '-section2 .surveyMatrix-option', function () {
        // record the question RT
        var endQuestion = Date.now();
        var questionRT = calculateRT(startQuestion, endQuestion);
        // record the question data
        var questionName = $(this).children('input').attr('name');
        var questionAnswer = $(this).children('input').prop('value');
        // save data in dataObject
        questionQAs[questionName] = questionAnswer;
        questionRTs[questionName] = questionRT;

        // reset the trial timer
        startQuestion = Date.now();

        // add another event listener: if the number of checked items equals the number of questions, then unhide the submit button
        if ($(':checked').length == trial.questions.page2.length + trial.questions.page1.length) {
          $('#' + trial.shortName + '-submit').fadeIn().css('display', 'flex');

          // define what happens when people click on the final submit button
          $('#' + trial.shortName + '-submit').on('click', function () {
            var endTime = Date.now();
            var questionnaireRT = calculateRT(startTime, endTime);
            for (i = 0; i < trial.questions.page1.length; i++) {
              questionScore = trial.scoreKey[dataObject.IUS_QA['IUS-12_page1-' + i]];
              score += questionScore;
              dataObject['IUS_scorelist'].push(questionScore);
              dataObject['IUS_RTs'].push(questionRTs['IUS-12_page1-' + i]);
            }
            for (i = 0; i < trial.questions.page2.length; i++) {
              questionScore = trial.scoreKey[dataObject.IUS_QA['IUS-12_page2-' + i]];
              score += questionScore;
              dataObject['IUS_scorelist'].push(questionScore);
              dataObject['IUS_RTs'].push(questionRTs['IUS-12_page2-' + i]);
            }
            dataObject['IUS_score'] = score;
            dataObject['IUS_duration'] = questionnaireRT;
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
      scrollTop: $('#IUS-titlepage').offset().top
    }, 1);
  }; // close plugin.trial

  return plugin; // close plugin
})();
