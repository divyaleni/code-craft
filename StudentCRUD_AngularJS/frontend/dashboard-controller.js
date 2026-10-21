app.controller("DashboardController", function ($scope, StudentService, AuthFactory) {
    if (!AuthFactory.getToken()) {
        window.location.replace("login.html");
        return;
    }

    $scope.userName = AuthFactory.getUserName();
    $scope.students = [];
    $scope.student = {};
    $scope.editMode = false;
    $scope.editId = null;
    $scope.message = "";
    $scope.isError = false;
    $scope.loading = false;

    function showError(error, fallback) {
        if (error && error.status === 401) {
            AuthFactory.clearSession();
            window.location.replace("login.html");
            return;
        }
        $scope.message = error && error.data && error.data.message
            ? error.data.message : fallback;
        $scope.isError = true;
    }

    $scope.loadStudents = function () {
        $scope.loading = true;
        StudentService.getStudents()
            .then(function (response) {
                $scope.students = Array.isArray(response.data) ? response.data : [];
                $scope.loading = false;
            })
            .catch(function (error) {
                $scope.loading = false;
                showError(error, "Could not load students.");
            });
    };

    $scope.saveStudent = function () {
        $scope.message = "";
        $scope.isError = false;
        var wasEditing = $scope.editMode;
        // Save the name in uppercase too, not only display it in uppercase.
        var studentToSave = angular.copy($scope.student);
        studentToSave.name = studentToSave.name ? studentToSave.name.toUpperCase().trim() : "";

        var request = wasEditing
            ? StudentService.updateStudent($scope.editId, studentToSave)
            : StudentService.addStudent(studentToSave);

        request.then(function (response) {
            $scope.message = response.data && response.data.message
                ? response.data.message
                : (wasEditing ? "Student updated successfully." : "Student added successfully.");
            $scope.isError = false;
            $scope.clearForm();
            $scope.loadStudents();
        }).catch(function (error) {
            showError(error, "Could not save student.");
        });
    };

    $scope.editStudent = function (student) {
        $scope.student = {
            name: student.name,
            email: student.email,
            department: student.department
        };
        $scope.editId = student._id;
        $scope.editMode = true;
        $scope.message = "";
        $scope.isError = false;
    };

    $scope.deleteStudent = function (id) {
        if (!window.confirm("Are you sure you want to delete this student?")) return;

        StudentService.deleteStudent(id)
            .then(function (response) {
                $scope.message = response.data && response.data.message
                    ? response.data.message : "Student deleted successfully.";
                $scope.isError = false;
                if ($scope.editId === id) $scope.clearForm();
                $scope.loadStudents();
            })
            .catch(function (error) {
                showError(error, "Could not delete student.");
            });
    };

    $scope.clearForm = function () {
        $scope.student = {};
        $scope.editMode = false;
        $scope.editId = null;
    };

    $scope.logout = function () {
        AuthFactory.clearSession();
        window.location.replace("login.html");
    };

    $scope.loadStudents();
});
