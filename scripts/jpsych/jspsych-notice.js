/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-notice'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-notice',
    prettyName: 'Message Splash (2-pager)',
    parameters: {
      section1_text: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Section 1 text',
        description: 'STRING: text for section 1 (notice / header format).'
      },
      section2_text: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Section 2 text',
        description: 'STRING: text for section 2 (explanation / paragraph format).'
      },
      img_id: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Image ID',
        description: 'STRING: HTML object ID for image object in section 2.'
      },
      buttonText: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button text',
        default: 'CONTINUE',
        description: 'STRING: text for trial finish button.'
      }
    }
  };

  plugin.trial = function (display_element, trial) {
    // clear display element and apply page default styles
    display_element.innerHTML = '';
    $('body')
      .css('height', 'auto')
      .css('background-color', 'black')
      .css('overflow-y', 'auto');
    $.scrollify.enable();
    $.scrollify.destroy();

    // make sure page starts at the top every time
    removeHash();
    removeQueryString();

    // set up scroll snap points (jQuery)
    $(function() {
      $.scrollify({
        section: "section",
        sectionName: "section-name",
        interstitialSection: "",
        easing: "easeOutExpo",
        scrollSpeed: 1100,
        offset: 0,
        scrollbars: false,
        standardScrollElements: "",
        setHeights: false,
        overflowScroll: true,
        updateHash: false,
        touchScroll: true,
        before: function() {},
        after: function() {},
        afterResize: function() {},
        afterRender: function() {}
      });
      // console.log('finished loading Scrollify instance');
    });
    $.scrollify.enable();

    /* SECTION 1: Welcome */
    var section1 = createGeneral(
      section1,
      display_element,
      'section',
      'tutorial-section section1',
      'notice-section1',
      ''
    );

    var section1_title = createGeneral(
      section1_title,
      section1,
      'div',
      'tutorial-text',
      'notice-text1',
      trial.section1_text
    );

    var scrollIcon = scrolldownIndicator(section1_title, 1, true);

    /* SECTION 2: Overview */
    var section2 = createGeneral(
      section2,
      display_element,
      'section',
      'tutorial-section section2',
      'notice-section2',
      ''
    );

    var section2_image = createGeneral(
      section2_image,
      section2,
      'div',
      'gameboard-gif',
      trial.img_id,
      ''
    );

    var section2_title = createGeneral(
      section2_title,
      section2,
      'div',
      'tutorial-text',
      'notice-text2',
      '<div id="section2-text">' + trial.section2_text + '</div>'
    );

    var continueButton = createGeneral(
      continueButton,
      section2,
      'button',
      'default-green-button',
      'notice-' + trial.buttonText + '-button',
      trial.buttonText
    );

    continueButton.onclick = function () {
      jsPsych.finishTrial();
      return;
    }

    // make sure page starts at the top every time
    // console.log('reached bottom');
    $('html, body').animate({
      scrollTop: $('#notice-section1').offset().top
    }, 1);
  }; // close plugin.trial

  return plugin;
})(); // close the plugin as an anonymous function