var app = angular.module("studentApp", []);

app.constant("API_URL", "http://localhost:5000/api");

// Factory: keeps login token and username in one place.
app.factory("AuthFactory", function () {
    var TOKEN_KEY = "studentToken";
    var USER_KEY = "studentUser";

    return {
        saveSession: function (token, userName) {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, userName || "Student");
        },
        getToken: function () {
            return localStorage.getItem(TOKEN_KEY);
        },
        getUserName: function () {
            return localStorage.getItem(USER_KEY) || "Student";
        },
        clearSession: function () {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
    };
});

// Service: all backend requests are handled here.
app.service("StudentService", function ($http, API_URL, AuthFactory) {
    function authConfig() {
        var token = AuthFactory.getToken();
        return {
            headers: token ? { Authorization: "Bearer " + token } : {}
        };
    }

    this.register = function (user) {
        return $http.post(API_URL + "/auth/register", user);
    };

    this.login = function (user) {
        return $http.post(API_URL + "/auth/login", user);
    };

    this.getStudents = function () {
        return $http.get(API_URL + "/students", authConfig());
    };

    this.addStudent = function (student) {
        return $http.post(API_URL + "/students", student, authConfig());
    };

    this.updateStudent = function (id, student) {
        return $http.put(API_URL + "/students/" + id, student, authConfig());
    };

    this.deleteStudent = function (id) {
        return $http.delete(API_URL + "/students/" + id, authConfig());
    };
});

// Custom filter: display every student name in uppercase.
app.filter("uppercaseName", function () {
    return function (input) {
        if (!input) return "";
        return String(input).toUpperCase();
    };
});
