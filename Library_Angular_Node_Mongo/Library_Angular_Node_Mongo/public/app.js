// Create AngularJS application
var app = angular.module("libraryApp", []);

// AngularJS service: sends requests to the Node.js backend
app.service("BookService", function($http) {
  this.getBooks = function() {
    return $http.get("/api/books");
  };

  this.addBook = function(book) {
    return $http.post("/api/books", book);
  };

  this.updateBook = function(id, status) {
    return $http.put("/api/books/" + id, { status: status });
  };

  this.deleteBook = function(id) {
    return $http.delete("/api/books/" + id);
  };
});

// AngularJS controller
app.controller("LibraryController", function($scope, BookService) {
  $scope.loggedIn = false;
  $scope.login = {};
  $scope.newBook = {};
  $scope.books = [];
  $scope.message = "";

  // Simple demonstration login (not secure authentication)
  $scope.loginUser = function() {
    if ($scope.login.username === "student" &&
        $scope.login.password === "1234") {
      $scope.loggedIn = true;
      $scope.loginMessage = "";
      $scope.loadBooks();
    } else {
      $scope.loginMessage = "Wrong username or password";
    }
  };

  $scope.logout = function() {
    $scope.loggedIn = false;
  };

  $scope.loadBooks = function() {
    BookService.getBooks().then(function(response) {
      $scope.books = response.data;
    });
  };

  $scope.addBook = function() {
    if (!$scope.newBook.title || !$scope.newBook.author) {
      $scope.message = "Enter both title and author";
      return;
    }

    BookService.addBook($scope.newBook).then(function() {
      $scope.newBook = {};
      $scope.message = "Book added!";
      $scope.loadBooks();
    });
  };

  $scope.changeStatus = function(book) {
    var status = book.status === "Available" ? "Issued" : "Available";
    BookService.updateBook(book._id, status).then(function() {
      $scope.loadBooks();
    });
  };

  $scope.deleteBook = function(id) {
    BookService.deleteBook(id).then(function() {
      $scope.message = "Book deleted!";
      $scope.loadBooks();
    });
  };
});