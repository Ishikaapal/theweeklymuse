from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path



urlpatterns =[
    path('',views.home,name='home'),
    path('register/',views.register_view,name='register'),
    path('dashboard/',views.dashboard_view,name='dashboard'),
    path('login/',views.login_view,name='login'),
    path('logout/',views.logout_view,name='logout'),
    path('task/',views.task,name='task'),
    path('task/add/',views.add_task,name='task-add'),
    path('task/edit/<int:id>/',views.task_edit,name='task-edit'),
    path('task/delete/<int:id>/',views.task_delete,name='task-delete'),
    path('profile/update/',views.profile_edit,name='profile-update'),
     path('change-password/', views.change_password, name='change_password'),
    path('chart-data/', views.get_chart_data, name='get_chart_data'),
    path("fetch-tasks-weekly/", views.fetch_tasks_weekly, name="fetch_tasks_weekly"),
    path("fetch-tasks-monthly/", views.fetch_tasks_monthly, name="fetch_tasks_monthly"),
    path("calendar/", views.calendar, name="calendar"),
    path('login2/',views.login2,name='login2') 
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
