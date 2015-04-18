SearchResults = new Meteor.Collection('search_results');
StoredResults = new Meteor.Collection('stored_results');

temporaryFiles = new FileCollection('temporaryFiles',
  { resumable: false,
    http: [
      { method: 'get',
        path: '/:_id',
        lookup: function (params) {
          return { _id: params._id};
        }
      },
      { method: 'post',
        path: '/:_id',
        lookup: function (params) {
          return {
            _id: params._id
          }
        }}
    ]
  }
);
