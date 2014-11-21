var http = require('http');
var https = require('https');
var Q = require('q');
var _ = require('underscore');

module.exports = (function(url, callback) {

  var cls = function(url, callback) {
    if (url) {
      var promises = [];
      for (var member in this) {
        if (typeof(this[member]) == 'function') {
          if (member !== 'getCounts') {
            promises.push( this[member](url) );
          }
        }
      }

      Q.all(promises);
      Q.allSettled(promises)
        .then(function(results) {
          var counts = {};
          results.forEach(function(result) {
            counts[result.value.provider] = result.value.count;
          });

          if (callback) {
            callback(counts);
          }
        });
    }
  };

  function getCount(endpoint) {
    var deferred = Q.defer();
    
    http.get(endpoint, function(res) {
      if (res.statusCode == 200) {
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on('end', function() {
          deferred.resolve(body);
        });
      }
    });

    return deferred.promise;
  };

  cls.prototype.getCountFacebook = function(url, callback) {
    var url = 'http://api.facebook.com/restserver.php?method=links.getStats&format=json&urls=' + encodeURI(url);
    return getCount(url)
      .then(
        function(response) {
          var data = JSON.parse(response);
          var count = (!_.isUndefined(data[0]) ? data[0]['total_count'] : 0);
          var output = { provider: 'facebook', count: parseInt(count) };
          
          if (callback) {
            callback(output);
          }
          return output;
        }
      );
  };
  cls.prototype.getCountTwitter = function(url, callback) {
    var url = 'http://urls.api.twitter.com/1/urls/count.json?url=' + encodeURI(url);
    return getCount(url)
      .then(
        function(response) {
          var data = JSON.parse(response);
          var count = (!_.isUndefined(data) ? data['count'] : 0);
          var output = { provider: 'twitter', count: parseInt(count) };

          if (callback) {
            callback(output);
          }
          return output;
        }
      );
  };
  cls.prototype.getCountLinkedIn = function(url, callback) {
    var url = 'http://www.linkedin.com/countserv/count/share?format=json&url=' + encodeURI(url);
    return getCount(url)
      .then(
        function(response) {
          var data = JSON.parse(response);
          var count = (!_.isUndefined(data) ? data['count'] : 0);
          var output = { provider: 'linkedin', count: parseInt(count) };

          if (callback) {
            callback(output);
          }
          return output;
        }
      );
  };
  cls.prototype.getCountDelicious = function(url, callback) {
    var url = 'http://feeds.delicious.com/v2/json/urlinfo/data?url=' + encodeURI(url);
    return getCount(url)
      .then(
        function(response) {
          var data = JSON.parse(response);
          var count = (!_.isUndefined(data[0]) ? data[0]['total_posts'] : 0);
          var output = { provider: 'delicious', count: parseInt(count) };

          if (callback) {
            callback(output);
          }
          return output;
        }
      );
  };
  cls.prototype.getCountStumbleupon = function(url, callback) {
    var url = 'http://www.stumbleupon.com/services/1.01/badge.getinfo?url=' + encodeURI(url);
    return getCount(url)
      .then(
        function(response) {
          var data = JSON.parse(response);
          var count = (!_.isUndefined(data['result']['views']) ? data['result']['views'] : 0);
          var output = { provider: 'stumbleupon', count: parseInt(count) };

          if (callback) {
            callback(output);
          }
          return output;
        }
      );
  };
  cls.prototype.getCountPinterest = function(url, callback) {
    var url = 'http://api.pinterest.com/v1/urls/count.json?url=' + encodeURI(url);
    return getCount(url)
      .then(
        function(response) {
          // TODO:
          // $json_string = preg_replace('/^receiveCount\((.*)\)$/', "\\1", $return_data);
          // $json = json_decode($json_string, true);
          // $json['count'];
          var count = 0;
          var output = { provider: 'pinterest', count: parseInt(count) };

          if (callback) {
            callback(output);
          }
          return output;
        }
      );
  };
  cls.prototype.getCountGooglePlus = function(url, callback) {
    var deferred = Q.defer();

    var data = {
      method: 'pos.plusones.get',
      id: 'p',
      params: {
        nolog: true,
        id: encodeURI(url),
        source: 'widget',
        userId: '@viewer',
        groupId: '@self'
      },
      jsonrpc: '2.0',
      key: 'p',
      apiVersion: 'v1'
    };
    data = JSON.stringify(data);

    var options = {
      host: 'clients6.google.com',
      path: '/rpc',
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    var req = https.request(options, function(res) {
      if (res.statusCode == 200) {
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on('end', function() {
          var data = JSON.parse(body);
          var count = (!_.isUndefined(data['result']) ? data['result']['metadata']['globalCounts']['count'] : 0);
          var output = { provider: 'googleplus', count: parseInt(count) };

          if (callback) {
            callback(output);
          }
          deferred.resolve(output);
        });
      }
    });
    req.write(data);
    req.end();
    
    return deferred.promise;
  };

  return new cls(url, callback);
});
