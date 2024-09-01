from django import forms
from .models import VirtualEnvironment, CtrlPackageRepo


class VirtualEnvironmentForm(forms.ModelForm):
    ctrl_package_repo = forms.ChoiceField(choices=[])

    class Meta:
        model = VirtualEnvironment
        fields = [
            "venv_name",
            "python_version",
            "nickname",
            "requirements",
            "script",
            "config_file",
            "ctrl_package_repo",
        ]
        # widgets = {
        #     "ctrl_package_repo": forms.Select(),  # Ensure it uses a select widget
        # }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Optionally, you can filter the choices or set widgets if needed
        pkgs = CtrlPackageRepo.objects.all()
        choices = []
        for pkg in pkgs:
            choices.extend(pkg.get_version_choices())
        self.fields["ctrl_package_repo"].choices = choices
