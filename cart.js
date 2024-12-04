let label = document.getElementById("label");
let ShoppingCart = document.getElementById("shopping-cart");
let basket = JSON.parse(localStorage.getItem("data")) || [];

let calculation = () => {
  let cartIcon = document.getElementById("cartAmount");
  // !  x and y are x is the previous number and y is the current number..so in the array you will add 0th and 1st array object which will be x and 2nd array object which will be y
  cartIcon.innerHTML = basket.map((x) => x.item).reduce((x, y) => x + y, 0);
  //   console.log("calc function is running");
};
calculation();

let generateCartItems = () => {
  if (basket.length !== 0) {
    return (ShoppingCart.innerHTML = basket
      .map((x) => {
        // console.log(x);
        let { id, item } = x;
        let search = shopItemsData.find((y) => y.id === id) || [];
        // destructuring an object
        let { img, name, price } = search;
        let priceInCents = Math.round(price);
        return `
    <div class = "cart-item" onclick="viewProduct('${id}')">
    <img width="100" src=${img} alt=${name} />
    <div class="details">
        <div class="title-price-x">
            <h4 class="title-price"> 
                <p>${name}</p>
                <p class="cart-item-price">${search.price}</p>
            </h4>
            <i onclick="removeItem('${id}', event)" class="fa-solid fa-x fa-lg" style="color: #ff0000"></i>
        </div>
        <div class="buttons">
              <i onclick="decrement('${id}', event)" class="fa-solid fa-minus fa-lg" style="color: #970c0c"></i>
              <div id="${id}" class="quantity">${item}</div>
              <i onclick="increment('${id}', event)" class="fa-solid fa-plus fa-lg" style="color: #4b7e0c"></i>
            </div>
        <h3>${item * priceInCents}</h3>
    </div>
    </div>
    `;
      })
      .join(""));
  } else {
    ShoppingCart.innerHTML = ``;
    label.innerHTML = `
      <h2>Cart is empty</h2>
      <a href="index.html">
      <button class="HomeBtn">Back to home</button>
      </a>`;
  }
};

generateCartItems();

let viewProduct = (id) => {
  let product = shopItemsData.find((x) => x.id === id);
  localStorage.setItem("selectedProduct", JSON.stringify(product));
  window.location.href = "index.html";
};

// this function is responsible for increasing the quantity
let increment = (id, event) => {
  if (event) event.stopPropagation();
  let selectedItem = id;
  //   ! with find we are going to search whether the object actually exists or not
  //   ? this argument x is going to check all the objects one by one
  //   ! so basically this line is searching for one thing which is the item that you selected
  let search = basket.find((x) => x.id === selectedItem);
  if (search === undefined) {
    basket.push({
      id: selectedItem,
      item: 1,
    });
  } else {
    search.item += 1;
  }
  //   console.log(basket);
  generateCartItems();
  update(selectedItem);
  localStorage.setItem("data", JSON.stringify(basket));
};

// this function is responsible for decreasing the quantity
let decrement = (id, event) => {
  if (event) event.stopPropagation();
  let selectedItem = id;
  let search = basket.find((x) => x.id === selectedItem);
  if (search === undefined) return;
  if (search.item === 0) return;
  else {
    search.item -= 1;
  }
  update(selectedItem);
  basket = basket.filter((x) => x.item !== 0);
  generateCartItems();
  localStorage.setItem("data", JSON.stringify(basket));
  //   console.log(basket);
};

// this func is responsible for updating the quantity in numbers display
let update = (id) => {
  let search = basket.find((x) => x.id === id) || { item: 0 };
  //   console.log(search.item);
  document.getElementById(id).innerHTML = search.item;
  calculation();
  TotalAmount();
};

let removeItem = (id, event) => {
  event.stopPropagation();
  let selectedItem = id;
  // console.log(selectedItem);
  basket = basket.filter((x) => x.id !== selectedItem);
  generateCartItems();
  TotalAmount();
  calculation();
  localStorage.setItem("data", JSON.stringify(basket));
};

let clearCart = () => {
  basket = [];
  generateCartItems();
  calculation();
  localStorage.setItem("data", JSON.stringify(basket));
};

let TotalAmount = () => {
  if (basket.length !== 0) {
    let amount = basket
      .map((x) => {
        let { item, id } = x;
        let search = shopItemsData.find((y) => y.id === id) || [];
        let priceInCents = Math.round(search.price * 100);
        return item * search.price;
      })
      .reduce((x, y) => x + y, 0);
    // console.log(amount);
    label.innerHTML = `
    <h2>Total Bill: $ ${amount}</h2>
    <button id="checkout-btn" onclick="handleCheckout()" class="checkout">Checkout</button>
    <button onclick="clearCart()" class="removeAll">Clear Cart</button>
    `;
  } else return;
};

TotalAmount();

const stripe = Stripe(
  "pk_test_51QS14QRxv517xGDuqk9cp3pizPNmPA97xwE2KjoHlxbjtbbZEd2WTUVghN80u21WVs8VsfBRvP2pr6wCZyV6tdEM00CYtcSDLT"
);

const handleCheckout = async () => {
  // preparing the cart data
  const basket = JSON.parse(localStorage.getItem("data")) || [];
  const items = basket.map((item) => {
    const product = shopItemsData.find((x) => x.id === item.id);
    const priceInCents = Math.round(product.price * 100);
    return {
      name: product.name,
      quantity: item.item,
      price: priceInCents,
    };
  });
  if (items.length === 0) {
    alert("Your cart is empty!!");
    return;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:3000/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      }
    );

    const session = await response.json();
    if (session.id) {
      await stripe.redirectToCheckout({ sessionId: session.id });
    } else {
      throw new Error("Failed to create checkout session");
    }
  } catch (error) {
    console.error("Error during checkout:", error.message);
    alert("An error occured..so please try again later");
  }
};
