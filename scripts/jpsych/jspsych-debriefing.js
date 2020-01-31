/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-debriefing'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-debriefing',
    prettyName: 'Debriefing',
    parameters: {
      studyName: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      CUREC_ID: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      version: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      date: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
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

    // make sure the page starts at the top each time
    removeHash();
    removeQueryString();

    var intro = createGeneral(
      intro,
      display_element,
      'div',
      'titlepage document-intro',
      'debrief-intro',
      '<div><h1> Thank you for taking part in this study run by the Attention and Cognitive Control (ACC) Lab at the Department of Experimental Psychology, University of Oxford. </h1></div>'
    );
    scrolldownIndicator(intro, 1, true);
    var ethicsForm = createGeneral(
      ethicsForm,
      display_element,
      'div',
      'document-in-document',
      'debrief-form',
      ''
    );
    var instructHeader = createGeneral(
      instructHeader,
      ethicsForm,
      'div',
      'document-header',
      'debrief-header',
      ''
    );
    var logo = createGeneral(
      logo,
      instructHeader,
      'div',
      'header-logo',
      'Oxford-logo',
      ''
    );
    var labInfo = createGeneral(
      labInfo,
      instructHeader,
      'div',
      'header-info',
      'header-lab-info',
      '<h2>DEPARTMENT OF EXPERIMENTAL PSYCHOLOGY</h2>'
      + '<h4>New Radcliffe House, Radcliffe Observatory Quarter, Oxford OX2 6GG</h4>'
      + '<b>Professor Nicholas Yeung</b>'
      + '<br>'
      + 'Director of Graduate Studies & Professor of Cognitive Neuroscience'
      + '<br>'
      + 'Principal Investigator, Attention & Cognitive Control Lab'
      + '<br>'
      + '<i>Email: nicholas.yeung@psy.ox.ac.uk | Tel: +44 (0)1865 271389</i>'
    );

    var title = createGeneral(
      title,
      ethicsForm,
      'div',
      'document-title',
      'debrief-title',
      '<h1>DEBRIEFING</h1>' +
      '<h2>' + trial.studyName + '</h2>'
    );

    var instructText = createGeneral(
      instructText,
      ethicsForm,
      'div',
      'document-text',
      'debrief-text',
      ''
    );

    var footer = createGeneral(
      footer,
      ethicsForm,
      'div',
      'document-footer',
      'debrief-footer',
      ''
    );

    var instructAcknowledge = createGeneral(
      instructAcknowledge,
      display_element,
      'button',
      'medium-green-button',
      'debrief-submit',
      'FINISH & EXIT STUDY'
    );

    //body
    instructText.innerHTML = 
    '<p>This study investigates how people judge the confidence they have in their own decisions, both in social settings (making decisions together with other people) and when making decisions alone. Exploring how different factors affect confidence judgements can help to shed light on the mechanisms that allow people to think about their own decisions and actions, and to learn from their mistakes. This may not only be relevant in improving these evaluative (“metacognitive”) skills in healthy individuals, but could extend to psychiatric disorders many of which are associated with abnormal confidence judgements. </p>'
    +'<p>In order to control for confounding variables and better compare results across participants, the responses of other people that you saw throughout the task were artificially generated rather than coming from real past participants. People react differently when presented with machine generated advice rather than advice from real people. As we are interested in the latter case, the deception was necessary to draw conclusions for our research question regarding decision confidence in social settings (i.e. making decisions together with other people).</p>'
    +'<p>If you have a concern about any aspect of this project, please speak to the relevant researcher (Maja Friedemann, maja.friedemann@psy.ox.ac.uk) or her supervisor (Prof. Nick Yeung, nicholas.yeung@psy.ox.ac.uk), who will do their best to answer your query. The researchers should acknowledge your concern within 10 working days and give you an indication of how they intend to deal with it. If you remain unhappy or wish to make a formal complaint, please contact the chair of the Research Ethics Committee at the University of Oxford:</p>'
    +'<p><i>Chair<br>Medical Sciences Inter-Divisional Research Ethics Committee<br>Research Services, University of Oxford<br>Wellington Square, Oxford OX1 2JD, United Kingdom<br>Email: ethics@medsci.ox.ac.uk</i></p>'
    +'<p>The chair will seek to resolve the matter in a reasonably expeditious manner.</p>'
    +'<p>If you would like to discuss the research with someone beforehand or if you have questions afterwards, please contact:</p>'
    +'<p><i>Maja Friedemann<br>Department of Experimental Psychology<br>New Radcliffe House<br>Radcliffe Observatory Quater<br>Woodstock Road, Oxford OX2 6GG<br>Email: maja.friedemann@psy.ox.ac.uk</i></p>'

    +'<h2 style="text-align: center"><br><br>Thank you for taking part in our study!<br>Please safely exit the study by clicking the button below.</h2>';

    // button
    instructAcknowledge.onclick = function() {
      var debriefingResponse = document.getElementById('debriefing-question').value;
      dataObject['debriefing'] = debriefingResponse;
      console.log(dataObject);
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
