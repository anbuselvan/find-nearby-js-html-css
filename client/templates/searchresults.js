Template.searchResults.helpers({
  searchResults: function() {
    return SearchResults.find({});
  }
});

Template.searchResults.events({
  'click #save': function(e) {
    $('.chk-search').each(function() {
      if (this.checked) {
        var id = $(this).attr('data');
        var found = StoredResults.findOne({userId: Meteor.userId(), pid: id});
        if (!found) {
          var obj = SearchResults.findOne({pid: id});
          if (obj) {
            StoredResults.insert(obj);
          }
        }
        $(this).attr('checked', false);
      }
    });
  },
  'click #exports': function(e) {
    var selected = [];
    $('.chk-search').each(function() {
      if (this.checked) {
        var id = $(this).attr('data');
        selected.push(id);
      }
      $(this).attr('checked', false);
    });
    if (selected.length === 0) {
      $("#model_select").modal('show');
      return;
    }
    Meteor.call('downloadCSVFile', selected, false, function(err, fileUrl) {
      var link = document.createElement("a");
      link.download = 'Search Results.csv';
      link.href = fileUrl;
      link.click();
    });
  },
  'click #exporta': function(e) {
    Meteor.call('downloadCSVFile', null, false, function(err, fileUrl) {
      var link = document.createElement("a");
      link.download = 'Search Results.csv';
      link.href = fileUrl;
      link.click();
    });
  }
});
