from django.shortcuts import render,redirect,get_object_or_404
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login,logout,authenticate
from .middlewares import auth,guest
from django.http import JsonResponse
from .models import Task,Profile
from django.core.paginator import Paginator
import django_filters
from .forms import ProfileUpdateForm
import json
from .forms import CustomPasswordChangeForm
from django.contrib import messages
import os
from django.utils.timezone import now
from datetime import timedelta,datetime 
from calendar import monthrange
from datetime import date
from django.contrib.auth.views import PasswordChangeView
from django.urls import reverse_lazy
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from datetime import datetime
from django.template.loader import render_to_string


# Create your views here.

# Task Filter Class
class TaskFilter(django_filters.FilterSet):
    class Meta:
        model = Task
        fields = {
            'status': ['exact'],  # Example: Filtering by status
        }

def home(request):
    return render(request,'index.html')

@auth  #Decorater use
def dashboard_view(request):
    today = now().date()
    start_of_week = today - timedelta(days=today.weekday() + 1 if today.weekday() != 6 else 0)
    end_of_week = start_of_week + timedelta(days=6)

    tasks = Task.objects.filter(
        username=request.user,
        finishDate__range=[start_of_week, end_of_week]
    ).values('id','name','finishDate','status','priority').order_by('-id')

    # Group tasks by finishDate
    task_dict = {}
    for task in tasks:
        day = task['finishDate'].strftime('%A')  # e.g. 'Monday'
        if day not in task_dict:
            task_dict[day] = []
        task_dict[day].append(task)

    days_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    task_created=tasks.count()
    incomplete_task = tasks.filter(status='Incomplete').count()
    complete_task = tasks.filter(status='Complete').count()

    data={
        "taskCreated": task_created,
        "Incomplete": incomplete_task,
        "completed": complete_task,

    }
    return render(request, 'dashboard.html', {
    'tasks_by_day': task_dict, 
    'days_of_week': days_of_week,
    'data':data
    })
    

@guest #Decorater use
def register_view(request):
    if request.method=='POST':
        form=UserCreationForm(request.POST)        
        if form.is_valid():
            user=form.save()
            login(request,user)
            return redirect('dashboard')
        else:
            print(form.errors.get('password2'))
            return render(request, 'register.html', {'form': form})
    else:
        initial_data = {
            'username': '',
            'password1': '',
            'password2': '',
        }
        form = UserCreationForm(initial=initial_data)
    return render(request,'register.html',{'form': form})

@guest #Decorater use
def login_view(request):
    if request.method=='POST':
        form=AuthenticationForm(request,data=request.POST)
        if form.is_valid():
            user=form.get_user()
            login(request,user)
            return redirect('dashboard')
    else:
        initial_data = {
            'username': '',
            'password': '',
        }
        form=AuthenticationForm(initial=initial_data)
    return render(request,'login.html',{'form': form})
 
def logout_view(request):
    logout(request)
    return redirect('login')

def login2(request):
    return render(request,'userReg.html')


@auth
def task(request):
    tasks = Task.objects.filter(username=request.user).order_by('-id')

    paginator = Paginator(tasks, 10)  # Show 5 tasks per page
    page_number = request.GET.get('page')
    page_task = paginator.get_page(page_number)

    return render(request,'task.html',{'page_task':page_task})

@auth 
def add_task(request):
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description")
        finishDate = request.POST.get("finishDate")
        start_time = request.POST.get("start_time")
        end_time = request.POST.get("end_time") 

        # Validate required fields
        if not all([name, description, finishDate, start_time, end_time]):
            return JsonResponse({"success": False, "message": "Missing required fields"}, status=400)
        
        # Parse date and time
        finish_date_obj = datetime.strptime(finishDate, "%Y-%m-%d").date()
        start_time_obj = datetime.strptime(start_time, "%I:%M %p").time()
        end_time_obj = datetime.strptime(end_time, "%I:%M %p").time()
        try:
            # Create and save task
            task = Task.objects.create(
                name=name,
                description=description,
                finishDate=finish_date_obj,
                start_time=start_time_obj,
                end_time=end_time_obj,
                username=request.user
            )

            return JsonResponse({"success": True, "message": "Task added successfully!"})

        except Exception as e:
            return JsonResponse({"success": False, "message": f"Error: {str(e)}"}, status=500)

    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)



@auth
def task_edit(request, id):
    if request.method == 'GET':
        task = get_object_or_404(Task, id=id, username=request.user)
        data = {
        "id": task.id,
        "name": task.name,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "finishDate": task.finishDate.strftime("%Y-%m-%d"),  # Only date
        "start_time": task.start_time.strftime("%I:%M %p"),  # 12-hour with AM/PM
        "end_time": task.end_time.strftime("%I:%M %p"),
        }
        return JsonResponse(data)
    
    if request.method == "POST":
        name = request.POST.get("name")
        description = request.POST.get("description")
        status=request.POST.get("status")
        priority=request.POST.get("priority")
        finishDate = request.POST.get("finish_Date")
        start_time = request.POST.get("start_time")
        end_time = request.POST.get("end_time")

        # Parse date and time
        finish_date_obj = datetime.strptime(finishDate, "%Y-%m-%d").date()
        start_time_obj = datetime.strptime(start_time, "%I:%M %p").time()
        end_time_obj = datetime.strptime(end_time, "%I:%M %p").time()

        task = get_object_or_404(Task, id=id, username=request.user)
        task.name = name
        task.description = description
        task.status = status
        task.priority = priority
        task.finishDate = finish_date_obj
        task.start_time = start_time_obj
        task.end_time = end_time_obj
        task.save()
        return JsonResponse({"message": "Task updated successfully."})
    return JsonResponse({"error": "Invalid request"}, status=400)    

    



@auth
def task_delete(request, id):
    print('Working')
    if request.method == "POST":
        task = get_object_or_404(Task, id=id, username=request.user)
        task.delete()
        return JsonResponse({"message": "Deleted successfully"}, status=200)
    return JsonResponse({"error": "Invalid request"}, status=400)


@auth
def profile_edit(request):    
    if request.method == "POST":
        profile = get_object_or_404(Profile, user=request.user)

        old_image = profile.profile_pic.path if profile.profile_pic else None  # Store old image path

        form = ProfileUpdateForm(request.POST, request.FILES, instance=profile)

        if form.is_valid():
            form.save()

            # Delete old image if a new one was uploaded
            if old_image and profile.profile_pic.path != old_image:
                if os.path.isfile(old_image):
                    os.remove(old_image)

            return JsonResponse({'status': 'success', 'message': 'Profile updated successfully!'})

        # Return form errors if validation fails
        return JsonResponse({'success': False, 'errors': json.loads(form.errors.as_json())}, status=400)

    return JsonResponse({'success': False, 'message': 'Invalid request'}, status=400)



@auth
def change_password(request):
    if request.method == 'POST':
        # Get Data From Post Request
        old_password = request.POST.get("old_password")
        new_password1 = request.POST.get("new_password1")
        new_password2 = request.POST.get("new_password2")

        # Check if the old password entered is correct
        user = authenticate(username=request.user.username, password=old_password)

        if user is None:  # If authentication fails, return an error
            return JsonResponse({'success': False, 'errors': {'old_password': [{'message': 'Incorrect old password'}]}})
        
        # Check if new passwords match
        if new_password1 != new_password2:
            return JsonResponse({'success': False, 'errors': {'new_password2': [{'message': 'New passwords do not match!'}]}})
        
        try:
            validate_password(new_password1, user=request.user)
        except ValidationError as e:
            return JsonResponse({'success': False, 'errors': {'new_password1': [{'message': msg} for msg in e.messages]}})

        # If everything is fine, update the password manually
        request.user.set_password(new_password1)
        request.user.save()

        # Logout the user after changing password
        logout(request)

        # Redirect to login with a success message
        return JsonResponse({'success': True, 'message': 'Password changed successfully! Please log in again.', 'redirect_url': '/logout/'})

    return JsonResponse({'success': False, 'message': 'Invalid request'}, status=400)


@auth
def get_chart_data(request):
    # Get tasks for the logged-in user
    tasks = Task.objects.filter(username=request.user)

    # Get distinct status values
    statuses = tasks.values_list('status', flat=True).distinct()

    # Count occurrences of each status
    values = [tasks.filter(status=status).count() for status in statuses]

    data = {
        "labels": list(statuses),  # Convert QuerySet to a list
        "values": values,
        "colors": ["#36A2EB", "#FFCE56", "#FF6384", "#4BC0C0", "#9966FF", "#FF9F40"][:len(statuses)]
    }    
    return JsonResponse(data)

@auth
def fetch_tasks_weekly(request):
    today_str = request.GET.get("start_date")

    if not today_str:
        return JsonResponse({"error": "Invalid date"}, status=400)

    try:
        selected_date = datetime.strptime(today_str, "%Y-%m-%d").date()
    except ValueError:
        return JsonResponse({"error": "Invalid date format"}, status=400)

    # Calculate Sunday (start of the week) and Saturday (end of the week)
    weekday_index = selected_date.weekday()  # Monday = 0, Sunday = 6
    days_to_sunday = (selected_date.weekday() + 1) % 7
    start_of_week = selected_date - timedelta(days=days_to_sunday)
    end_of_week = start_of_week + timedelta(days=6)

    # Fetch weekly tasks
    tasks = Task.objects.filter(
        username=request.user,
        finishDate__range=[start_of_week, end_of_week]
    ).values('id', 'name', 'finishDate', 'status', 'priority')

    # Group tasks by weekday name
    task_dict = {}
    for task in tasks:
        finish_date = task.get('finishDate')
        if finish_date:
            day_name = finish_date.strftime('%A')  # e.g., 'Monday'
            task_dict.setdefault(day_name, []).append(task)

    days_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    # Task stats
    task_created = tasks.count()
    incomplete_task = tasks.filter(status='Incomplete').count()
    complete_task = tasks.filter(status='Complete').count()

    data = {
        "taskCreated": task_created,
        "Incomplete": incomplete_task,
        "completed": complete_task,
    }

    week_range = f"{start_of_week.strftime('%b %d')} - {end_of_week.strftime('%b %d')}"

    card_html = render_to_string("partials/weeklyTask.html", {
        "tasks_by_day": task_dict,
        "days_of_week": days_of_week,
        "data": data
    }, request)

    return JsonResponse({
        "card_html": card_html,
        "week_range": week_range,
        "days_of_week": days_of_week,
        "data": data
    })

@auth
def calendar(request):
    today = now().date()
    start_of_month = today.replace(day=1)
    _, last_day = monthrange(today.year, today.month)
    end_of_month = today.replace(day=last_day)

    # Keep original queryset for counting
    full_queryset = Task.objects.filter(
        username=request.user,
        finishDate__range=[start_of_month, end_of_month]
    )

    tasks = full_queryset.values('id', 'name', 'finishDate')
    # Group tasks by finishDate
    task_dict = {}
    for task in tasks:
        day = task['finishDate'].strftime('%Y-%m-%d')
        if day not in task_dict:
            task_dict[day] = []
        task_dict[day].append(task)

    task_created = full_queryset.count()
    incomplete_task = full_queryset.filter(status='Incomplete').count()

    data = {
        "taskCreated": task_created,
        "Incomplete": incomplete_task,
        'month': date.today()
    }

    return render(request, 'calendar.html', {
        'tasks_by_day': task_dict,
        'current_month': today.strftime('%m'),
        'current_year': today.strftime('%Y'),
        'days_in_month': range(1, last_day + 1),
        'formatted_today': today.strftime('%Y-%m-%d'),
        'data': data,
    })

@auth
def fetch_tasks_monthly(request):
    today_str = request.GET.get("start_date")

    if not today_str:
        return JsonResponse({"error": "Invalid date"}, status=400)

    try:
        selected_date = datetime.strptime(today_str, "%Y-%m-%d").date()
    except ValueError:
        return JsonResponse({"error": "Invalid date format"}, status=400)


    # Get start and end of the selected month
    start_of_month = selected_date.replace(day=1)
    _, num_days = monthrange(selected_date.year, selected_date.month)
    end_of_month = date(selected_date.year, selected_date.month, num_days)

    # Get tasks within the month range
    full_queryset = Task.objects.filter(
        username=request.user,
        finishDate__range=[start_of_month, end_of_month]
    )

    tasks = full_queryset.values('id', 'name', 'finishDate', 'status', 'priority')
    
    # Group tasks by finishDate
    task_dict = {}
    for task in tasks:
        day = task['finishDate'].strftime('%Y-%m-%d')
        task_dict.setdefault(day, []).append(task)

    task_created = full_queryset.count()
    incomplete_task = full_queryset.filter(status='Incomplete').count()

    data = {
        "taskCreated": task_created,
        "Incomplete": incomplete_task,
        'month': date.today().strftime('%B %Y')
    }
    # Render the calendar HTML
    card_html = render_to_string("partials/calendar.html", {
        "tasks_by_day": task_dict,
        'current_month': f"{selected_date.month:02d}",
        'current_year': selected_date.year,
        'days_in_month': list(range(1, num_days + 1)),
        'formatted_today': date.today().strftime('%Y-%m-%d'),
        'data': data,
    }, request)

    return JsonResponse({
        "card_html": card_html,
        "tasks_by_day": task_dict,
        'current_month': f"{selected_date.month:02d}",
        'current_year': selected_date.year,
        'days_in_month': list(range(1, num_days + 1)),
        'formatted_today': date.today().strftime('%Y-%m-%d'),
        'month_range': selected_date.strftime('%B, %Y'),
        'data': data,
    })

