let shop = document.getElementById("shop");
let searchBar = document.getElementById("search-bar");

let basket = JSON.parse(localStorage.getItem("data")) || [];

// !esx arrow function
// ?`` these are used to make template literals
let generateShop = (data) => {
  return (shop.innerHTML = data
    .map((x) => {
      let { id, name, price, desc, img } = x;
      let search = basket.find((x) => x.id === id) || [];
      return `
  <div id="product-id-${id}" class="item" onclick="viewProductDetails('${id}')">
        <img width="220" src=${img} alt="" />
        <div class="details">
          <h3>${name}</h3>
          
          <div class="price-quantity">
            <h2>$${price}</h2>
            <div class="buttons">
              <i onclick="decrement('${id}', event)" class="fa-solid fa-minus fa-lg" style="color: #970c0c"></i>
              <div id="${id}" class="quantity">
              ${search.item || 0} 
              </div>
              <i onclick="increment('${id}', event)" class="fa-solid fa-plus fa-lg" style="color: #4b7e0c"></i>
            </div>
          </div>
        </div>
      </div>
  `;
    })
    .join(""));
};

searchBar.addEventListener("input", () => {
  filterProducts();
});

// ! filtered products based on the search
let filterProducts = () => {
  let query = searchBar.value.toLowerCase();
  let filteredData = shopItemsData.filter((item) =>
    item.name.toLowerCase().includes(query)
  );
  generateShop(filteredData);
};

// ? initial rendering with all products
generateShop(shopItemsData);

// this func is responsible for increasing the quantity
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
  update(selectedItem);
  localStorage.setItem("data", JSON.stringify(basket));
};

// this func is responsible for decresing the quantity
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
  localStorage.setItem("data", JSON.stringify(basket));
  //   console.log(basket);
};

// this func is responsible for updating the quantity in numbers display
let update = (id) => {
  let search = basket.find((x) => x.id === id) || { item: 0 };
  //   console.log(search.item);
  document.getElementById(id).innerHTML = search.item;
  calculation();
};

// ! this func is going to add all the numbers in the item and show it in the cart icon
let calculation = () => {
  let cartIcon = document.getElementById("cartAmount");
  //   ! x and y are x is the previous number and y is the current number..so in the array you will add 0th and 1st array object which will be x and 2nd array object which will be y
  cartIcon.innerHTML = basket.map((x) => x.item).reduce((x, y) => x + y, 0);
  //   console.log("calc func is running");
};
calculation();

document.addEventListener("DOMContentLoaded", () => {
  let selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));
  if (selectedProduct) {
    showProductPopup(selectedProduct);
    localStorage.removeItem("selectedProduct");
  }
});

let viewProductDetails = (id) => {
  let product = shopItemsData.find((x) => x.id === id);
  showProductPopup(product);
};

// here &times; will display us the X sign/symbol
let showProductPopup = (product) => {
  let { img, name, price, desc } = product;
  let popup = document.createElement("div");
  popup.className = "product-popup";
  popup.innerHTML = `
  <div class="popup-content">
    <span class = "close-btn" onclick="closePopup()">&times;</span>
    <img src="${img}" alt="${name}" width="300" />
    <h2>${name}</h2>
    <p>${desc}</p>
    <h3> Price: $${price}</h3>
  </div>
  `;
  document.body.appendChild(popup);
};

let closePopup = () => {
  let popup = document.querySelector(".product-popup");
  if (popup) {
    popup.remove();
  }
};
