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
      '<div><h1> As the final step, please read and fill out this debriefing form. Thanks! </h1></div>'
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
      '<h2>"' + trial.studyName + '"</h2>'
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
    '<p>In this study, we are interested in understanding how people learn, make decisions, and evaluate their performance, and how these processes might be different in people who are vulnerable to clinical disorders. Studying these behaviours can provide an understanding of the basic information processing mechanisms that underlie healthy cognition and, by extension, how they are impaired in clinical disorders.</p>'
    +'<br>'
    +'<h3 style="text-align: center">We would like to ask you how you are feeling at the moment. Please take a moment to let us know below:</h3>'
    +'<textarea name="debriefing-question" id="debriefing-question"></textarea>'
    +'<h3 style="text-align: center"><br><br><br>The following is intended for anyone who indicated on their questionnaires that they may be feeling rather worried or in a low mood.</h3><br>'
    +'<p>Our moods can change from day to day. However, for some people, their mood may remain low for some time. If this applies to you and you are based in Oxford, we would like to point out several sources of advice or help which are free and readily available to you, and which may prove useful. Specifically, these include:</p>'
    +'<br>'
    +'<b>(1) Your General Practitioner</b><br><br>'
    +'<b>(2) Your College nurse (where available)</b><br><br>'
    +'<b>(3) Your University Counselling Service (where available). Students at the <a href="http://www.ox.ac.uk/students/welfare/counselling?wssl=1/" target="_blank">University of Oxford</a> and <a href="http://www.brookes.ac.uk/students/wellbeing/counselling/" target="_blank">Oxford Brookes University</a> should feel free to contact their respective University Counselling Services for more information.</b><br><br>'
    +'<b>(4) NHS 111</b><br><br>'
    +'<b>(5) Helplines, including The Samaritans (<a href="tel:116123">116 123</a>), the Mental Health Crisis Line (<a href="tel:01865251152">01865 251152</a>), and the Listening Service for Oxford University students (<a href="tel:01865270270">01865 270270</a>)</b><br>'
    +'<br>'
    +'<p>If you would like more information, or a confidential discussion with a senior member of the research team, please contact Professor Nicholas Yeung by <a href="mailto:nicholas.yeung@psy.ox.ac.uk?cc=linda.wei@psy.ox.ac.uk&subject='+trial.CUREC_ID+'">email</a> or <a href="tel:441865271389">phone</a>.</p>'
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
