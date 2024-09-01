from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from celery import task, shared_task
from celery.utils.log import get_task_logger


@task
def send_emails_to_users(users=None, message="Here is the message."):
    if users is None:
        users = User.objects.all()

    users_instances = []
    for user in users:
        user = User.objects.filter(id=user)
        print(user.email)
        users_instances.append(user)

    users_emails = [user.email for user in users_instances]

    # sending_mail = send_mail(
    #     "Subject here",
    #     "Here is the message.",
    #     "from@example.com",
    #     [users_emails],
    #     fail_silently=False,
    # )

    # Consider using a Celery task for sending emails asynchronously
    # Replace with your email sending logic (e.g., using a Celery task)
    sending_mail = send_mail(
        subject="Subject here",
        message=message,
        from_email=settings.EMAIL_HOST_USER,  # Retrieve from settings
        recipient_list=users_emails,
        fail_silently=False,
    )

    print("Voila, Email Sent to " + str(len(users)) + " users")
    return sending_mail


# @shared_task(bind=True)
# def send_failed_task_email(self, task_id, task_name, error_message):
#     # Retrieve the user associated with the task (if applicable)
#     user = get_user_from_task_id(task_id)  # Implement this function to get the user

#     # Render the email template with context
#     subject = "Failed Celery Task: {}".format(task_name)
#     template_name = "failed_task_email.html"  # Replace with your template name
#     context = {
#         "task_name": task_name,
#         "error_message": error_message,
#         "user": user,  # Include user details if applicable
#     }
#     html_content = render_to_string(template_name, context)

#     # Create the email message
#     message = EmailMessage(
#         subject=subject,
#         body=html_content,
#         from_email=settings.DEFAULT_FROM_EMAIL,
#         to=[user.email] if user else [],  # Send to the user if available
#         bcc=[settings.ADMIN_EMAIL],  # Send a copy to the admin
#     )

#     # Attach any necessary files (optional)
#     attachment_path = "path/to/your/attachment.pdf"  # Replace with the actual path
#     with open(attachment_path, "rb") as f:
#         message.attach(
#             filename="attachment.pdf", content=f.read(), content_type="application/pdf"
#         )

#     # Send the email asynchronously
#     message.send(fail_silently=False)
