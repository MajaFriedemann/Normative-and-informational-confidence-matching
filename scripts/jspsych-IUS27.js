/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-IUS27'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-IUS27',
    parameters: {
      name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Questionnaire Name',
        default: 'IUS-27',
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
          page0: [
            'Uncertainty stops me from having a strong opinion',
            'Being uncertain means that a person is disorganized',
            'Uncertainty makes life intolerable',
            'It\'s unfair having no guarantees in life',
            'My mind can\'t be relaxed if I don\'t know what will happen tomorrow',
          ],
          page1: [
            'Uncertainty makes me uneasy, anxious, or stressed',
            'Unforeseen events upset me greatly',
            'It frustrates me not having all the information I need',
            'Uncertainty keeps me from living a full life',
            'One should always look ahead so as to avoid surprises',
            'A small unforeseen event can spoil everything, even with the best planning',
          ],
          page2: [
            'When it\'s time to act, uncertainty paralyses me',
            'Being uncertain means that I am not first rate',
            'When I am uncertain, I can\'t go forward',
            'When I am uncertain, I can\'t function very well',
            'Unlike me, others seem to know where they are going with their lives',
          ],
          page3: [
            'Uncertainty makes me vulnerable, unhappy, or sad',
            'I always want to know what the future has in store for me',
            'I can\'t stand being taken by surprise',
            'The smallest doubt can stop me from acting',
            'I should be able to organize everything in advance',
            'Being uncertain means that I lack confidence',
          ],
          page4: [
            'I think it\'s unfair that other people seem to be sure about their future',
            'Uncertainty keeps me from sleeping soundly',
            'I must get away from all uncertain situations',
            'The ambiguities in life stress me',
            'I can\'t stand being undecided about my future'
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
    var sections = [
      'page0',
      'page1',
      'page2',
      'page3',
      'page4'
    ];

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

    var IUS_section0 = createGeneral(
      IUS_section0,
      display_element,
      'section',
      'surveyMatrix IUS',
      'IUS-section0',
      ''
    );

    createSurveyMatrix(
      IUS_section0,
      'page0',
      trial.name,
      trial.questions['page0'],
      trial.options
    );

    var currentIndex = 0;
    var nextIndex = 1;
    var currentPage = trial.questions['page' + currentIndex];
    var currentLength = currentPage.length;

    setTimeout(function () {
      // start the timer
      var startTime = Date.now();
      var startQuestion = Date.now();

      // define what happens when people click on the survey option area (not just the radio button)
      $('#jspsych-content').on('click', '.IUS .surveyMatrix-option', function () {
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

        if (nextIndex < sections.length) {
          if ($(':checked').length == currentLength) {
            var IUS_section = createGeneral(
              IUS_section,
              display_element,
              'section',
              'surveyMatrix IUS',
              'IUS-section' + nextIndex,
              ''
            );

            createSurveyMatrix(
              document.getElementById('IUS-section' + nextIndex),
              'page' + nextIndex,
              trial.name,
              trial.questions['page' + nextIndex],
              trial.options
            );

            // scroll down to the new section
            $.scrollify.update();
            $('html, body').animate({
              scrollTop: $('#IUS-section' + nextIndex).offset().top
            }, 1000);

            // update the indices
            currentIndex++;
            nextIndex++;
            currentPage = trial.questions['page' + currentIndex];
            currentLength += currentPage.length;
          }
        } else {
          if ($(':checked').length == currentLength && onlyOnce == 0) {
            // when the final section is complete, create a button
            var submitButton = createGeneral(
              submitButton,
              document.getElementById('IUS-section' + currentIndex),
              'button',
              'default-green-button',
              'IUS-submit',
              'CONTINUE'
            );
            submitButton.setAttribute('type', 'submit');
            $('#IUS-submit')
              .css('display', 'none')
              .fadeIn().css('display', 'flex');

            onlyOnce++;

            // define what happens when people click on the final submit button
            $('#IUS-submit').on('click', function () {
              var endTime = Date.now();
              var questionnaireRT = calculateRT(startTime, endTime);
              for (n = 0; n < sections.length; n++) {
                var page = trial.questions['page' + n];
                for (i = 0; i < page.length; i++) {
                  questionScore = trial.scoreKey[dataObject.IUS_QA['IUS-27_page' + n + '-' + i]];
                  score += questionScore;
                  dataObject['IUS_scorelist'].push(questionScore);
                  dataObject['IUS_RTs'].push(questionRTs['IUS-27_page' + n + '-' + i]);
                }
              }
              dataObject['IUS_score'] = score;
              dataObject['IUS_duration'] = questionnaireRT;
              console.log(dataObject);

              jsPsych.finishTrial();
              // finish
              return;
            });
          }
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
