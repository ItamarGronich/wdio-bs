module.exports = (browser, capabilities, specs) => {

  if (!browser && browser !== null && typeof browser === 'object') {
    throw new TypeError("browserElement must be the WebdriverIo browser object.")
  }

  const
    onDesktop = capabilities.browserName !== 'iPad',
    onMobile  = !onDesktop;

  // In BrowserStack - the bootup time is about 55 seconds, after that it
  // launches a browser window and navigates to a local address that loads a
  // page with the title "Let's browse!" we wait for this whole shenanigan to
  // pass and then start the test.
  if (onMobile) {
    browser.waitUntil(
      () =>
        browser
        // Find the let's browse title.
          .elements('*')
          .getText()
          .includes('Let\'s browse!')
      // Wait up to 130 seconds tp give browser stack enough time to load.
      , 130000
      , 'Didn\'t find \"let\'s browse\"'
      , 1000
    );
  }

  // On desktop Since the app isn't responsive at the moment - elements clip out
  // of the view when width is under 1500.
  if (onDesktop) {
    browser.windowHandleSize({
      width: 1500,
      height: 900
    });
  }

  /**
   * Recursive function to ensure the correct text.
   *
   * This command is created in order to compensate the setValue() bug.
   * The method (setValue) does not always set the correct value,
   * sometimes it just misses some characters.
   * This function sets each character at a time and recursively validates
   * that the character is actually entered.
   *
   * @param {String} selector
   *   The selector string to grab the element by.
   * @param {String} text
   *   The text that we want to set as a value.
   */
  browser.addCommand('setValueSafe', (selector, text) => {

    // Get the ID of the selected elements WebElement JSON object.
    const elementId = browser.element(selector).value.ELEMENT;
    browser.waitUntil(() => browser.elementIdDisplayed(elementId));
    /**
     * Tackle the even weirder decision of WebDriver.io trim the spaces
     * of every property value. Even the "value" property's value.
     * I understand this for class or href properties but not for value.
     * You can see it here : https://github.com/webdriverio/webdriverio/blob/acdd79bff797b295d2196b3616facc9005b6f17d/lib/webdriverio.js#L463
     *
     * @param {String} elementId
     *   ID of a WebElement JSON object of the current element.
     *
     * @return {String}
     *   The value of the `value` attribute.
     */
    const getActualText = elementId =>
      browser
        .elementIdAttribute(elementId, 'value')
        .value;

    let expected = '';

    // Clear the input before entering new value.
    browser.elementIdClear(elementId);

    while (text) {
      if (getActualText(elementId) == expected) {
        const currentChar = text[0];
        expected += currentChar;
        text = text.slice(1);
        browser.elementIdValue(elementId, currentChar);
      }
    }
  });

  /**
   * Takes a user object and logs in as that user.
   *
   * @param {String} user - user to log in as.
   */
  browser.addCommand('login', (user) => {

    // User must have username and password.
    if (user) {
      browser.goToUrl('/#login');
      browser.setValueSafe('[name="username"]', user);
      browser.setValueSafe('[name="password"]', user);
      browser.findAndClick('button.form.narrow-form');
      if (user == "john") {
        // Teacher.
        browser.waitForVisible('.ui.button.white');
      } else {
        browser.waitForVisible('.ui.large.fluid.primary.button');
      }

    } else {
      throw new TypeError(
        `====================================
                 Error in login command:
                 no username given.
                 data given ${user}
           ====================================`
      );
    }
  });

  /**
   * Log out.
   */
  browser.addCommand('logout', () => {
    browser.goToUrl('/#subjects');
    browser.findAndClick('.user-menu > a');
    browser.findAndClick('.item=Logout');
    browser.waitForVisible('[name="username"]');
    browser.waitForVisible('[name="password"]');
  });

  /**
   * Find and click.
   *
   * @param {String} selector The css selector of the element to click.
   */
  browser.addCommand('findAndClick', (selector) => {
    // Find and click the btn.
    browser.waitForVisible(selector);
    browser.click(selector);
  });

  /**
   * Go to url only if not already there.
   *
   * Prevent reloading of the same page. MUST BE HERE.
   * This prevents WDIO from filling out forms while trying to reload.
   *
   * @param {String} path - The path I.E '/#login'
   */
  browser.addCommand('goToUrl', (path) => {
    const iAmNotThere =
      !browser
        .getUrl()
        // Find the path which and escape any forward slashes.
        .match(new RegExp(path, 'g'));

    if (iAmNotThere) {
      browser.url(path);
    }
  });

};
