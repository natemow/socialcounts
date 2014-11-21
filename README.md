socialcounts
============

A npm package for querying various social networks for a URL and getting share counts back.

Use it like this to get counts across all supported social networks:

    var SocialCounts = require('socialcounts');

    // Prints { facebook: 8293, twitter: 1598, linkedin: 27, delicious: 0, stumbleupon: 8, pinterest: 0, googleplus: 50 }
    new SocialCounts(req.query.url, function(result) {
      console.log(result);
    });

Or this to query just one:

    var SocialCounts = require('socialcounts');

    // Prints { provider: 'facebook', count: 8268 }
    var social = new SocialCounts();
    social.getCountFacebook(req.query.url, function(result) {
      console.log(result);
    });

Acknowledgements to Sunny Verma's work over at http://toolspot.org/script-to-get-shared-count.php
