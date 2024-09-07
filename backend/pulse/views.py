from django.shortcuts import render


# Create your views here.
def index(request):
    context = {"title": "Welcome to my website 2"}
    return render(request, "pulse/index.html", context)


# Create your views here.
# def index_2(request):
#     context = {"title": "Welcome to my website 2"}
#     return render(request, "pulse/index_2.html", context)


def index_dynamic(request, test_run=1):
    # Your logic to fetch data based on page number
    # This is a placeholder, replace it with your actual logic
    # data = get_data_for_page(page_number)
    print(f"Request is : {request}")
    test_run = request.GET.get("test_run")
    print(f"Page number is : {test_run}")

    context = {
        "title": f"Welcome to live logs for Test Run {test_run}",
        "test_run": test_run,
    }
    return render(request, "pulse/index.html", context)
