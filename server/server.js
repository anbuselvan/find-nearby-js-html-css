Meteor.startup(function () {

  SearchResults.allow({
    insert: function(userId, doc) {
      return doc.userId === userId;
    },
    remove: function(userId, doc) {
      return doc.userId === userId;
    }
  });

  StoredResults.allow({
    insert: function(userId, doc) {
      return doc.userId === userId;
    },
    remove: function(userId, doc) {
      return doc.userId === userId;
    }
  });

  temporaryFiles.allow({
    insert: function (userId, file) {
      return true;
    },
    remove: function (userId, file) {
      return true;
    },
    read: function (userId, file) {
      return true;
    },
    write: function (userId, file, fields) {
      return true;
    }
  });

  Meteor.publish('search_results', function(){
    check(this.userId, String);
    return SearchResults.find({userId: this.userId});
  });

  Meteor.publish('stored_results', function(){
    check(this.userId, String);
    return StoredResults.find({userId: this.userId});
  });

  Meteor.methods({
    clearSearchResults: function() {
      var currentUserId = Meteor.user()._id;
      SearchResults.remove({userId: currentUserId});
    },
    downloadCSVFile: function(ids, stored) {

      this.unblock();

      var currentUserId = Meteor.user()._id;

      var Future = Meteor.npmRequire('fibers/future');
      var FastCsv = Meteor.npmRequire('fast-csv');

      var futureResponse = new Future();

      var fileName = Meteor.userId() + "_" + (stored ? "stored" : "search") + ".csv";
      var filePath = "tmp/" + fileName;

      var searchData = [];
      if (ids && ids.length > 0) {
        if (stored) {
          StoredResults.find({userId: currentUserId}).forEach(function(doc) {
            if (ids.indexOf(doc.pid) !== -1) {
              var row = {
                Name: doc.name,
                Address: doc.address,
                City: doc.city
              };
              searchData.push(row);
            }
          });
        } else {
          SearchResults.find({userId: currentUserId}).forEach(function(doc) {
            if (ids.indexOf(doc.pid) !== -1) {
              var row = {
                Name: doc.name,
                Address: doc.address,
                City: doc.city
              };
              searchData.push(row);
            }
          });
        }
      } else {
        if (stored) {
          StoredResults.find({userId: currentUserId}).forEach(function(doc) {
            var row = {
              Name: doc.name,
              Address: doc.address,
              City: doc.city
            };
            searchData.push(row);
          });
        } else {
          SearchResults.find({userId: currentUserId}).forEach(function(doc) {
            var row = {
              Name: doc.name,
              Address: doc.address,
              City: doc.city
            };
            searchData.push(row);
          });
        }
      }

      mkdirp('tmp', Meteor.bindEnvironment(function (err) {
        if (err) {
          console.log('Error creating tmp dir', err);
          futureResponse.throw(err);
        } else {

          var writeCsv = new Future();
          FastCsv.writeToPath(filePath, searchData, {headers: true})
          .on("finish", function() {
            writeCsv.return('done');
          });
          writeCsv.wait();

          temporaryFiles.importFile(filePath, {
            filename : fileName,
            contentType: 'application/octet-stream'
          }, function(err, file) {
            if (err) {
              futureResponse.throw(err);
            } else {
              futureResponse.return('/gridfs/temporaryFiles/' + file._id);
            }
          });
        }
      }));

      return futureResponse.wait();
    }
  });
});
