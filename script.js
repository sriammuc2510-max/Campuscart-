const prices = {
    ragi: 20,
    eggs: 10,
    salads: 20,
    milk: 20
};

const itemNames = {
    ragi: "Ragi Java",
    eggs: "Eggs",
    salads: "Fresh Salad",
    milk: "Milk"
};

const cart = {
    ragi: 0,
    eggs: 0,
    salads: 0,
    milk: 0
};

function getSelectedQuantities() {
    const quantities = {};

    for (const item in prices) {
        quantities[item] = Number(
            document.getElementById(item).value
        ) || 0;
    }

    return quantities;
}

function getCartTotal() {
    let total = 0;

    for (const item in cart) {
        total += cart[item] * prices[item];
    }

    return total;
}

function renderCart() {
    const cartDetails = document.getElementById("cartDetails");
    cartDetails.replaceChildren();

    let hasItems = false;

    for (const item in cart) {
        if (cart[item] > 0) {
            hasItems = true;

            const row = document.createElement("p");
            const subtotal = cart[item] * prices[item];

            row.textContent =
                `${itemNames[item]} × ${cart[item]} = ₹${subtotal}`;

            cartDetails.appendChild(row);
        }
    }

    if (!hasItems) {
        cartDetails.textContent = "Your cart is empty.";
    }

    const total = getCartTotal();

    document.getElementById("total").textContent =
        `Total: ₹${total}`;

    document.getElementById("orderTotal").textContent =
        `₹${total}`;
}

function addSelectedItemsToCart() {
    const quantities = getSelectedQuantities();
    let addedSomething = false;

    for (const item in quantities) {
        if (quantities[item] > 0) {
            cart[item] += quantities[item];
            addedSomething = true;
        }
    }

    const message = document.getElementById("cartActionMessage");

    if (!addedSomething) {
        message.textContent =
            "Please select at least one food item.";
        return;
    }

    for (const item in prices) {
        document.getElementById(item).value = "0";
    }

    message.textContent = "Items added to cart successfully.";
    renderCart();
}

function clearCart() {
    for (const item in cart) {
        cart[item] = 0;
        document.getElementById(item).value = "0";
    }

    document.getElementById("cartActionMessage").textContent =
        "Your cart has been cleared.";

    renderCart();
}

async function placeOrder(event) {
    event.preventDefault();

    const message = document.getElementById("message");
    const orderButton = document.getElementById("placeOrderButton");

    if (getCartTotal() <= 0) {
        message.textContent =
            "Your cart is empty. Please add items first.";
        return;
    }

    const form = document.getElementById("orderForm");

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Check Firebase initialization.
    if (
        typeof firebase === "undefined" ||
        !firebase.apps ||
        firebase.apps.length === 0
    ) {
        message.textContent =
            "Firebase is not initialized. Check firebase-config.js.";
        console.error("Firebase initialization failed.");
        return;
    }

    const db = window.db;

    if (!db) {
        message.textContent =
            "Firestore is unavailable. Check your Firebase setup.";
        console.error("Firestore database instance is missing.");
        return;
    }

    const customerName =
        document.getElementById("customerName").value.trim();

    const mobileNumber =
        document.getElementById("phone").value.trim();

    const deliveryAddress =
        document.getElementById("address").value.trim();

    const items = {};

    for (const item in cart) {
        if (cart[item] > 0) {
            items[item] = {
                name: itemNames[item],
                quantity: cart[item],
                price: prices[item],
                subtotal: cart[item] * prices[item]
            };
        }
    }

    const total = getCartTotal();

    const orderData = {
        customerName: customerName,
        mobileNumber: mobileNumber,
        deliveryAddress: deliveryAddress,
        paymentMethod: "Cash on Delivery",
        items: items,
        total: total,
        status: "Pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    orderButton.disabled = true;
    message.textContent = "Saving your order...";

    try {
        const result = await db.collection("orders").add(orderData);

        console.log("Order saved successfully. Document ID:", result.id);

        message.textContent =
            `Order placed successfully! Order ID: ${result.id}. Total: ₹${total}`;

        // Clear the cart only after Firestore confirms the save.
        for (const item in cart) {
            cart[item] = 0;
        }

        form.reset();

        document.getElementById("cartActionMessage").textContent =
            "Your order has been placed.";

        renderCart();

    } catch (error) {
        console.error("Error saving order:", error);

        if (error.code === "permission-denied") {
            message.textContent =
                "Permission denied. Check your Firestore security rules.";
        } else if (error.code === "unavailable") {
            message.textContent =
                "Firebase is unavailable. Check your internet connection.";
        } else {
            message.textContent =
                `Order could not be saved: ${error.message}`;
        }
    } finally {
        orderButton.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("addToCartButton")
        .addEventListener("click", addSelectedItemsToCart);

    document.getElementById("clearCartButton")
        .addEventListener("click", clearCart);

    document.getElementById("orderForm")
        .addEventListener("submit", placeOrder);

    renderCart();

    console.log(
        typeof firebase !== "undefined" && firebase.apps.length
            ? "Firebase is initialized."
            : "Firebase is NOT initialized."
    );
});

