/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-PHQ9'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-PHQ9',
    parameters: {
      name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Questionnaire Name',
        default: 'PHQ9',
        description: 'The formal name of the questionnaire.'
      },
      intro: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Introductory Statement',
        default: 'Over the <u>last 2 weeks</u>, how often have you been bothered by any of the following problems?',
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
            'Little interest or pleasure in doing things',
            'Feeling down, depressed, or hopeless',
            'Trouble falling or staying asleep, or sleeping too much',
            'Feeling tired or having little energy',
            'Poor appetite or overeating',
            'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
            'Trouble concentrating on things, such as reading the newspaper or watching television',
            'Moving or speaking so slowly that other people could have noticed? Or the opposite -- being so fidgety or restless that you have been moving around a lot more than usual',
            'Thoughts that you would be better off dead or of hurting yourself in some way'
          ],
          page2: [
            'If you checked off <b>any</b> of the above, how <b>difficult</b> have these problems made it for you to do your work, take care of things at home, or get along with other people?'
          ]
        },
        description: 'Questionnaire questions.'
      },
      options: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Options',
        default: [
          'not at all',
          'several days',
          'more than half the days',
          'nearly every day'
        ],
        description: 'Questionnaire response options.'
      },
      scoreKey: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Score Key',
        default: {
          'not at all': 0,
          'several days': 1,
          'more than half the days': 2,
          'nearly every day': 3
        }
      },
      redirectLink: {
        type: jsPsych.plugins.parameterType.STRING,
        default: ''
      },
      activeBracketing: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        default: false
      }
    }
  };

  plugin.trial = function (display_element, trial) {
    // question number keys
    var questionKeys = {
      'PHQ9_page1-0': 0,
      'PHQ9_page1-1': 1,
      'PHQ9_page1-2': 2,
      'PHQ9_page1-3': 3,
      'PHQ9_page1-4': 4,
      'PHQ9_page1-5': 5,
      'PHQ9_page1-6': 6,
      'PHQ9_page1-7': 7,
      'PHQ9_page1-8': 8,
      'PHQ9_page2-0': 9
    };

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

    // empty response object to store responses and RTs
    var score = 0;
    var onlyOnce = 0;
    var questionRTs = {};

    /* change these parameters to adjust the survey matrix appearance (CSS) */
    var containerWidth = 80;
    var quarterContainerWidth = 0.25 * containerWidth;
    var questionWidth = 0.5 * containerWidth;
    var opterWidth = 0.5 * containerWidth;
    var optionWidth = opterWidth / trial.options.length;
    var questionHeight = 10;
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
      'PHQ-titlepage',
      '<div><h1>' + trial.intro + '</h1></div>' + '<p>' + trial.subtitle + '</p>'
    );

    scrollIndicator(titlepage, 1, true);

    var PHQ_section1 = createGeneral(
      PHQ_section1,
      display_element,
      'section',
      'surveyMatrix',
      'PHQ-section1',
      ''
    );

    createSurveyMatrix(
      PHQ_section1,
      'page1',
      trial.name,
      trial.questions.page1,
      trial.options
    );

    setTimeout(function() {
      // start the timer
      var startTime = Date.now();
      var startQuestion = Date.now();

      // define what happpens when people click on the option area (not just the radio)
      $('#jspsych-content').on('click', '#PHQ-section1 .surveyMatrix-option', function(event) {
        // record the question RT
        var endQuestion = Date.now();
        var questionRT = calculateRT(startQuestion, endQuestion);
        // record the question data
        var questionName = $(this).children('input').attr('name');
        var questionAnswer = $(this).children('input').prop('value');
        // save data in dataObject
        dataObject.PHQ_QA[questionName] = questionAnswer;
        questionRTs[questionName] = questionRT;

        // restart the timer
        startQuestion = Date.now();

        // once they fill out the entire first section, the second section will appear and screen will automatically scroll down to it
        if ($(':checked').length == trial.questions.page1.length && onlyOnce == 0) {
          // once they fill out the entire first section, the second section will appear and screen will automatically scroll down to it

          var PHQ_section2 = createGeneral(
            PHQ_section2,
            display_element,
            'section',
            'surveyMatrix',
            'PHQ-section2',
            ''
          );

          createSurveyMatrix(
            PHQ_section2,
            'page2',
            trial.name,
            trial.questions.page2,
            trial.options
          );

          var submitButton = createGeneral(
            submitButton,
            PHQ_section2,
            'button',
            'default-green-button',
            'PHQ-submit',
            'CONTINUE'
          );
          submitButton.setAttribute('type', 'submit');
          $('#PHQ-submit').css('display', 'none');
          onlyOnce++;

          $.scrollify.update();

          $('html, body').animate({
            scrollTop: $('#PHQ-section2').offset().top
          }, 1000);
        }
        return;
      });

      $('#jspsych-content').on('click', '#PHQ-section2 .surveyMatrix-option', function () {
        // record the question RT
        var endQuestion = Date.now();
        var questionRT = calculateRT(startQuestion, endQuestion);
        // record the question data
        var questionName = $(this).children('input').attr('name');
        var questionAnswer = $(this).children('input').prop('value');
        // save data in dataObject
        dataObject.PHQ_QA[questionName] = questionAnswer;
        questionRTs[questionName] = questionRT;

        // restart the timer
        startQuestion = Date.now();

        // add another event listener: if the number of checked items equals the number of questions, then unhide the submit button
        if ($(':checked').length == trial.questions.page2.length + trial.questions.page1.length) {
          $('#PHQ-submit').fadeIn().css('display', 'flex');

          // define what happens when people click on the final submit button
          $('#PHQ-submit').on('click', function () {
            var endTime = Date.now();
            var questionnaireRT = calculateRT(startTime, endTime);
            for (i = 0; i < trial.questions.page1.length; i++) {
              questionScore = trial.scoreKey[dataObject.PHQ_QA['PHQ9_page1-' + i]];
              score += questionScore;
              dataObject['PHQ_scorelist'].push(questionScore);
              dataObject['PHQ_RTs'].push(questionRTs['PHQ9_page1-' + i]);
            }
            for (i = 0; i < trial.questions.page2.length; i++) {
              dataObject['PHQ_RTs'].push(questionRTs['PHQ9_page2-' + i]);
            }
            dataObject['PHQ_score'] = score;
            dataObject['PHQ_duration'] = questionnaireRT;
            console.log(dataObject);

            if (trial.activeBracketing && (dataObject.PHQ_QA['PHQ9_page1-8'] == "nearly every day")) {
              display_element.innerHTML = '';
              $('body').css('height', 'auto').css('overflow', 'auto');
              $.scrollify.destroy();

              var splashPage = createGeneral(
                splashPage,
                display_element,
                'section',
                'message-splash',
                'PHQ-exclusion-splashPage',
                ''
              );

              var fullscreenMessage = createGeneral(
                fullscreenMessage,
                splashPage,
                'div',
                'exclusion-page',
                'PHQ-exclusion-message',
                '<h1 style="font-size: 4vmin; text-align: center">Sorry but your scores do not meet our inclusion criteria for the rest of the experiment. The following is some information that you may find useful.</h1><br>'
                + '<p>Our moods can change from day to day. However, for some people, their mood may remain low for some time. If this applies to you and you are based in Oxford, we would like to point out several sources of advice or help which are free and readily available to you, and which may prove useful. Specifically, these include:</p>'
                + '<br>'
                + '<b>(1) Your General Practitioner</b><br><br>'
                + '<b>(2) Your College nurse (where available)</b><br><br>'
                + '<b>(3) Your University Counselling Service (where available). Students at the <a href="http://www.ox.ac.uk/students/welfare/counselling?wssl=1/" target="_blank">University of Oxford</a> and <a href="http://www.brookes.ac.uk/students/wellbeing/counselling/" target="_blank">Oxford Brookes University</a> should feel free to contact their respective University Counselling Services for more information.</b><br><br>'
                + '<b>(4) NHS 111</b><br><br>'
                + '<b>(5) Helplines, including The Samaritans (<a href="tel:116123">116 123</a>), the Mental Health Crisis Line (<a href="tel:01865251152">01865 251152</a>), and the Listening Service for Oxford University students (<a href="tel:01865270270">01865 270270</a>)</b><br>'
                + '<br>'
                + '<p>If you would like more information, or a confidential discussion with a senior member of the research team, please contact Professor Nicholas Yeung by <a href="mailto:nicholas.yeung@psy.ox.ac.uk?cc=linda.wei@psy.ox.ac.uk&subject=' + trial.CUREC_ID + '">email</a> or <a href="tel:441865271389">phone</a>.</p>'
                + '<h2><br><br>Thank you for taking part in our study!<br>Please return to Prolific to claim your participant payment by clicking <a href=' + trial.redirectLink + '>here</a>.</h2>'
              );
            } else {
              jsPsych.finishTrial();
              return;
            }
          });
        }
      });
    }, 250);

    // make sure the page scrolls up to the top when initial loading is complete
    $('html, body').animate({
      scrollTop: $('#PHQ-titlepage').offset().top
    }, 1);
  }; // close plugin.trial

  return plugin; // close plugin
})();
