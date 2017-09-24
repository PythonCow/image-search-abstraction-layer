var Bing = require('node-bing-api')({ accKey: '7c16d343a6df462d9cb9d70eafe8b5c0'});
var app = require('express')();
var mongo = require('mongodb').MongoClient;

app.get('/search/:searchQuery', function(request, response){

  mongo.connect('mongodb://pythoncow:shrek420@ds141474.mlab.com:41474/pythoncow', function(err, db){
    if (err) throw err;
    var recentSearches = db.collection('recentSearches');
    recentSearches.find().toArray(function(err, docs){
      docs[0].searches.unshift({
        'query': request.params.searchQuery,
        'time': new Date().toString()
      });
      if (docs[0].searches.length > 10) docs[0].searches.pop();
      recentSearches.update({ _id: 'recent' }, { $set: { searches: docs[0].searches } });
    })
  });

  var offset = request.query.offset ? request.query.offset : 1;
  Bing.images(request.params.searchQuery, {count: 15, offset: offset}, function (err, res, body) {
    if (err) throw err;
    var results = []
    for (var i = 0; i < body.value.length; i++){
      results.push({
        'alt-text': body.value[i].name,
        'image-url': body.value[i].contentUrl,
        'page-url': body.value[i].hostPageUrl
      });
    }
    response.send(results)
  });

});

app.get('/recent', function (request, response) {
  mongo.connect('mongodb://pythoncow:shrek420@ds141474.mlab.com:41474/pythoncow', function(err, db){
    if (err) throw err;
    var recentSearches = db.collection('recentSearches');
    recentSearches.find().toArray(function (err, docs) {
      response.send(docs[0].searches);
    });
  });
});

app.listen(8000)
