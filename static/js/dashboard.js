document.addEventListener("DOMContentLoaded", () => {
    // Sidebar Toggle Function
    const showsidebar = (toggleId, sidebarId, headerId, mainId) => {
        const toggle = document.getElementById(toggleId),
            sidebar = document.getElementById(sidebarId),
            header = document.getElementById(headerId),
            main = document.getElementById(mainId);

        if (toggle && sidebar && header && main) {
            toggle.addEventListener("click", () => {
                sidebar.classList.toggle("show-sidebar");
                header.classList.toggle("left-pd");
                main.classList.toggle("left-pd");
            });
        }
    };

    showsidebar("header-toggle", "sidebar", "header", "main");

    // Sidebar Active Link (Keep it active on page load)
    const sidebarLinks = document.querySelectorAll(".sidebar__list a");

    function setActiveLink() {
        const currentPath = window.location.pathname;

        sidebarLinks.forEach((link) => {
            link.classList.remove("active-link");

            // Check if the link href matches the current URL
            if (link.getAttribute("href") === currentPath) {
                link.classList.add("active-link");
            }
        });
    }

    // Run on page load
    setActiveLink();

    sidebarLinks.forEach((link) => {
        link.addEventListener("click", function () {
            sidebarLinks.forEach((l) => l.classList.remove("active-link"));
            this.classList.add("active-link");
        });
    });

    // Dark/Light Theme Toggle
    const themeButton = document.getElementById("theme-button");
    const darkTheme = "dark-theme";
    const iconTheme = "bi-sun-fill"; // Icon for dark mode
    const lightIconTheme = "bi-moon-fill"; // Icon for light mode

    // Ensure icon exists inside the theme button
    if (!themeButton.querySelector("i")) {
        const iconElement = document.createElement("i");
        iconElement.classList.add("bi"); // Ensure base class
        themeButton.appendChild(iconElement);
    }

    const themeIcon = themeButton.querySelector("i");

    // Retrieve user's saved theme preference
    const selectedTheme = localStorage.getItem("selected-theme");
    const selectedIcon = localStorage.getItem("selected-icon");

    // Function to get the current theme state
    const getCurrentTheme = () =>
        document.body.classList.contains(darkTheme) ? "dark" : "light";
    const getCurrentIcon = () =>
        themeIcon.classList.contains(iconTheme) ? iconTheme : lightIconTheme;

    // Apply the previously selected theme and icon
    if (selectedTheme) {
        document.body.classList.toggle(darkTheme, selectedTheme === "dark");

        themeIcon.classList.remove(lightIconTheme, iconTheme);
        if (selectedIcon) {
            selectedIcon.split(" ").forEach(cls => themeIcon.classList.add(cls));
        } else {
            themeIcon.classList.add(lightIconTheme);
        }
    } else {
        themeIcon.classList.add(lightIconTheme); // Default to light mode icon
    }

    // Toggle theme on button click
    themeButton.addEventListener("click", () => {
        document.body.classList.toggle(darkTheme);

        themeIcon.classList.toggle(lightIconTheme);
        themeIcon.classList.toggle(iconTheme);

        // Save the theme and icon state
        localStorage.setItem("selected-theme", getCurrentTheme());
        localStorage.setItem("selected-icon", `${themeIcon.classList}`);
    });
});


     



// Tool Tip JS Code
$(document).ready(function () {
    $('[data-bs-toggle="tooltip"]').tooltip(); // Initialize tooltips
});
 
// Create Task PopUp Model Js Code
$(document).ready(function() {

    $("#addTaskForm").submit(function(event) {
        event.preventDefault(); // Prevent page reload

        var taskData = {
            name: $("#name").val(),
            description: $("#description").val(),
            finishDate:$("#finishDate").val(),
            start_time:$("#start_time").val(),
            end_time:$("#end_time").val(),
            csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(), // CSRF Token
        };

        $.ajax({
            type: "POST",
            url: "/task/add/",  
            data: taskData,
            success: function(response) {
                if (response.success) {
                   //close the model
                    $("#addTaskModal").modal("hide");

                    // Clear the form
                    $("#addTaskForm")[0].reset();

                    // Show the Bootstrap alert
                    $("#taskAlertAdd").show();

                    // Automatically hide the alert after 3 seconds
                    setTimeout(function() {
                        $("#taskAlertAdd").fadeOut("slow");
                    }, 3000);
                
                    //refresh the table element only
                    $("#taskTable").load(location.href + " #taskTable");
                    $("#taskcard").load(location.href + " #taskcard");
                    $("#taskTab").load(location.href + " #taskTab");
                    $("#noTaskDiv").load(location.href + " #noTaskDiv");
                    $("#taskCalendar").load(location.href + " #taskCalendar");
                    
                }
            },
            error: function(response) {
                alert("Error adding task. Please try again.");
            }
        });
    });


});



// Update Task PopUp Model Js Code
$(document).ready(function() {
    $(document).on("click", ".edit-task", function() {
        let taskId = $(this).data("task-id");
    
        $.ajax({
            url: `/task/edit/${taskId}/`,
            type: "GET",
            dataType: "json",
            success: function(response) {
                console.log("Response Data:", response);
    
                // Populate modal form fields
                $("#task_id").val(response.id);
                $("#task_name").val(response.name);
                $("#task_description").val(response.description);
                $("#task_status").val(response.status);
                $("#task_priority").val(response.priority).change();
    
                // Set datetime and time fields properly
                $('#finish_Date').val(response.finishDate);  // if input type="date"
                $('#start-time').val(response.start_time);
                $('#end-time').val(response.end_time);
    
                // Show the modal
                $("#editTaskModal").modal("show");
            },
            error: function(xhr, status, error) {
                console.error("Error Loading Task:", error);
            }
        });
    });
    
    $(document).on("submit", "#editTaskForm", function (e) {
        e.preventDefault();
    
        let taskId = $("#task_id").val();  // Get task ID from hidden input
        let formData = {
            id: taskId,
            name: $("#task_name").val(),
            description: $("#task_description").val(),
            status: $("#task_status").val(),
            priority: $("#task_priority").val(),
            finish_Date: $("#finish_Date").val(),
            start_time: $("#start-time").val(),
            end_time: $("#end-time").val(),
            csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val()
        };
    
        $.ajax({
            url: `/task/edit/${taskId}/`,  // Django view URL for update
            type: "POST",
            data: formData,
            success: function (response) {
                console.log("Task updated successfully:", response);
                $("#editTaskModal").modal("hide");
                // Optionally reload task list or update UI
                $("#taskAlertEdit").show();

                setTimeout(function() {
                    $("#taskAlertEdit").fadeOut("slow");
                }, 3000);

                $("#taskTable").load(location.href + " #taskTable > *");
                $("#taskcard").load(location.href + " #taskcard");
                $("#taskTab").load(location.href + " #taskTab");
                $("#noTaskDiv").load(location.href + " #noTaskDiv");
                $("#taskCalendar").load(location.href + " #taskCalendar");
            },
            error: function (xhr, status, error) {
                console.error("Error updating task:", error);
            }
        });
    });

    
});


// Delete Task PopUp Model Js Code
$(document).ready(function () {

    let selectedTaskId = null;

    // Open modal and store selected task ID
    $(document).on("click", ".delete-task", function () {
        selectedTaskId = $(this).data("task-id");
        $("#taskid").val(selectedTaskId); // Optional hidden field
        $("#deleteTaskModal").modal("show");
    });

    // Confirm Delete Button
    $(document).on("click", "#confirmDelete", function () {
        if (!selectedTaskId) {
            alert("Error: Task ID not found.");
            return;
        }

        const csrfToken = $("input[name='csrfmiddlewaretoken']").val();

        $.ajax({
            url: `/task/delete/${selectedTaskId}/`,  // Django URL
            type: "POST",
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            success: function (response) {
                $("#deleteTaskModal").modal("hide");

                // Remove the task visually
                $(`.delete-task[data-task-id="${selectedTaskId}"]`).closest(".col-2").fadeOut("slow", function () {
                    $(this).remove();
                });

                selectedTaskId = null; // Reset ID

                // Show alert
                $("#taskAlertDelete").show();

                setTimeout(function () {
                    $("#taskAlertDelete").fadeOut("slow");
                }, 3000);

                // Optionally refresh table sections
                $("#taskTable").load(location.href + " #taskTable > *");
                $("#taskTab").load(location.href + " #taskTab");
                $("#taskcard").load(location.href + " #taskcard");
                $("#taskCalendar").load(location.href + " #taskCalendar");
            },
            error: function (xhr) {
                console.error("Error deleting task:", xhr.responseText);
                alert("Error: " + xhr.responseText);
            }
        });
    });

    // Clear on modal close
    $("#deleteTaskModal").on("hidden.bs.modal", function () {
        selectedTaskId = null;
    });
});



// JAVASCRIPT FUNCTION FOR IMAGE PREVIEW
function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function() {
        var output = document.getElementById('profile-preview');
        output.src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}

// Update Profile PopUp Model Js Code
$(document).ready(function () {
    $("#editProfileForm").submit(function (e) {
        e.preventDefault(); // Prevent normal form submission

        var formData = new FormData(this); // Collect form data including files
        $.ajax({
            type: "POST",
            url: "/profile/update/", // Django view URL
            data: formData,
            processData: false, // Prevent jQuery from processing the data
            contentType: false, // Prevent jQuery from setting contentType
            beforeSend: function () {
                $(".btn-primary").prop("disabled", true).text("Updating...");
            },
            success: function (response) {
                if (response.status === "success") {
                    // Close the modal properly after update
                    $("#EditProfileModal").modal("hide");
            
                    // Show success message
                    $("#profileAlertEdit").text(response.message).show();
            
                    // Automatically hide the alert after 3 seconds
                    setTimeout(function() {
                        $("#profileAlertEdit").fadeOut("slow");
                    }, 3000);
            
                    $("#sidebar").load(location.href + " #sidebar");
                    $("#profileImageModal").load(location.href + " #profileImageModal");
            
                } else {
                    alert("Error: " + response.message);
                }
            },
            error: function (xhr) {
                let errors = xhr.responseJSON.errors;  // Get JSON errors
                
                let errorMessages = "";
                for (let field in errors) {
                    errorMessages += `<p>${field}: ${errors[field][0].message}</p>`;
                }

                $("#error-div").html(errorMessages).show();  // Show errors in div
            },
            complete: function () {
                $(".btn-primary").prop("disabled", false).text("Update Profile");
            },
        });
    });
});


// CHART JS CODE
// document.addEventListener("DOMContentLoaded", function() {
//     let doughnutChartInstance = null;  // Store chart instance

//     function loadChart() {
//         fetch("/chart-data/")  // Ensure this endpoint returns correct JSON data
//         .then(response => response.json())
//         .then(data => {
//             const ctx = document.getElementById('doughnutChart').getContext('2d');

//             // If chart exists, destroy it before creating a new one
//             if (doughnutChartInstance) {
//                 doughnutChartInstance.destroy();
//             }

//             // Create a new chart instance
//             doughnutChartInstance = new Chart(ctx, {
//                 type: 'doughnut',
//                 data: {
//                     labels: data.labels,
//                     datasets: [{
//                         data: data.values,
//                         backgroundColor: data.colors
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     plugins: {
//                         legend: {
//                             position: 'bottom'
//                         }
//                     }
//                 }
//             });
//         })
//         .catch(error => console.error("Error loading chart data:", error));
//     }

//     function updateChart() {
//         if (!doughnutChartInstance) return; // If chart isn't initialized, do nothing

//         fetch("/chart-data/") // Fetch updated data
//         .then(response => response.json())
//         .then(data => {
//             // Update the chart data dynamically
//             doughnutChartInstance.data.labels = data.labels;
//             doughnutChartInstance.data.datasets[0].data = data.values;
//             doughnutChartInstance.data.datasets[0].backgroundColor = data.colors;
            
//             // Refresh the chart without destroying it
//             doughnutChartInstance.update();
//         })
//         .catch(error => console.error("Error updating chart data:", error));
//     }

//     loadChart();  // Load the chart initially when the page loads

//     // Expose updateChart globally so it can be called after AJAX updates
//     window.updateChart = updateChart;
// });


// weekly date js code
$(document).ready(function () {
    let currentDate = getTodayDate();

    // Initialize or refresh Bootstrap tooltips
    function reinitializeTooltips() {
        $('[data-bs-toggle="tooltip"]').tooltip('dispose').tooltip();
    }

    // Get today's date at midnight local time
    function getTodayDate() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    // Get start of the week (Sunday)
    function getStartOfWeek(date) {
        const day = date.getDay();
        const start = new Date(date);
        start.setDate(date.getDate() - day);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    // Format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Fetch tasks via AJAX
    function fetchTasks(startDate) {
        const startOfWeek = getStartOfWeek(startDate);
        const formattedDate = formatDate(startOfWeek);
        console.log("Fetching tasks starting from:", formattedDate);

        $.ajax({
            url: "/fetch-tasks-weekly/",
            type: "GET",
            data: { start_date: formattedDate },
            success: function (response) {
                try {
                    $("#taskcard").html(response.card_html);
                    $("#currentWeek span").text(response.week_range);
                    reinitializeTooltips();
                    console.log("Tasks loaded for week:", response.week_range);
                } catch (e) {
                    console.error("Error processing response:", e);
                    alert("Something went wrong while rendering tasks.");
                }
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", status, error);
                console.log("Response Text:", xhr.responseText);
                alert("Failed to load weekly tasks.");
            },
            complete: function () {
                console.log("AJAX request completed.");
            }
        });
    }

    // Use event delegation for arrow buttons in case they are dynamically rendered
    $(document).on("click", "#leftArrow", function () {
        console.log("Left arrow clicked");
        $('[data-bs-toggle="tooltip"]').tooltip('hide');
        let newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        currentDate = newDate;
        fetchTasks(currentDate);
    });

    $(document).on("click", "#rightArrow", function () {
        $('[data-bs-toggle="tooltip"]').tooltip('hide');
        console.log("Right arrow clicked");
        let newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        currentDate = newDate;
        fetchTasks(currentDate);
    });

    // Tooltip initialization only once
    $('[data-bs-toggle="tooltip"]').tooltip();
});



//Update Password JS

$(document).ready(function() {
    $("#updatePasswordForm").submit(function(e) {
        e.preventDefault();
        let oldPassword = $("#old_password").val();
        let newPassword1 = $("#new_password1").val();
        let newPassword2 = $("#new_password2").val();
        let csrfToken = $("input[name=csrfmiddlewaretoken]").val();

        // Hide previous alerts before making request
        $("#oldPasswordAlert, #newPasswordAlert").hide();

        $.ajax({
            url: `/change-password/`,
            type: "POST",
            data: {
                old_password: oldPassword,
                new_password1: newPassword1,
                new_password2: newPassword2,
                csrfmiddlewaretoken: csrfToken
            },
            dataType: "json",
            success: function(response) {
                if (response.success) {
                    // ✅ Success: Close modal and redirect to login
                    $("#updatePasswordModal").modal("hide");

                    // 🔄 Reset the form
                    $("#updatePasswordForm")[0].reset();
                    
                    $("#updatePasswordAlert").show();
                    setTimeout(function() {
                        $("#updatePasswordAlert").fadeOut("slow");

                        // Redirect to login page
                        window.location.href = response.redirect_url;
                    }, 5000);
                } else {
                    // ❌ Error Handling
                    if (response.errors) {
                        if (response.errors.old_password) {
                            $("#oldPasswordAlert").show();
                            $("#updatePasswordForm")[0].reset();  // Show old password error
                            // Automatically hide the alert after 3 seconds
                            setTimeout(function() {
                                $("#oldPasswordAlert").fadeOut("slow");
                            }, 5000);
                        }
                        if (response.errors.new_password2) {
                            $("#newPasswordAlert").show();
                            $("#updatePasswordForm")[0].reset();  // Show new password mismatch error
                            setTimeout(function() {
                                $("#newPasswordAlert").fadeOut("slow");
                            }, 5000);
                        }
                        if (response.errors.new_password1) {
                            $("#passwordValidationAlert").show();
                            $("#updatePasswordForm")[0].reset();  // Show new password mismatch error
                            setTimeout(function() {
                                $("#passwordValidationAlert").fadeOut("slow");
                            }, 5000);
                        }
                    }
                }
            }
        });
    });
});


// For Date
flatpickr(".datepicker", {
    dateFormat: "Y-m-d",
});
//For Time
flatpickr(".timepicker", {
    enableTime: true, // Enable time selection
    noCalendar: true, // Disable date selection
    dateFormat: "h:i K", // 12-hour format with AM/PM
    time_24hr: false, // Use 12-hour format
});

// for Monthly data
$(document).ready(function () {
    let currentDate = getTodayDate();

    // Get today's date at midnight local time
    function getTodayDate() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    // Format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Initialize or refresh Bootstrap tooltips
    function reinitializeTooltips() {
        $('[data-bs-toggle="tooltip"]').tooltip('dispose').tooltip();
    }

    // Fetch tasks for the whole month
    function fetchTasksMonthly(date) {
        const formattedDate = formatDate(date);
        console.log("Fetching tasks for month starting from:", formattedDate);

        $.ajax({
            url: "/fetch-tasks-monthly/",
            type: "GET",
            data: { start_date: formattedDate },
            success: function (response) {
                try {
                    $("#taskCalendar").html(response.card_html);
                    $("#currentMonth span").text(response.month_range);
                    console.log("Tasks loaded for month:", response.month_range);
                    reinitializeTooltips(); // Rebind tooltips after DOM change
                } catch (e) {
                    console.error("Error processing response:", e);
                    alert("Something went wrong while rendering tasks.");
                }
            },
            error: function (xhr, status, error) {
                console.error("AJAX Error:", status, error);
                console.log("Response Text:", xhr.responseText);
                alert("Failed to load monthly tasks.");
            },
            complete: function () {
                console.log("AJAX request completed.");
            }
        });
    }

    // Navigate to previous month
    $(document).on("click", "#prevMonth", function () {
        $('[data-bs-toggle="tooltip"]').tooltip('hide'); // Hide tooltips
        console.log("Previous month clicked");
        currentDate.setMonth(currentDate.getMonth() - 1);
        fetchTasksMonthly(currentDate);
    });

    // Navigate to next month
    $(document).on("click", "#nextMonth", function () {
        $('[data-bs-toggle="tooltip"]').tooltip('hide'); // Hide tooltips
        console.log("Next month clicked");
        currentDate.setMonth(currentDate.getMonth() + 1);
        fetchTasksMonthly(currentDate);
    });

    // Tooltip initialization only once
    $('[data-bs-toggle="tooltip"]').tooltip();
});









