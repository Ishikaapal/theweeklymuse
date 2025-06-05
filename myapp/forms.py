from django import forms
from django.contrib.auth.forms import PasswordChangeForm
from .models import Task,Profile

class TaskForm(forms.ModelForm):
    finishDate = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'class': 'form-control datetimepicker'})
    )
    start_time = forms.TimeField(
        widget=forms.TimeInput(attrs={'class': 'form-control timepicker'})
    )
    end_time = forms.TimeField(
        widget=forms.TimeInput(attrs={'class': 'form-control timepicker'})
    )

    class Meta:
        model = Task
        fields = ['name', 'description', 'status', 'finishDate', 'start_time', 'end_time', 'priority', 'username']

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['fname', 'email', 'profile_pic']
        widgets = {
            'fname': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Full Name'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
            'profile_pic': forms.FileInput(attrs={'class': 'form-control'}),
        }
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if Profile.objects.exclude(user=self.instance.user).filter(email=email).exists():
            raise forms.ValidationError("This email is already in use.")
        return email


class CustomPasswordChangeForm(PasswordChangeForm):
    old_password = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Old Password"}),
        label=''
    )
    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "New Password"}),
        label=''
    )
    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Confirm New Password"}),
        label=''
    )
