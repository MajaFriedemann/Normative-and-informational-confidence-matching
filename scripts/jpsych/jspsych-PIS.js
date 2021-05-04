/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-PIS'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-PIS',
    prettyName: 'Participant Information Sheet',
    parameters: {}
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

    // make sure page starts at the top every time
    removeHash();
    removeQueryString();
    scrollTop();

    // change the PIS text here
    var PIS_text =
      '<p>You are being invited to take part in a research study run by the Attention and Cognitive Control (ACC) Lab at the Department of Experimental Psychology, University of Oxford. Before you decide whether or not to take part, it is important that you understand why the research is being done and what it will involve. Please take time to read this information carefully. If there is anything you do not understand, or if you would like more information, please ask us. Thank you for taking the time to read this.</p>'

      + '<br><h4>1. What is the purpose of the research?</h4>'

      + '<p>This study investigates how people judge the confidence they have in their own decisions, both in social settings (making decisions together with other people) and when making decisions alone. Exploring how different factors affect confidence judgements can help to shed light on the mechanisms that allow people to think about their own decisions and actions, and to learn from their mistakes. This may not only be relevant in improving these evaluative (“metacognitive”) skills in healthy individuals, but could extend to psychiatric disorders many of which are associated with abnormal confidence judgements.</p>'

      + '<br><h4>2. Why have I been invited to take part?</h4>'

      + '<p>You have been invited to take part in this research because you have indicated that you might be interested in participating, and you are currently</p>'
      + '<p>(i) aged 18-50 years, <br>(ii) fluent English speaking, <br>(iii) have normal or corrected-to-normal vision, <br>(iv) neurologically healthy, <br>(v) not on any medication with psychoactive effects (e.g., antidepressants or medication for anxiety), and <br>(vi) have not taken part in closely related previous studies.</p>'

      + '<br><h4>3. Do I have to take part?</h4>'

      + '<p>No.  You can ask questions about the research before deciding whether or not to participate. If you do agree to participate, you may withdraw yourself from the study at any time, without giving a reason.</p>'

      + '<br><h4>4. What will happen to me if I take part in the research?</h4>'

      + '<p>In this online session, you will be asked to make a series of discrimination judgments about visual stimuli and about your performance in the task. You will get the chance to earn rewards based on the accuracy of your performance judgements. The testing session is expected to last for up to 40 minutes.</p>'

      + '<br><h4>5. Are there any potential risks in taking part?</h4>'

      + '<p>No physical or psychological risks are anticipated in this study. It is not expected to cause any kind of discomfort but please let us know if you feel uncomfortable at any point. Should you experience any discomfort, you are free to stop at any point and let us know by contacting us using the following address: maja.friedemann@psy.ox.ac.uk.</p>'

      + '<br><h4>6. Are there any benefits in taking part?</h4>'

      + '<p>There are no personal benefits of the research for you, but indirect benefits include advancing our understanding of the human brain.</p>'

      + '<br><h4>7. Expenses and payments</h4>'

      +'<p>You will receive £10 per hour for your participation in this task. You may have the opportunity during parts of the study to earn up to an additional £5 dependent on your performance.</p>'

      + '<br><h4>8. What happens to the data provided?</h4>'

      + '<p>Data will be collected in an anonymised manner by assigning a random identification number to every participant included in the study. This identifier will link all experimental data collected, but will not be retraceable to fully identifiable personal data, such as your name (i.e., we will not retain a list of participant names against numbers). Your IP address will not be stored.</p>'
      + '<p>Prolific is the data controller with respect to your personal data and, as such, will determine how your personal data is used. Please see their privacy notice. Prolific will share only fully anonymised data with the University of Oxford, for the purposes of research. All research data will be stored for at least 3 years after publication or public release of the work of the research. Responsible members of the University of Oxford may be given access to data for monitoring and/or audit of the research. We would like your permission to use anonymised data in future studies, and to share data with other researchers in line with goals of Open Science. This includes storing these data in online repositories where they can be accessed by anyone, including people in and outside the EU. All personal information that could identify you will be removed or changed before information is shared with other researchers or results are made public.</p>'

      + '<br><h4>9. Will the research be published?</h4>'

      + '<p>The research is part of a DPhil project, and data and results from the study may be used for completion of an academic thesis, journal publications, presentations at conferences and on open data archives.</p>'
      + '<p>The University of Oxford is committed to the dissemination of its research for the benefit of society and the economy and, in support of this commitment, has established an online archive of research materials. This archive includes digital copies of student theses successfully submitted as part of a University of Oxford postgraduate degree programme. Holding the archive online gives easy access for researchers to the full text of freely available theses, thereby increasing the likely impact and use of that research. </p>'
      + '<p>The research will be written up as a thesis. On successful submission of the thesis, it will be deposited both in print and online in the University archives, to facilitate its use in future research. The thesis will be openly accessible.</p>'

      + '<br><h4>10. Who is organising and funding the research?</h4>'

      + '<p>This research is funded by the Department of Experimental Psychology (University of Oxford).</p>'

      + '<br><h4>11. Who has reviewed this study?</h4>'

      + '<p>This study has been reviewed by, and received ethics clearance through, the University of Oxford Central University Research Ethics Committee (Reference number: ' + CUREC_ID + ').</p>'

      + '<br><h4>12. Who do I contact if I have a concern about the study or I wish to complain?</h4>'

      + '<p>If you have a concern about any aspect of this project, please speak to the relevant researcher (Maja Friedemann, maja.friedemann@psy.ox.ac.uk) or her supervisor (Prof. Nick Yeung, nicholas.yeung@psy.ox.ac.uk), who will do their best to answer your query. The researchers should acknowledge your concern within 10 working days and give you an indication of how they intend to deal with it. If you remain unhappy or wish to make a formal complaint, please contact the chair of the Research Ethics Committee at the University of Oxford:</p>'
      + '<p><i>Chair<br>Medical Sciences Inter-Divisional Research Ethics Committee<br>Research Services, University of Oxford<br>Wellington Square, Oxford OX1 2JD, United Kingdom<br>Email: ethics@medsci.ox.ac.uk</i></p>'
      + '<p>The chair will seek to resolve the matter in a reasonably expeditious manner.</p>'

      + '<br><h4>13. Further information and contact details</h4>'

      + '<p>If you would like to discuss the research with someone beforehand or if you have questions afterwards, please contact:</p>'
      + '<p><i>Maja Friedemann<br>Department of Experimental Psychology<br>New Radcliffe House<br>Radcliffe Observatory Quater<br>Woodstock Road, Oxford OX2 6GG<br>Email: maja.friedemann@psy.ox.ac.uk</i></p>';

    // create page elements
    var intro = createGeneral(
      intro,
      display_element,
      'div',
      'titlepage document-intro',
      'PIS-intro',
      '<h1>Please acknowledge the following information on our research ethics before proceeding to the experiment.</h1>'
    );

    var scrollIcon = scrolldownIndicator(intro, 1, true);

    var ethicsForm = createGeneral(
      ethicsForm,
      display_element,
      'div',
      'document-in-document',
      'PIS-form',
      ''
    );
    var instructHeader = createGeneral(
      instructHeader,
      ethicsForm,
      'div',
      'document-header',
      'PIS-header',
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
      + 'Professor of Cognitive Neuroscience'
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
      'PIS-title',
      '<h1>PARTICIPANT INFORMATION SHEET</h1>'
      +
      '<h2>' + studyName + '</h2>'
    );

    var instructText = createGeneral(
      instructText,
      ethicsForm,
      'div',
      'document-text',
      'PIS-text',
      PIS_text
    );
    var footer = createGeneral(
      footer,
      ethicsForm,
      'div',
      'document-footer',
      'PIS-footer',
      ''
    );
    var instructAcknowledge = createGeneral(
      instructAcknowledge,
      display_element,
      'button',
      'large-green-button',
      'PIS-submit',
      '<div>I acknowledge that I have read this Participant Information Sheet</div>'
    );

    // define what happens when people click on the final submit button
    $('#PIS-submit').on('click', function() {
      // save the data to data object
      dataObject['PIS_acknowledged']   = true;
      jsPsych.finishTrial();
      return;
    });

    // make sure page starts at the top
    scrollTop();
  };

  return plugin;
})();
