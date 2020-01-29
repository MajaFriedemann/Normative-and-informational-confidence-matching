/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-BDI-II'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-BDI-II',
    parameters: {
      name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Questionnaire Name',
        default: 'BDI-II',
        description: 'The formal name of the questionnaire.'
      },
      intro: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Introductory Statement',
        default: 'Please read each group of statements carefully and then pick out the one statement in each group that best describes the way you have been feeling during <u>the past two weeks, including today</u>. If several statements in the group seem to apply equally well, select the highest number for that group.',
        description: 'Space for a questionnaire title / leading question.'
      },
      subtitle: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Subtitle / Subheading',
        default: '',
        description: 'Space for additional information, like number of sections/pages and estimated duration.'
      },
      options: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Options',
        default: [
          [
            'I do not feel sad',
            'I feel sad',
            'I am sad all the time and I can\'t snap out of it',
            'I am so sad and unahppy that I can\'t stand it'
          ],
          [
            'I am not particularly discouraged about the future',
            'I feel discouraged about the future',
            'I feel I have nothing to look forward to',
            'I feel like the future is hopeless and that things cannot improve'
          ],
          [
            'I do not feel like a failure',
            'I feel I have failed more than the average person',
            'As I look back on my life, all I can see is a lot of failures',
            'I feel like I am a complete failure as a person'
          ],
          [
            'I get as much satisfaction out of things as I used to',
            'I don\'t enjoy things the way I used to',
            'I don\'t get real satisfaction out of anything anymore',
            'I am dissatisfied or bored with everything'
          ],
          [
            'I don\'t feel particularly guilty',
            'I feel guilty a good part of the time',
            'I feel quite guilty most of the time',
            'I feel guilty all of the time'
          ],
          [
            'I don\'t feel like I am being punished',
            'I feel I may be punished',
            'I expected to be punished',
            'I feel I am being punished'
          ],
          [
            'I don\'t feel disappointed in myself',
            'I am disappointed in myself',
            'I am disgusted with myself',
            'I hate myself'
          ],
          [
            'I don\'t feel I am any worse than anybody else',
            'I am critical of myself for my weaknesses or mistakes',
            'I blame myself all the time for my faults',
            'I blame myself for everything bad that happens'
          ],
          [
            'I don\'t have any thoughts of killing myself',
            'I have thoughts of killing myself, but I would not carry them out',
            'I would like to kill myself',
            'I would kill myself if I had the chance'
          ],
          [
            'I don\'t cry any more than usual',
            'I cry more than I used to',
            'I cry all the time now',
            'I used to be able to cry, but now I can\'t cry even thought I want to'
          ],
          [
            'I am no more irritated by things than I ever was',
            'I am slightly more irritated now than usual',
            'I am quite annoyed or irritated a good deal of the time',
            'I feel irritated all the time'
          ],
          [
            'I have not lost interest in other people',
            'I am less interested in other people than I used to be',
            'I have lost most of my interest in other people',
            'I have lost all of my interest in other people'
          ],
          [
            'I make decisions about as well as I ever could',
            'I put off making decisions more than I used to',
            'I have greater difficulty in making decisions more than I used to',
            'I can\'t make decisions at all anymore'
          ],
          [
            'I don\'t feel that I look any worse than I used to',
            'I am worried that I am looking old or unattractive',
            'I feel there are permanent changes in my appearance that make me look unattractive',
            'I believe that I look ugly'
          ],
          [
            'I can work about as well as before',
            'It takes an extra effort to get started at doing something',
            'I have to push myself very hard to do anything',
            'I can\'t do any work at all'
          ],
          [
            'I can sleep as well as usual',
            'I don\'t sleep as well as I used to',
            'I wake up 1-2 hours earlier than usual and find it hard to get back to sleep',
            'I wake up several hours earlier than I used to and cannot get back to sleep'
          ],
          [
            'I don\'t get more tired than usual',
            'I get tired more easily than I used to',
            'I get tired from doing almost anything',
            'I am too tired to do anything'
          ],
          [
            'My appetite is no worse than usual',
            'My appetite is not as good as it used to be',
            'My appetite is much worse now',
            'I have no appetite at all anymore'
          ],
          [
            'I haven\'t lost much weight, if any, lately',
            'I have lost more than 5 pounds',
            'I have lost more than 10 pounds',
            'I have lost more than 15 pounds'
          ],
          [
            'I am no more worried about my health than usual',
            'I am worried about physical problems like aches, pains, upset stomach, or constipation',
            'I am very worried about physical problems and it\'s hard to think of much else',
            'I am so worried about my physical problems that I cannot think of anything else'
          ],
          [
            'I have not noticed any recent change in my interest in sex',
            'I am less interested in sex than I used to be',
            'I have almost no interest in sex',
            'I have lost interest in sex completely'
          ]
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
