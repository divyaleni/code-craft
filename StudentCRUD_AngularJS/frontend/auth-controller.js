app.controller("RegisterController", function ($scope, StudentService) {
    $scope.user = {};
    $scope.message = "";
    $scope.isError = false;
    $scope.loading = false;

    $scope.register = function () {
        $scope.message = "";
        $scope.isError = false;
        $scope.loading = true;

        StudentService.register($scope.user)
            .then(function (response) {
                $scope.message = response.data.message || "Registration successful.";
                $scope.isError = false;
                $scope.user = {};
                window.location.href = "login.html";
            })
            .catch(function (error) {
                $scope.message = error.data && error.data.message
                    ? error.data.message : "Registration failed.";
                $scope.isError = true;
                $scope.loading = false;
            });
    };
});

app.controller("LoginController", function ($scope, StudentService, AuthFactory) {
    $scope.user = {};
    $scope.message = "";
    $scope.isError = false;
    $scope.loading = false;

    $scope.login = function () {
        $scope.message = "";
        $scope.isError = false;
        $scope.loading = true;

        StudentService.login($scope.user)
            .then(function (response) {
                var data = response.data || {};
                if (!data.token) {
                    $scope.message = "Login response did not include a token.";
                    $scope.isError = true;
                    $scope.loading = false;
                    console.error("Unexpected login response:", data);
                    return;
                }

                AuthFactory.saveSession(data.token, data.name || $scope.user.email);
                window.location.replace("dashboard.html");
            })
            .catch(function (error) {
                $scope.message = error.data && error.data.message
                    ? error.data.message : "Login failed. Check your details and backend.";
                $scope.isError = true;
                $scope.loading = false;
                console.error("Login request failed:", error);
            });
    };
});
