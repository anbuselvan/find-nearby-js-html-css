Template.storedResults.helpers({
  storedResults: function() {
    return StoredResults.find({});
  }
});

Template.storedResults.events({
  'click #remove': function(e) {
    $('.chk-save').each(function() {
      if (this.checked) {
        var id = $(this).attr('data');
        var found = StoredResults.findOne({userId: Meteor.userId(), pid: id});
        if (found) {
          StoredResults.remove({_id: found._id});
        }
      }
    });
  },
  'click #exports': function(e) {
    var selected = [];
    $('.chk-save').each(function() {
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
    Meteor.call('downloadCSVFile', selected, true, function(err, fileUrl) {
      var link = document.createElement("a");
      link.download = 'Stored Results.csv';
      link.href = fileUrl;
      link.click();
    });
  },
  'click #exporta': function(e) {
    Meteor.call('downloadCSVFile', null, true, function(err, fileUrl) {
      var link = document.createElement("a");
      link.download = 'Stored Results.csv';
      link.href = fileUrl;
      link.click();
    });
  }
});
