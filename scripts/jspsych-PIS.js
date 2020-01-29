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
      '<p>You are being invited to take part in a research study run by the Oxford Attention and Cognitive Control Lab (OxACClab) based at the University of Oxford’s Department of Experimental Psychology. Before you decide whether to take part in our study, it is important that you understand why the research is being done and what it will involve. Please take time to read this information carefully and discuss it with other people if you wish. If there is anything you do not understand, or if you would like more information, please ask us. Thank you for taking the time to read this.</p>'

      + '<br><h4>1. What is the purpose of the study?</h4>'

      + '<p>Understanding how people learn, make decisions, and evaluate their performance is a key concern in the social, behavioural, and cognitive sciences. Studying these behaviours can also provide an understanding of the basic information processing mechanisms that underlie healthy cognition and, by extension, how they are impaired in clinical disorders. Our project is aimed at studying the basic information processing steps when people learn, make decisions, and evaluate their own performance in these tasks, and how these processes might be different in people who are vulnerable to clinical disorders.</p>'

      + '<br><h4>2. Why have I been invited?</h4>'

      + '<p>The next page will take you to a screening questionnaire that will ask you about how you have been feeling over the past week and how you feel in general. You will be invited to take part in our study:</p>'
      + '<p>(i) if you are between the age of 18 and 60 years; AND <br>(ii) if you have not participated in a closely related previous study; AND, where applicable, <br>(iii) based on your responses to a pre-screening questionnaire following this information sheet.</p>'

      + '<br><h4>3. What will happen in the study?</h4>'

      + '<p>Following this information sheet, in some conditions, you may be asked to complete a short pre-screening questionnaire. If no pre-screening questionnaire is set, or if your responses to the pre-screening questionnaire indicate that you fit our screening requirements, you will be invited to participate in our study. At this point, we will automatically assign you a random identification number (‘identifier’) for our records. To meet data anonymity requirements, only this identifier and/or the random identifier assigned to you by the online recruitment portal (Amazon Mechanical Turk, Prolific, etc.) will be used to keep track of the experimental data we collect during your participation in the study.</p>'
      + '<p>If you have been invited to take part in the remote (online) version of our study, you will be asked to give electronic consent for participating in the study. If you have been invited to take part in the onsite (Oxford-based) version of the study, you will be provided with information about how to book a testing session at one of our sites. At the testing session, you will be asked to give written consent for participating in the study.</p>'
      + '<p>In both the remote and onsite versions of our study, after giving consent, you will be asked to participate in the experiment, which will involve:</p>'
      + '<p>(i)	answering some questions about how you have been feeling over the past week and how you feel in general; AND<br>(ii) reporting your age, sex, and handedness; AND<br>(iii)	taking part in some short behavioural/cognitive tasks/games where you will make decisions based on visual and/or auditory stimuli presented onscreen and reflect on the choices you make.</p>'
      + '<p>Both versions of the study will take place on a computer or mobile device. The study will take the amount of time specified on the advertisement that led you here – but as a rule, it will be no longer than 2 hours.</p>'
      + '<p>In the remote version of our study, you will be reimbursed for your time at up to £5 per hour pro rata; in addition, you may be rewarded up to £3 for your performance on the tasks/games. Details about how to achieve the performance bonus are in the instructions for each task/game. In the onsite version of our study, you will be reimbursed up to £10 per hour pro rata to cover both time and travel expenses.</p>'

      + '<br><h4>4. Do I have to take part? What happens if I wish to withdraw?</h4>'

      + '<p>You do not have to take part in the study. Even if you agree to participate in this study, you may choose to withdraw yourself and all data associated at any time prior to the end of the study without giving reason and without penalty, simply by exiting your web browser window. After the end of the study, you may contact us to request withdrawal of your data.</p>'
      + '<p>Responses in the study will remain confidential, but in the rare case where we become aware of a serious risk of harm to yourself or others (e.g., if you inform us during debriefing), that confidentiality may be breached.</p>'

      + '<br><h4>5. Are there any risks in taking part in the study?</h4>'

      + '<p>There are no risks other than those posed by everyday life.</p>'

      + '<br><h4>6. Are there any benefits from taking part in the study?</h4>'

      + '<p>There will be no direct benefit to you from taking part in this research. However, your participation may benefit our understanding of basic human information processing mechanisms, which could inform better treatments for psychological disorders like anxiety and depression.</p>'

      + '<br><h4>7. Information about data protection</h4>'

      +'<p>The University of Oxford is the data controller with respect to your personal data, and as such will determine how your personal data is used in the study. The University will process your personal data for the purpose of the research outlined above. Research is a task that we perform in the public interest.</p>'

      +'<p>Further information about your rights with respect to your personal data is available from <a href="http://www.admin.ox.ac.uk/councilsec/compliance/gdpr/individualrights/">http://www.admin.ox.ac.uk/councilsec/compliance/gdpr/individualrights/</a>.</p>'

      + '<br><h4>8. What happens to the data I provide?</h4>'

      + '<p>The research data you provide (i.e., responses made and response times) are automatically anonymised, as your data are identified only by your randomly assigned identifier which we have no way of tracing back to you. Anonymised research data will be collected and initially saved on a server located within the United Kingdom and European Union before being transferred to password-protected local storage on the researchers’ computers and external hard drives and password-protected, General Data Protection Regulation (GDPR)-compliant cloud storage.</p>' +
      '<p>For the onsite condition only, your written consent forms will be kept in a secured (locked) file storage system on departmental premises for the duration of the study. The only people who will have access to those forms will be the researchers listed on this project, and the forms will be inaccessible to the researchers during data processing. All written consent forms will be destroyed securely at the end of the study.</p>'

      + '<br><h4>9. What will happen to the results of the research? Will the research be published?</h4>'

      + '<p>The research may be published in international peer-reviewed journals and presented at national and international conferences. We make every effort to make our publications open-access, but this is not always possible and depends on the journal’s publication policy.</p>'
      + '<p>In addition, the research may be written up as part of a student thesis. On successful submission of the thesis, it will be deposited both in print and online in the University archives, to facilitate its use in future research. The thesis will be published open access.</p>'
      + '<p>The University of Oxford is committed to the dissemination of its research for the benefit of society and the economy and, in support of this commitment, has established an online archive of research materials. This archive includes digital copies of student theses successfully submitted as part of a University of Oxford postgraduate degree programme. Holding the archive online gives easy access for researchers to the full text of freely available theses, thereby increasing the likely impact and use of that research.</p>'

      + '<br><h4>10. Who is funding the research?</h4>'

      + '<p>This research is funded by the University of Oxford (Department of Experimental Psychology) and Magdalen College, Oxford.</p>'

      + '<br><h4>11. Who has reviewed this study?</h4>'

      + '<p>This research has been reviewed by and received ethics clearance through the University of Oxford Central Research Ethics Committee (approval code: ' + CUREC_ID + ').</p>'

      + '<br><h4>12. What if there is a problem?</h4>'

      + '<p>If you have a concern about any aspect of this project, please speak to the principal investigator (Prof. Nicholas Yeung, email: nicholas.yeung@psy.ox.ac.uk, tel: +44 (0)1865 271389), who will do his/her best to answer your query. The researcher should acknowledge your concern within 10 working days and give you an indication of how he/she intends to deal with it. If you remain unhappy or wish to make a formal complaint, please contact the relevant chair of the Research Ethics Committee at the University of Oxford, who will seek to resolve the matter in a reasonably expeditious manner.</p>'
      + '<p><i>Chair<br>Medical Sciences Inter-Divisional Research Ethics Committee<br>Research Services, University of Oxford<br>Wellington Square, Oxford OX1 2JD, United Kingdom<br>Email: ethics@medsci.ox.ac.uk</i></p>'

      + '<br><h4>13. Researcher contact details</h4>' +
      '<p>If you would like to disator by email at maja.friedemann@psy.ox.ac.uk.</p>';

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
      '<h3>V' + PIS_version + ' (revised: ' + PIS_date + ')</h3>' + '<br>' +
      '<h2>"' + CUREC_studyName + '"</h2>'
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
