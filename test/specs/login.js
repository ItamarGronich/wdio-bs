const assert = require('assert');

describe('login page', function() {

    it('should allow a teacher to login', function () {
        browser.login('john');
        let title = browser.getText('.user-menu');
        assert.equal(title, 'john');

        // Logout session.
        browser.logout();
    });

    it('should allow a student to login', function () {
        browser.login('alice');

        // Currently there is no user menu for a student in the Pincode page,
        // so we look for another element.
        browser.waitForVisible('.logout-link');

        // Logout session.
        browser.logout();
    });
});
