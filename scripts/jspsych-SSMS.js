/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-SSMS'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-SSMS',
    parameters: {
      name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Questionnaire Name',
        default: 'SSMS',
        description: 'The formal name of the questionnaire.'
      },
      intro: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Introductory Statement',
        default: 'For each of the following statements, select whether it applies to you or not.',
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
          UE: [
            'When in the dark do you often see shapes and forms even though there is nothing there?',
            'Are your thoughts sometimes so strong that you can almost hear them?',
            'Have you ever thought that you had special, almost magical powers?',
            'Have you sometimes sensed an evil presence around you, even though you could not see it?',
            'Do you think that you could learn to read other\'s minds if you wanted to?',
            'When you look in the mirror does your face sometimes seem quite different from usual?',
            'Do ideas and insights sometimes come to you so fast that you cannot express them all?',
            'Can some people make you aware of them just by thinking about you?',
            'Does a passing thought ever seem so real it frightens you?',
            'Do you feel that your accidents are caused by mysterious forces?',
            'Do you ever have a sense of vague danger or sudden dread for reasons that you do not understand?',
            'Does your sense of smell sometimes become unusually strong?'
          ],
          CD: [
            'Are you easily confused if too much happens at the same time?',
            'Do you frequently have difficulty in starting to do things?',
            'Are you a person whose mood goes up and down easily?',
            'Do you dread going into a room by yourself where other people are already gathered and are talking?',
            'Do you find it difficult to keep interested in the same thing for a long time?',
            'Do you often have difficulties in controlling your thoughts?',
            'Are you easily distracted from work by daydreams?',
            'Do you ever feel that your speech is difficult to understand because the words are all mixed up and don\'t make sense?',
            'Are you easily distracted when you read or talk to someone?',
            'Is it hard for you to make decisions?',
            'When in a crowded room, do you often have difficulty in following a conversation?'
          ],
          IN: [
            'Do you consider yourself to be pretty much an average sort of person?',
            'Would you like other people to be afraid of you?',
            'Do you often feel the impulse to spend money which you know you can\'t afford?',
            'Are you usually in an average kind of mood, not too high and not too low?',
            'Do you at times have an urge to do something harmful or shocking?',
            'Do you stop to think things over before doing anything?',
            'Do you often overindulge in alcohol or food?',
            'Do you ever have the urge to break or smash things?',
            'Have you ever felt the urge to injure yourself?',
            'Do you often feel like doing the opposite of what other people suggest even though you know they are right?'
          ],
          IA: [
            'Are there very few things that you have ever enjoyed doing?',
            'Are you much too independent to get involved with other people?',
            'Do you love having your back massaged?',
            'Do you find the bright lights of a city exciting to look at?',
            'Do you feel very close to your friends?',
            'Has dancing or the idea of it always seemed dull to you?',
            'Do you like mixing with people?',
            'Is trying new foods something you have always enjoyed?',
            'Have you often felt uncomfortable when your friends touch you?',
            'Do you prefer watching television to going out with people?'
          ]
        },
        description: 'Questionnaire questions.'
      },
      options: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Options',
        default: [
          'Yes',
          'No'
        ],
        description: 'Questionnaire response options.'
      },
      enabledSubscales: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Enabled Subscales',
        default: ['UE', 'CD', 'IA', 'IN'],
        description: 'Enabled subscales on the questionnaire.'
      },
      isRandomised: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        pretty_name: 'Randomised Order',
        default: false,
        description: 'Are the enabled subscales presented in random order?'
      },
      scoreKey: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: 'Score Key',
        default: {
          'Yes': 1,
          'No': 0
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
        standardScrollElements: "#survey-container",
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
    var UEscore = 0;
    var CDscore = 0;
    var IAscore = 0;
    var INscore = 0;
    var onlyOnce = 0;
    var UE_questionRTs = {};
    var CD_questionRTs = {};
    var IA_questionRTs = {};
    var IN_questionRTs = {};

    /* change these parameters to adjust the survey matrix appearance (CSS) */
    var containerWidth = 80;
    var quarterContainerWidth = 0.25 * containerWidth;
    var questionWidth = 0.7 * containerWidth;
    var opterWidth = 0.3 * containerWidth;
    var optionWidth = opterWidth / trial.options.length;
    var questionHeight = 7;
    var doubleQuestionHeight = 2 * questionHeight;

    document.body.style.setProperty('--containerWidth', containerWidth + 'vw');
    document.body.style.setProperty('--quarterContainerWidth', quarterContainerWidth + 'vw');
    document.body.style.setProperty('--questionWidth', questionWidth + 'vw');
    document.body.style.setProperty('--opterWidth', opterWidth + 'vw');
    document.body.style.setProperty('--optionWidth', optionWidth + 'vw');
    document.body.style.setProperty('--questionHeight', questionHeight + 'vh');
    document.body.style.setProperty('--doubleQuestionHeight', doubleQuestionHeight + 'vh');

    // check if there is random ordering of the subscales - returns an array of subscales (string names)
    if (trial.isRandomised == true) {
      var subscalesUsed = shuffle(trial.enabledSubscales);
    } else {
      var subscalesUsed = trial.enabledSubscales;
    }
    // record order of subscales
    dataObject['SSMS_order'] = subscalesUsed;

    // mapping of subscale names (string version) to their questions
    var subscaleQuestions = {
      'UE': trial.questions.UE,
      'CD': trial.questions.CD,
      'IA': trial.questions.IA,
      'IN': trial.questions.IN
    };

    /* BUILD THE SURVEY IN THE DOM */
    var titlepage = createGeneral(
      titlepage,
      display_element,
      'section',
      'titlepage',
      'SSMS-titlepage',
      '<div><h1>' + trial.intro + '</h1></div>' + '<p>' + trial.subtitle + '</p>'
    );
    scrollIndicator(titlepage, 1, true);

    var SSMS_section0 = createGeneral(
      SSMS_section0,
      display_element,
      'section',
      'surveyMatrix SSMS',
      'SSMS-section0',
      ''
    );
    createSurveyMatrix(
      SSMS_section0,
      subscalesUsed[0],
      trial.name,
      subscaleQuestions[subscalesUsed[0]],
      trial.options
    );

    var currentIndex = 0;
    var nextIndex = 1;
    var currentLength = subscaleQuestions[subscalesUsed[currentIndex]].length;

    setTimeout(function() {
      // start the timer
      var startTime = Date.now();
      var startQuestion = Date.now();

      $('#jspsych-content').on('click', '.SSMS .surveyMatrix-option', function() {
        // record the question RT
        var endQuestion = Date.now();
        var questionRT = calculateRT(startQuestion, endQuestion);
        // record the question data
        var questionName = $(this).children('input').attr('name');
        var questionAnswer = $(this).children('input').prop('value');
        // save data in dataObject
        switch(subscalesUsed[currentIndex]) {
          case 'UE':
            dataObject.SSMS_UE_QA[questionName] = questionAnswer;
            UE_questionRTs[questionName] = questionRT;
            break;
          case 'CD':
            dataObject.SSMS_CD_QA[questionName] = questionAnswer;
            CD_questionRTs[questionName] = questionRT;
            break;
          case 'IA':
            dataObject.SSMS_IA_QA[questionName] = questionAnswer;
            IA_questionRTs[questionName] = questionRT;
            break;
          case 'IN':
            dataObject.SSMS_IN_QA[questionName] = questionAnswer;
            IN_questionRTs[questionName] = questionRT;
            break;
        }

        // reset the trial timer
        startQuestion = Date.now();

        // check if we need to add a new section
        if (nextIndex < subscalesUsed.length) {
          if ($(':checked').length == currentLength) {
            // create a new question section for the next subscale
            // console.log('this conditional passed!');
            var SSMS_section = createGeneral(
              SSMS_section,
              display_element,
              'section',
              'surveyMatrix SSMS',
              'SSMS-section' + nextIndex,
              ''
            );
            createSurveyMatrix(
              document.getElementById('SSMS-section' + nextIndex),
              subscalesUsed[nextIndex],
              trial.name,
              subscaleQuestions[subscalesUsed[nextIndex]],
              trial.options
            );

            // scroll down to the new section
            $.scrollify.update();
            $('html, body').animate({
              scrollTop: $('#SSMS-section' + nextIndex).offset().top
            }, 1000);

            // update the indices
            currentIndex++;
            nextIndex++;
            currentLength += subscaleQuestions[subscalesUsed[currentIndex]].length;
          }
        } else {
          if ($(':checked').length == currentLength && onlyOnce == 0) {
            // when the final section is complete, create a button
            var submitButton = createGeneral(
              submitButton,
              document.getElementById('SSMS-section' + currentIndex),
              'button',
              'default-green-button',
              'SSMS-submit',
              'CONTINUE'
            );
            submitButton.setAttribute('type', 'submit');
            $('#SSMS-submit')
              .css('display', 'none')
              .fadeIn().css('display', 'flex');

            onlyOnce++;

            // define what happens when people click on the final submit button
            $('#SSMS-submit').on('click', function () {
              var endTime = Date.now();
              var questionnaireRT = calculateRT(startTime, endTime);
              for (i = 0; i < trial.questions.UE.length; i++) {
                questionScore = trial.scoreKey[dataObject.SSMS_UE_QA['SSMS_UE-' + i]];
                score += questionScore;
                UEscore += questionScore;
                dataObject['SSMS_UE_scorelist'].push(questionScore);
                dataObject['SSMS_RTs'].push(UE_questionRTs['SSMS_UE-' + i]);
              }
              for (i = 0; i < trial.questions.CD.length; i++) {
                questionScore = trial.scoreKey[dataObject.SSMS_CD_QA['SSMS_CD-' + i]];
                score += questionScore;
                CDscore += questionScore;
                dataObject['SSMS_CD_scorelist'].push(questionScore);
                dataObject['SSMS_RTs'].push(CD_questionRTs['SSMS_CD-' + i]);
              }
              for (i = 0; i < trial.questions.IA.length; i++) {
                questionScore = trial.scoreKey[dataObject.SSMS_IA_QA['SSMS_IA-' + i]];
                var reverseScoredItems = [2, 3, 4, 6, 7];
                if (reverseScoredItems.indexOf(i) >= 0) {
                  if (questionScore == 0) {
                    questionScore = 1;
                  } else if (questionScore == 1) {
                    questionScore = 0;
                  }
                }
                score += questionScore;
                IAscore += questionScore;
                dataObject['SSMS_IA_scorelist'].push(questionScore);
                dataObject['SSMS_RTs'].push(IA_questionRTs['SSMS_IA-' + i]);
              }
              for (i = 0; i < trial.questions.IN.length; i++) {
                questionScore = trial.scoreKey[dataObject.SSMS_IN_QA['SSMS_IN-' + i]];
                var reverseScoredItems = [0, 3, 5];
                if (reverseScoredItems.indexOf(i) >= 0) {
                  if (questionScore == 0) {
                    questionScore = 1;
                  } else if (questionScore == 1) {
                    questionScore = 0;
                  }
                }
                score += questionScore;
                INscore += questionScore;
                dataObject['SSMS_IN_scorelist'].push(questionScore);
                dataObject['SSMS_RTs'].push(IN_questionRTs['SSMS_IN-' + i]);
              }
              dataObject['SSMS_score'] = score;
              dataObject['SSMS_UE_score'] = UEscore;
              dataObject['SSMS_CD_score'] = CDscore;
              dataObject['SSMS_IA_score'] = IAscore;
              dataObject['SSMS_IN_score'] = INscore;
              dataObject['SSMS_duration'] = questionnaireRT;
              console.log(dataObject);

              // finish
              jsPsych.finishTrial();
              return;
            });
          }
        }
      });
    }, 250);

    // make sure the page scrolls up to the top when initial loading is complete
    // console.log('reached the bottom');
    $('html, body').animate({
      scrollTop: $('#SSMS-titlepage').offset().top
    }, 1);
  }; // close plugin.trial

  return plugin; // close plugin
})();
