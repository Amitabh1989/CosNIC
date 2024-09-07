from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    tags = models.ManyToManyField(Tag, related_name='products')

    def __str__(self):
        return self.name

class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Order {self.id} by {self.customer.name}'

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.quantity} of {self.product.name}'

    class Meta:
        unique_together = ('order', 'product')




# Serializers
from rest_framework import serializers
from .models import Customer, Product, Tag, Order, OrderItem

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = serializers.StringRelatedField()

    class Meta:
        model = Order
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    orders = OrderSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'





# Sample creation

# Create a customer
customer = Customer.objects.create(name='John Doe', email='john.doe@example.com')

# Create tags
tag1 = Tag.objects.create(name='Electronics')
tag2 = Tag.objects.create(name='Gadgets')

# Create products
product1 = Product.objects.create(name='Smartphone', price=699.99)
product1.tags.add(tag1, tag2)

product2 = Product.objects.create(name='Laptop', price=1299.99)
product2.tags.add(tag1)

# Create an order
order = Order.objects.create(customer=customer)

# Add products to the order with quantities
OrderItem.objects.create(order=order, product=product1, quantity=2)
OrderItem.objects.create(order=order, product=product2, quantity=1)




# Sample Order JOSN
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "orders": [
        {
            "customer": "John Doe",
            "created_at": "2023-08-03T10:00:00Z",
            "items": [
                {
                    "product": {
                        "name": "Smartphone",
                        "price": "699.99",
                        "tags": [
                            {"name": "Electronics"},
                            {"name": "Gadgets"}
                        ]
                    },
                    "quantity": 2
                },
                {
                    "product": {
                        "name": "Laptop",
                        "price": "1299.99",
                        "tags": [
                            {"name": "Electronics"}
                        ]
                    },
                    "quantity": 1
                }
            ]
        }
    ]
}
