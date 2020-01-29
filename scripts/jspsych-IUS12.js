/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-IUS12'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-IUS12',
    parameters: {
      name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Questionnaire Name',
        default: 'IUS-12',
        description: 'The formal name of the questionnaire.'
      },
      intro: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Introductory Statement',
        default: 'A number of statements which people have used to describe themselves are given below. Please select the option that corresponds to how much you generally agree with each statement.',
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
            'Unforeseen events upset me greatly',
            'It frustrates me not having all the information I need',
            'Uncertainty keeps me from living a full life',
            'One should always look ahead so as to avoid surprises',
            'A small unforeseen event can spoil everything, even with the best of planning',
            'When it\'s time to act, uncertainty paralyses me'
          ],
          page2: [
            'When I\'m uncertain, I can\'t function very well',
            'I always want to know what the future has in store for me',
            'I can\'t stand being taken by surprise',
            'The smallest doubt can stop me from acting',
            'I should be able to organise everything in advance',
            'I must get away from all uncertain situations'
          ]
        },
        description: 'Questionnaire questions.'
      },
      options: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Options',
        default: [
          'not at all characteristic of me',
          'a little characteristic of me',
          'somewhat characteristic of me',
          'very characteristic of me',
          'entirely characteristic of me'
        ],
        description: 'Questionnaire response options.'
      },
      scoreKey: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Score Key',
        default: {
          'not at all characteristic of me': 1,
          'a little characteristic of me': 2,
          'somewhat characteristic of me': 3,
          'very characteristic of me': 4,
          'entirely characteristic of me': 5
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
    var fifthContainerWidth = 0.2 * containerWidth; // this name has been changed to better reflect the options
    var questionWidth = 0.5 * containerWidth;
    var opterWidth = 0.5 * containerWidth;
    var optionWidth = opterWidth / trial.options.length;
    var questionHeight = 14;
    var doubleQuestionHeight = 2 * questionHeight;
    var questionFontSize = 2;
    var optionFontSize = 0.95;

    document.body.style.setProperty('--containerWidth', containerWidth + 'vw');
    // this name should be changed
    document.body.style.setProperty('--quarterContainerWidth', fifthContainerWidth + 'vw');
    document.body.style.setProperty('--questionWidth', questionWidth + 'vw');
    document.body.style.setProperty('--opterWidth', opterWidth + 'vw');
    document.body.style.setProperty('--optionWidth', optionWidth + 'vw');
    document.body.style.setProperty('--questionHeight', questionHeight + 'vh');
    document.body.style.setProperty('--doubleQuestionHeight', doubleQuestionHeight + 'vh');
    document.body.style.setProperty('--questionFontSize', questionFontSize + 'vmax')
    document.body.style.setProperty('--optionFontSize', optionFontSize + 'vmax');

    /* BUILD THE SURVEY IN THE DOM */
    var titlepage = createGeneral(
      titlepage,
      display_element,
      'section',
      'titlepage',
      'IUS-titlepage',
      '<div><h1>' + trial.intro + '</h1></div>' + '<p>' + trial.subtitle + '</p>'
    );

    scrollIndicator(titlepage, 1, true);

    var IUS_section1 = createGeneral(
      IUS_section1,
      display_element,
      'section',
      'surveyMatrix',
      'IUS-section1',
      ''
    );

    createSurveyMatrix(
      IUS_section1,
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
      $('#jspsych-content').on('click', '#IUS-section1 .surveyMatrix-option', function() {
        // record the question RT
        var endQuestion = Date.now();
        var questionRT = calculateRT(startQuestion, endQuestion);
        // record the question data
        var questionName = $(this).children('input').attr('name');
        var questionAnswer = $(this).children('input').prop('value');
        // save data in dataObject
        dataObject.IUS_QA[questionName] = questionAnswer;
        questionRTs[questionName] = questionRT;

        // reset the trial timer
        startQuestion = Date.now();

        // once they fill out the entire first section, the second section will appear and screen will automatically scroll down to it
        if ($(':checked').length == trial.questions.page1.length && onlyOnce == 0) {
          // once they fill out the entire first section, the second section will appear and screen will automatically scroll down to it
          var IUS_section2 = createGeneral(
            IUS_section2,
            display_element,
            'section',
            'surveyMatrix',
            'IUS-section2',
            ''
          );
          createSurveyMatrix(
            IUS_section2,
            'page2',
            trial.name,
            trial.questions.page2,
            trial.options
          );

          var submitButton = createGeneral(
            submitButton,
            IUS_section2,
            'button',
            'default-green-button',
            'IUS-submit',
            'CONTINUE'
          );
          submitButton.setAttribute('type', 'submit');
          $('#IUS-submit').css('display', 'none');

          onlyOnce++;

          $.scrollify.update();

          $('html, body').animate({
            scrollTop: $('#IUS-section2').offset().top
          }, 1000);
        }
      });

      $('#jspsych-content').on('click', '#IUS-section2 .surveyMatrix-option', function() {
        // record the question RT
        var endQuestion = Date.now();
        var questionRT = calculateRT(startQuestion, endQuestion);
        // record the question data
        var questionName = $(this).children('input').attr('name');
        var questionAnswer = $(this).children('input').prop('value');
        // save data in dataObject
        dataObject.IUS_QA[questionName] = questionAnswer;
        questionRTs[questionName] = questionRT;

        // reset the trial timer
        startQuestion = Date.now();

        // add another event listener: if the number of checked items equals the number of questions, then unhide the submit button
        if ($(':checked').length == trial.questions.page2.length + trial.questions.page1.length) {
          $('#IUS-submit').fadeIn().css('display', 'flex');

          // define what happens when people click on the final submit button
          $('#IUS-submit').on('click', function () {
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
