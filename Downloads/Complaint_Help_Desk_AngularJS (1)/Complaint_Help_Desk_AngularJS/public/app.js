var app = angular.module('helpDeskApp', []);

// AngularJS service for ticket API calls
app.service('TicketService', function($http) {
  var api = '/api/tickets';

  this.getAll = function() {
    return $http.get(api);
  };

  this.create = function(ticket) {
    return $http.post(api, ticket);
  };

  this.update = function(id, ticket) {
    return $http.put(api + '/' + id, ticket);
  };

  this.close = function(id) {
    return $http.patch(api + '/' + id + '/close');
  };

  this.remove = function(id) {
    return $http.delete(api + '/' + id);
  };
});

app.controller('TicketController', function($scope, TicketService) {
  $scope.tickets = [];
  $scope.statusFilter = '';
  $scope.form = { title: '', category: '', priority: 'Medium' };
  $scope.editingId = null;
  $scope.loading = false;
  $scope.message = '';
  $scope.error = '';

  $scope.loadTickets = function() {
    $scope.loading = true;
    TicketService.getAll()
      .then(function(response) {
        $scope.tickets = response.data;
      })
      .catch(function() {
        $scope.error = 'Could not load tickets. Check the server and database.';
      })
      .finally(function() {
        $scope.loading = false;
      });
  };

  // Filter tickets as Open or Closed
  $scope.filteredTickets = function() {
    if (!$scope.statusFilter) return $scope.tickets;
    return $scope.tickets.filter(function(ticket) {
      return ticket.status === $scope.statusFilter;
    });
  };

  $scope.saveTicket = function() {
    $scope.message = '';
    $scope.error = '';
    var data = {
      title: $scope.form.title,
      category: $scope.form.category,
      priority: $scope.form.priority,
      status: $scope.form.status || 'Open'
    };

    var request = $scope.editingId
      ? TicketService.update($scope.editingId, data)
      : TicketService.create(data);

    request.then(function() {
      $scope.message = $scope.editingId ? 'Ticket updated.' : 'Ticket submitted.';
      $scope.resetForm();
      $scope.loadTickets();
    }).catch(function(response) {
      $scope.error = response.data && response.data.message ? response.data.message : 'Could not save ticket.';
    });
  };

  $scope.editTicket = function(ticket) {
    $scope.editingId = ticket._id;
    $scope.form = {
      title: ticket.title,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status
    };
    $scope.message = '';
    $scope.error = '';
    window.scrollTo(0, 0);
  };

  $scope.resetForm = function() {
    $scope.form = { title: '', category: '', priority: 'Medium' };
    $scope.editingId = null;
  };

  $scope.closeTicket = function(ticket) {
    TicketService.close(ticket._id).then(function() {
      $scope.message = 'Ticket closed.';
      $scope.loadTickets();
    }).catch(function() {
      $scope.error = 'Could not close ticket.';
    });
  };

  $scope.reopenTicket = function(ticket) {
    var data = {
      title: ticket.title,
      category: ticket.category,
      priority: ticket.priority,
      status: 'Open'
    };
    TicketService.update(ticket._id, data).then(function() {
      $scope.message = 'Ticket reopened.';
      $scope.loadTickets();
    }).catch(function() {
      $scope.error = 'Could not reopen ticket.';
    });
  };

  $scope.deleteTicket = function(ticket) {
    if (!window.confirm('Delete this ticket?')) return;
    TicketService.remove(ticket._id).then(function() {
      $scope.message = 'Ticket deleted.';
      $scope.loadTickets();
    }).catch(function() {
      $scope.error = 'Could not delete ticket.';
    });
  };

  $scope.loadTickets();
});
